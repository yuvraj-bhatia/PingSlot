// apmac-ui/src/app/api/chatbot/route.ts
// STABILIZATION: Now persists chat sessions to database instead of in-memory Map
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface QuickAction {
  id: string;
  label: string;
  action: string;
  icon?: string;
}

type ChatHistoryItem = { role: "user" | "assistant"; content: string };
type ChatSessionWithMessages = Awaited<
  ReturnType<typeof prisma.chatSession.create>
>;

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "current-page",
    label: "Help with current page",
    action: "help_current_page",
    icon: "📄",
  },
  {
    id: "raise-ticket",
    label: "Raise a support ticket",
    action: "raise_ticket",
    icon: "🎫",
  },
  {
    id: "account-settings",
    label: "Account settings help",
    action: "account_settings",
    icon: "⚙️",
  },
  {
    id: "analytics-help",
    label: "Analytics questions",
    action: "analytics_help",
    icon: "📊",
  },
  { id: "billing", label: "Billing & payments", action: "billing", icon: "💳" },
  { id: "tutorials", label: "View tutorials", action: "tutorials", icon: "📚" },
  { id: "other", label: "Other / Chat with AI", action: "chat", icon: "💬" },
];

// Direct Gemini API call function
async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("No API key");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Extract text from response
  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error("Invalid response format from Gemini");
}

// Load or create chat session from database
async function getOrCreateChatSession(
  sessionId: string | null,
  userId: string,
  currentPage?: string,
): Promise<{
  session: ChatSessionWithMessages;
  history: ChatHistoryItem[];
}> {
  // Try to find existing session
  if (sessionId) {
    const existingSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 20, // Limit history
        },
      },
    });

    if (existingSession) {
      const history = existingSession.messages.map((msg) => {
        const role: ChatHistoryItem["role"] =
          msg.sender === "USER" ? "user" : "assistant";
        return {
          role,
          content: msg.content,
        };
      });
      return { session: existingSession, history };
    }
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: userId },
    select: { id: true },
  });

  // Create new session
  const newSession = await prisma.chatSession.create({
    data: {
      userId: user?.id || null,
      pageKey: currentPage || null,
      isResolved: false,
    },
    include: {
      messages: true,
    },
  });

  return { session: newSession, history: [] };
}

// Save message to database
async function saveMessage(
  sessionId: string,
  sender: "USER" | "BOT",
  content: string,
  userId?: string,
): Promise<void> {
  // Find user by email if provided
  let dbUserId: string | null = null;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { email: userId },
      select: { id: true },
    });
    dbUserId = user?.id || null;
  }

  await prisma.chatMessage.create({
    data: {
      sessionId,
      sender,
      content,
      userId: dbUserId,
    },
  });

  // Update session timestamp
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() },
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message, action, currentPage, sessionId } = body;

    const userId = session.user.email;

    // Get or create chat session from database
    const { session: chatSession, history } = await getOrCreateChatSession(
      sessionId,
      userId,
      currentPage,
    );

    // Handle quick actions
    if (action && action !== "chat") {
      const response = await handleQuickAction(action, currentPage, session);
      return NextResponse.json({
        response: response.message,
        type: response.type,
        quickActions: QUICK_ACTIONS,
        sessionId: chatSession.id,
        metadata: response.metadata,
      });
    }

    // Handle chat
    if (message) {
      // Save user message to database
      await saveMessage(chatSession.id, "USER", message, userId);

      // Add to history for context
      history.push({ role: "user", content: message });

      let responseText: string;

      // Try Gemini API with direct fetch
      try {
        const context = await buildRAGContext(
          userId,
          message,
          history,
          currentPage,
        );

        const prompt = `You are APMAC Assistant, a helpful AI chatbot for the APMAC sales productivity platform.

Context about the user and platform:
${context}

Recent conversation:
${history
  .slice(-5)
  .map((msg) => `${msg.role}: ${msg.content}`)
  .join("\n")}

Current page: ${currentPage || "Unknown"}

User message: ${message}

Provide a helpful, concise response. If the user needs to navigate somewhere, suggest it. Keep responses under 150 words unless detailed explanation is needed.`;

        responseText = await callGeminiAPI(prompt);
        console.log("Gemini API response received");
      } catch (geminiError) {
        const message =
          geminiError instanceof Error ? geminiError.message : "Unknown error";
        console.warn("Gemini API failed, using fallback:", message);
        responseText = generateIntelligentFallback(
          message,
          currentPage,
          history,
        );
      }

      // Save bot response to database
      await saveMessage(chatSession.id, "BOT", responseText);

      return NextResponse.json({
        response: responseText,
        type: "chat",
        quickActions: QUICK_ACTIONS,
        sessionId: chatSession.id,
        suggestions: generateSuggestions(message, currentPage),
      });
    }

    // Default: return quick actions
    return NextResponse.json({
      response: "Hi! I'm your APMAC Assistant. How can I help you today?",
      type: "welcome",
      quickActions: QUICK_ACTIONS,
      sessionId: chatSession.id,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}

// GET endpoint to retrieve chat history
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      // Return user's recent chat sessions
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (!user) {
        return NextResponse.json({ sessions: [] });
      }

      const sessions = await prisma.chatSession.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      return NextResponse.json({ sessions });
    }

    // Return specific session with messages
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session: chatSession });
  } catch (error) {
    console.error("Chatbot GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve chat history" },
      { status: 500 },
    );
  }
}

async function handleQuickAction(
  action: string,
  currentPage: string,
  _session: unknown,
) {
  switch (action) {
    case "help_current_page":
      return {
        message: getPageHelp(currentPage),
        type: "page_help",
        metadata: { page: currentPage },
      };

    case "raise_ticket":
      return {
        message:
          "I'll redirect you to our support ticketing system where you can:\n\n• Create a new support ticket\n• Track existing tickets\n• View ticket history\n• Get help from our support team\n\nOur team typically responds within 24 hours. Redirecting you now...",
        type: "redirect",
        metadata: { url: "/support" },
      };

    case "account_settings":
      return {
        message:
          "Here are the account settings you can manage:\n\n📝 Profile Information (/settings/profile)\n• Update your name and contact details\n• Change profile picture\n• Edit company information\n\n🔒 Security (/settings/security)\n• Change password\n• Enable two-factor authentication\n• Manage security preferences\n\n🔔 Notifications (/settings/notifications)\n• Email preferences\n• Push notification settings\n• Alert configurations\n\n🔐 Privacy (/settings/privacy)\n• Data privacy settings\n• Export your data\n• Account management\n\nWhich setting would you like to update?",
        type: "info",
      };

    case "analytics_help":
      return {
        message:
          "Our Analytics Dashboard provides comprehensive insights:\n\n📊 Key Features:\n• Sales performance tracking\n• Team productivity metrics\n• AI model predictions and regression fit metrics (R², RMSE, MAE)\n• Custom report generation\n• Data export options\n• Real-time dashboards\n\n🎯 Common Tasks:\n• Filter by date range\n• Compare team performance\n• Track individual metrics\n• Export to Excel/CSV\n\nVisit /analytics to explore. Need help with a specific metric or report?",
        type: "info",
        metadata: { suggestedPage: "/analytics" },
      };

    case "billing":
      return {
        message:
          "Billing & Payment Options:\n\n💳 Current Plan\n• View your subscription details\n• Check plan features\n• See renewal date\n\n📋 Payment History\n• Download invoices\n• View past payments\n• Update payment method\n\n⬆️ Upgrade Options\n• Compare plans\n• Unlock premium features\n• Contact sales for enterprise\n\nNote: For specific billing questions, please contact our support team or visit /settings/billing",
        type: "info",
      };

    case "tutorials":
      return {
        message:
          "📚 Tutorial Library (/tutorials):\n\n🎯 Getting Started\n• Platform overview\n• First steps guide\n• Account setup\n\n🎥 Video Tutorials\n• Feature walkthroughs\n• Best practices\n• Advanced techniques\n\n📖 Documentation\n• User guides\n• API documentation\n• FAQ section\n\n💡 Interactive Guides\n• Step-by-step walkthroughs\n• Hands-on exercises\n• Real-world examples\n\nWhat would you like to learn about?",
        type: "info",
        metadata: { url: "/tutorials" },
      };

    default:
      return {
        message: "I'm ready to help! Feel free to ask me anything about APMAC.",
        type: "chat",
      };
  }
}

function getPageHelp(page: string): string {
  const pageHelp: Record<string, string> = {
    "/": "Welcome to APMAC! This is your home page where you can:\n\n• Learn about our features\n• Sign up or sign in\n• Explore our platform\n• Access quick links\n\nReady to get started?",

    "/dashboard":
      "📊 Dashboard Overview:\n\nYour dashboard displays:\n• Key performance metrics\n• Recent activities\n• Quick actions\n• Team performance\n• Customizable widgets\n\nYou can personalize your dashboard by dragging and dropping widgets. Need help with a specific metric?",

    "/analytics":
      "📈 Analytics Page:\n\nHere you can:\n• View detailed performance reports\n• Track sales metrics\n• Analyze AI predictions\n• Export data\n• Create custom reports\n• Filter by date range\n\nUse the filters at the top to customize your view. What insights are you looking for?",

    "/settings":
      "⚙️ Settings Hub:\n\nManage your:\n• Profile information\n• Security settings\n• Notifications\n• Privacy preferences\n• Account permissions\n\nUse the sidebar to navigate between different settings sections.",

    "/settings/profile":
      "👤 Profile Settings:\n\nUpdate your:\n• Name and contact info\n• Profile picture\n• Company details\n• Role and department\n\nChanges are saved automatically when you click 'Save Changes'.",

    "/settings/security":
      "🔒 Security Settings:\n\nProtect your account:\n• Change password\n• Enable 2FA (coming soon)\n• Review login history\n• Manage sessions\n\nWe recommend enabling two-factor authentication when it becomes available.",

    "/settings/notifications":
      "🔔 Notification Preferences:\n\nControl:\n• Email notifications\n• Push notifications\n• Alert frequency\n• Communication preferences\n\nCustomize how and when you receive updates from APMAC.",

    "/support":
      "🎫 Support Center:\n\nGet help:\n• Create support tickets\n• Track existing tickets\n• View ticket history\n• Contact our team\n• Browse FAQs\n\nOur support team typically responds within 24 hours.",

    "/tutorials":
      "📚 Learning Center:\n\nAccess:\n• Getting started guides\n• Video tutorials\n• Feature documentation\n• Best practices\n• Interactive walkthroughs\n\nSearch for specific topics or browse by category.",
  };

  const basePath = page.split("?")[0];
  return (
    pageHelp[basePath] ||
    `You're currently viewing: ${page}\n\nI can help you navigate or answer questions about this page. What would you like to know?`
  );
}

async function buildRAGContext(
  userId: string,
  _message: string,
  _history: ChatHistoryItem[],
  currentPage?: string,
): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: userId },
      select: {
        firstName: true,
        lastName: true,
        companyName: true,
        role: true,
        department: true,
      },
    });

    const knowledgeBase = `
APMAC Platform Knowledge Base:

Platform Purpose:
- AI-powered sales productivity and analytics platform
- Helps teams track performance and make data-driven decisions
- Provides predictive insights using machine learning

User Information:
- Name: ${user?.firstName} ${user?.lastName}
- Company: ${user?.companyName}
- Role: ${user?.role || "Team Member"}
- Department: ${user?.department || "Not specified"}

Available Features:
- Dashboard: Overview metrics and quick actions
- Analytics: Detailed reports and insights
- AI Models: Predictive analytics and recommendations
- Settings: Account and preference management
- Support: Ticketing and help resources
- Tutorials: Learning materials and guides

Navigation:
- Main pages: /dashboard, /analytics, /settings, /support, /tutorials
- Settings sections: profile, security, notifications, privacy, permissions
`;

    let pageContext = "";
    if (currentPage) {
      pageContext = `\n\nCurrent Location:\nPage: ${currentPage}\n${getPageHelp(currentPage)}`;
    }

    return knowledgeBase + pageContext;
  } catch (error) {
    console.error("Error building context:", error);
    return "APMAC - AI-powered sales productivity platform";
  }
}

function generateIntelligentFallback(
  message: string,
  currentPage?: string,
  _history?: ChatHistoryItem[],
): string {
  const lowerMessage = message.toLowerCase();

  // Check for greetings
  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening)/.test(
      lowerMessage,
    )
  ) {
    return `Hello! I'm your APMAC Assistant. I can help you with:

- Navigating the platform
- Understanding features
- Creating support tickets
- Finding tutorials
- Answering questions

What would you like help with today?`;
  }

  // Page-specific help
  if (
    (lowerMessage.includes("help") ||
      lowerMessage.includes("what") ||
      lowerMessage.includes("how")) &&
    currentPage
  ) {
    return getPageHelp(currentPage);
  }

  // Support/Tickets
  if (
    lowerMessage.includes("ticket") ||
    lowerMessage.includes("support") ||
    lowerMessage.includes("help desk")
  ) {
    return `To get support:\n\n1. Click "Raise a support ticket" above, or\n2. Visit /support directly\n3. Fill out the ticket form\n4. Our team will respond within 24 hours\n\nYou can also track existing tickets on the support page. Would you like me to redirect you there?`;
  }

  // Password/Security
  if (
    lowerMessage.includes("password") ||
    lowerMessage.includes("reset") ||
    lowerMessage.includes("security")
  ) {
    return `For password and security:\n\n🔒 Change Password:\nGo to Settings > Security > Change Password\n\n🔐 Enable 2FA:\nTwo-factor authentication is coming soon\n\n🔑 Forgot Password:\nUse the "Forgot Password" link on the login page\n\nNeed help with a specific security setting?`;
  }

  // Analytics
  if (
    lowerMessage.includes("analytics") ||
    lowerMessage.includes("report") ||
    lowerMessage.includes("data") ||
    lowerMessage.includes("metric")
  ) {
    return `Analytics & Reports:\n\n📊 View Analytics:\nVisit /analytics for detailed insights\n\n📈 Available Reports:\n• Sales performance\n• Team productivity\n• AI predictions\n• Custom reports\n\n💾 Export Data:\nUse the export button on the analytics page\n\nWhat specific data are you looking for?`;
  }

  // Tutorials/Learning
  if (
    lowerMessage.includes("tutorial") ||
    lowerMessage.includes("learn") ||
    lowerMessage.includes("guide") ||
    lowerMessage.includes("how to")
  ) {
    return `Learning Resources:\n\n📚 Tutorial Library: /tutorials\n\n📖 Available Content:\n• Getting started guides\n• Video walkthroughs\n• Feature documentation\n• Best practices\n• Interactive demos\n\n💡 Quick Tips:\n• Use the search bar to find specific topics\n• Start with "Getting Started" if you're new\n• Check video tutorials for visual guidance\n\nWhat would you like to learn about?`;
  }

  // Settings/Account
  if (
    lowerMessage.includes("setting") ||
    lowerMessage.includes("account") ||
    lowerMessage.includes("profile") ||
    lowerMessage.includes("preference")
  ) {
    return `Account Settings:\n\n⚙️ Access Settings: /settings\n\n📋 Available Options:\n• Profile: Personal information\n• Security: Password & 2FA\n• Notifications: Email & alerts\n• Privacy: Data preferences\n• Permissions: Role management\n\nWhich setting would you like to update?`;
  }

  // Dashboard
  if (
    lowerMessage.includes("dashboard") ||
    lowerMessage.includes("home") ||
    lowerMessage.includes("overview")
  ) {
    return `Dashboard Help:\n\n📊 Your dashboard shows:\n• Key performance metrics\n• Recent activities\n• Quick actions\n• Team overview\n\n✨ Customization:\n• Drag and drop widgets\n• Click on metrics for details\n• Use filters to focus on specific data\n\nCurrently on dashboard? Let me know what you'd like to see!`;
  }

  // Navigation help
  if (
    lowerMessage.includes("where") ||
    lowerMessage.includes("find") ||
    lowerMessage.includes("navigate") ||
    lowerMessage.includes("go to")
  ) {
    return `Navigation Help:\n\n🗺️ Main Pages:\n• /dashboard - Your main hub\n• /analytics - Detailed reports\n• /settings - Account preferences\n• /support - Get help\n• /tutorials - Learn more\n\n📱 Use the sidebar menu to navigate quickly between sections.\n\nWhere would you like to go?`;
  }

  // Generic contextual response
  if (currentPage) {
    return `I'm here to help! ${getPageHelp(currentPage)}\n\nYou can also ask me about:\n• Other platform features\n• Creating support tickets\n• Finding tutorials\n• Account settings\n\nWhat specific question do you have?`;
  }

  // Ultimate fallback
  return `I'm your APMAC Assistant! I can help you with:

🏠 Navigation & Features
- Understand what each page does
- Find specific features
- Learn shortcuts

🎫 Support & Help
- Create support tickets
- Track existing tickets
- Get quick answers

📚 Learning & Tutorials
- Find guides and documentation
- Watch video tutorials
- Learn best practices

⚙️ Settings & Account
- Update profile information
- Manage security settings
- Configure notifications

What would you like help with?`;
}

function generateSuggestions(message: string, currentPage?: string): string[] {
  const suggestions: string[] = [];
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("password") || lowerMessage.includes("security")) {
    suggestions.push("How to change my password?");
    suggestions.push("When will 2FA be available?");
  } else if (
    lowerMessage.includes("analytics") ||
    lowerMessage.includes("report")
  ) {
    suggestions.push("Export analytics data");
    suggestions.push("Create custom reports");
  } else if (
    lowerMessage.includes("ticket") ||
    lowerMessage.includes("support")
  ) {
    suggestions.push("Track my support tickets");
    suggestions.push("Contact support team");
  } else if (currentPage?.includes("/dashboard")) {
    suggestions.push("Customize my dashboard");
    suggestions.push("What metrics are available?");
  } else if (currentPage?.includes("/analytics")) {
    suggestions.push("Filter analytics by date");
    suggestions.push("Export data to CSV");
  } else {
    suggestions.push("Show me tutorials");
    suggestions.push("Help with current page");
    suggestions.push("Contact support");
  }

  return suggestions.slice(0, 3);
}

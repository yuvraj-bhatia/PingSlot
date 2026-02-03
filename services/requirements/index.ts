import { createHash } from "crypto";
import { parsePdf } from "./reducto";
import { extractRequirements } from "./extractor";
import prisma from "@/lib/backend/db";
import type { RequirementItem } from "@/lib/types";

export interface RequirementsService {
  extract(sourceUrl: string): Promise<RequirementItem[]>;
  getForTarget(targetId: string): Promise<RequirementItem[] | null>;
}

const MAX_RAW_CONTENT = 50000;

class RequirementsServiceImpl implements RequirementsService {
  async extract(sourceUrl: string): Promise<RequirementItem[]> {
    const isPdf = this.isPdfUrl(sourceUrl);

    const content = isPdf
      ? await parsePdf(sourceUrl)
      : await this.fetchWebContent(sourceUrl);

    if (!content) {
      throw new Error("Unable to extract content from source");
    }

    const items = await extractRequirements(content);
    await this.storeRequirements(sourceUrl, content, items);

    return items;
  }

  async getForTarget(targetId: string): Promise<RequirementItem[] | null> {
    const requirement = await prisma.requirement.findUnique({
      where: { targetId },
    });

    if (!requirement?.items) return null;

    try {
      return JSON.parse(requirement.items) as RequirementItem[];
    } catch {
      return null;
    }
  }

  private isPdfUrl(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.endsWith(".pdf") || lower.includes("/pdf/") || lower.includes("type=pdf");
  }

  private async fetchWebContent(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "PingSlot-Requirements/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch requirements page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  private async storeRequirements(
    sourceUrl: string,
    rawContent: string,
    items: RequirementItem[]
  ): Promise<void> {
    const targets = await prisma.target.findMany({
      where: { requirementsUrl: sourceUrl },
      select: { id: true },
    });

    if (targets.length === 0) return;

    const contentHash = createHash("sha256").update(rawContent).digest("hex");
    const contentSnippet = rawContent.slice(0, MAX_RAW_CONTENT);
    const serializedItems = JSON.stringify(items);

    await Promise.all(
      targets.map((target) =>
        prisma.requirement.upsert({
          where: { targetId: target.id },
          update: {
            sourceUrl,
            items: serializedItems,
            rawContent: contentSnippet,
            contentHash,
          },
          create: {
            targetId: target.id,
            sourceUrl,
            items: serializedItems,
            rawContent: contentSnippet,
            contentHash,
          },
        })
      )
    );
  }
}

export const requirementsService = new RequirementsServiceImpl();

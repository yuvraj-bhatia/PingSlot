# PingSlot

AI-powered appointment monitoring and auto-booking.

![Demo](demo.gif)

## Features

- Monitor appointment pages for availability
- AI-powered availability detection
- Automatic booking with browser automation
- Email notifications
- Requirements extraction from PDFs

## Tech Stack

- Next.js 14, React, TypeScript
- Playwright (browser automation)
- Firecrawl (web scraping)
- Groq (LLM)
- Resend (email)
- Reducto (PDF parsing)

## Quick Start

```bash
git clone https://github.com/you/pingslot
cd pingslot
npm install
cp .env.example .env.local
# Fill in your API keys
npx prisma db push
npm run dev
```

## Demo

Deploy on Vercel and update this link:

```
https://pingslot.vercel.app
```

## License

MIT

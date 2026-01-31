export type FirecrawlScrapeResult = { text: string; url: string };

export async function scrapeToText(url: string): Promise<FirecrawlScrapeResult> {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
        throw new Error("FIRECRAWL_API_KEY missing");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
        const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                url: url,
                formats: ["markdown"]
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            const preview = errorText.substring(0, 300);
            throw new Error(`Firecrawl API error (${response.status}): ${preview}`);
        }

        const json = await response.json() as any;
        const text =
            json?.data?.markdown ??
            json?.markdown ??
            json?.data?.content ??
            "";


        return {
            text,
            url
        };
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

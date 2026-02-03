export async function parsePdf(url: string): Promise<string> {
  const apiKey = process.env.REDUCTO_API_KEY;
  if (!apiKey) {
    throw new Error("REDUCTO_API_KEY is not set");
  }

  const response = await fetch("https://api.reducto.ai/v1/parse", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      output_format: "markdown",
    }),
  });

  if (!response.ok) {
    throw new Error(`Reducto error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    content?: string;
    text?: string;
    data?: {
      content?: string;
      text?: string;
      chunks?: { text?: string }[];
    };
  };

  const content =
    data.content ||
    data.text ||
    data.data?.content ||
    data.data?.text ||
    data.data?.chunks?.map((chunk) => chunk.text || "").join("\n");

  return content?.trim() || "";
}

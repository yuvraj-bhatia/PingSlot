export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const { markdown } = await req.json();

    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json(
        { ok: false, error: "Markdown text is required." },
        { status: 400 },
      );
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const fontSize = 12;
    const textWidth = 560;
    const marginTop = 760;

    // Break Markdown text into lines that fit PDF width
    const lines: string[] = [];
    markdown.split("\n").forEach((line) => {
      const words = line.split(" ");
      let current = "";

      words.forEach((word) => {
        const width = font.widthOfTextAtSize(`${current} ${word}`, fontSize);
        if (width > textWidth) {
          lines.push(current);
          current = word;
        } else {
          current += (current ? " " : "") + word;
        }
      });

      lines.push(current);
    });

    let y = marginTop;

    lines.forEach((line) => {
      if (y < 40) {
        page.drawText("(page trimmed)", {
          x: 20,
          y: 20,
          size: 8,
          font,
        });
        return;
      }

      page.drawText(line, {
        x: 20,
        y,
        size: fontSize,
        font,
      });

      y -= 18;
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=report.pdf",
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to generate PDF." },
      { status: 500 },
    );
  }
}

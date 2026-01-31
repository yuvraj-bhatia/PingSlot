import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RouteContext } from "@/types/route-context";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<"/api/articles/[slug]">,
) {
  const { slug } = await params;
  const article = await prisma.helpArticle.findUnique({ where: { slug } });
  if (!article)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext<"/api/articles/[slug]">,
) {
  const { slug } = await params;
  const body = await req.json();

  try {
    const updated = await prisma.helpArticle.update({
      where: { slug },
      data: {
        title: body.title,
        summary: body.summary,
        contentHtml: body.contentHtml,
        tags: body.tags || [],
        isPublished: !!body.isPublished,
        isFeatured: !!body.isFeatured,
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext<"/api/articles/[slug]">,
) {
  const { slug } = await params;
  try {
    await prisma.helpArticle.delete({ where: { slug } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

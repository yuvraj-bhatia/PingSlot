import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all articles (optionally filter by tag or search query param)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tag = url.searchParams.get("tag");
    const search = url.searchParams.get("search");

    const where: Prisma.HelpArticleWhereInput = {
      isPublished: true, // Only show published articles
    };

    // Add tag filter
    if (tag) {
      where.tags = { has: tag };
    }

    // Add search filter (search in title, summary, and content)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { contentHtml: { contains: search, mode: "insensitive" } },
      ];
    }

    const articles = await prisma.helpArticle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        // CHANGE THIS FROM 'select' TO 'include'
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    console.log(
      `API: Found ${articles.length} articles with search: "${search}", tag: "${tag}"`,
    );
    return NextResponse.json(articles);
  } catch (err) {
    console.error("API Error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST -> create a new article
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.slug || !body.contentHtml) {
      return NextResponse.json(
        { error: "Missing title, slug, or contentHtml" },
        { status: 400 },
      );
    }

    const created = await prisma.helpArticle.create({
      data: {
        title: body.title,
        slug: body.slug,
        summary: body.summary || null,
        contentHtml: body.contentHtml,
        tags: body.tags || [],
        isPublished: !!body.isPublished,
        isFeatured: !!body.isFeatured,
        authorId: body.authorId, // Make sure to include authorId when creating
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/articles error", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import type { ReactNode } from "react";
import ArticlesFooter from "@/components/articles/ArticlesFooter";
import ArticlesHeader from "@/components/articles/ArticlesHeader";

type Props = {
  children: ReactNode;
};

export const metadata = {
  title: "Create Article - APTECH",
  description: "Create a new help article for the knowledge base",
};

export default function ArticleEditorLayout({ children }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      }}
    >
      <ArticlesHeader />
      <main
        style={{
          flex: 1,
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          minHeight: "calc(100vh - 160px)",
        }}
      >
        {children}
      </main>
      <ArticlesFooter />
    </div>
  );
}

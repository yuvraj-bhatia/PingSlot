import type { ReactNode } from "react";
import ArticlesFooter from "@/components/articles/ArticlesFooter";
import ArticlesHeader from "@/components/articles/ArticlesHeader";

type Props = {
  children: ReactNode;
};

export const metadata = {
  title: "Help Articles - APTECH",
  description:
    "Learn how to use APTECH with our comprehensive guides and tutorials",
};

export default function ArticlesLayout({ children }: Props) {
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

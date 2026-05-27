import type { Metadata } from "next";
import { ThemeScript } from "./components/theme-script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flow — 让团队协作，如丝般顺滑",
  description:
    "Flow 是一款为现代团队打造的协作平台。简洁、强大、无处不在。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground">
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}

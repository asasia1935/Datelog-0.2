import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DateLog",
  description: "커플 데이트 기록 서비스 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

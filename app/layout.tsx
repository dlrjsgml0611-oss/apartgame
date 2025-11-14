import type { Metadata } from "next";
import KakaoMapScript from "@/components/KakaoMapScript";
import "./globals.css";

export const metadata: Metadata = {
  title: "부동산 감정가 평가 시스템",
  description: "AI 기반 부동산 감정가 평가 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <KakaoMapScript />
        {children}
      </body>
    </html>
  );
}

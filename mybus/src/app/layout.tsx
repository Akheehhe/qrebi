import type { Metadata } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const notoGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian", "latin"],
  variable: "--font-geo-sans",
});

export const metadata: Metadata = {
  title: {
    default: "MyBus.ge | ავტობუსისა და მიკროავტობუსის ბილეთები ონლაინ",
    template: "%s | MyBus.ge",
  },
  description:
    "საქართველოს ავტობუსებისა და მიკროავტობუსების ერთიანი პლატფორმა. ნახე რეისების განრიგი, დაჯავშნე ადგილი და გადაიხადე ონლაინ, ავტოსადგურზე ლოდინის გარეშე.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ka" className={`${notoGeorgian.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

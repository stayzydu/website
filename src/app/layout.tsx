import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import UserSync from "@/components/UserSync";
import WhatsAppButton from "@/components/WhatsAppButton";
import PromoCTA from "@/components/PromoCTA";
import MobileTabBar from "@/components/MobileTabBar";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HeyStay — Find your perfect PG near Delhi University",
  description: "Verified PGs near Delhi University — rated, reviewed, and ready to move in.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geist.className} antialiased`}>
          <UserSync />
          <PromoCTA />
          {children}
          <WhatsAppButton />
          <MobileTabBar />
        </body>
      </html>
    </ClerkProvider>
  );
}

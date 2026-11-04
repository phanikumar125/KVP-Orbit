import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "KVP Orbit — Career assets, in orbit", description: "Build a resume that moves with you." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}


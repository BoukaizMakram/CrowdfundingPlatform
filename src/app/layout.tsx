import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import SmoothScroll from "@/components/SmoothScroll"
import { AuthProvider } from "@/contexts/AuthContext"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "AlMakram - Crowdfunding for Good",
  description: "The global crowdfunding platform for charitable campaigns. Support medical needs, education, mosques, and community projects worldwide.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="min-h-screen flex flex-col bg-white">
        <AuthProvider>
          <SmoothScroll />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}

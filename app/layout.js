import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { shadesOfPurple } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PMOEZ",
  description: "",
 icons: {
    icon: "https://res.cloudinary.com/djhi71pit/image/upload/v1755934818/PMO-removebg-preview_jmnugo.png",
  },};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: shadesOfPurple,
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#1a202c",
          colorInputBackground: "#2D3748",
          colorInputText: "#F3F4F6",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} animated-dotted-background`}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 mt-12">
  <div className="container mx-auto px-6 py-10">
    <div className="grid grid-cols-1 md:grid-cols-3 items-center">
      
      {/* Branding */}
      <div>
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          PMOEZ
        </h1>
      </div>

      {/* Empty Center (for balance) */}
      <div className="hidden md:block"></div>

      {/* Developers */}
      <div className="flex flex-col items-end">
        <h3 className="text-lg font-semibold text-white mb-4">Developers</h3>
        <ul className="space-y-3 text-right">
          {/* Amisha */}
          <li className="relative group">
            <a
              href="https://www.linkedin.com/in/amisha-kumari-351ab9274/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors font-medium"
            >
              Amisha Kumari
            </a>
            <span className="absolute left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
              Connect
            </span>
          </li>

          {/* Adisesh */}
          <li className="relative group">
            <a
              href="https://www.linkedin.com/in/adisesh-raghavendra-rao-10842528a/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors font-medium"
            >
              Adisesh Raghavendra Rao
            </a>
            <span className="absolute left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
              Connect
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  {/* Bottom Bar */}
  <div className="border-t border-gray-700 py-4">
    <p className="text-center text-sm text-gray-400">
      © {new Date().getFullYear()} All rights reserved by{" "}
      <span className="text-blue-400 font-medium">amisha_devgeek</span>
    </p>
  </div>
</footer>

          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

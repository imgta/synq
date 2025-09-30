import { type Metadata } from 'next';
import { Metric, Untitled, Soehne } from '@/assets/fonts';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import '@/styles/globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "synQ",
  description: "Joint ventures and shared awards",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${Metric.variable} ${Untitled.variable} ${Soehne.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

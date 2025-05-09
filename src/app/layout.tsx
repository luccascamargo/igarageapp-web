import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/userContext";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { Providers } from "@/provider/queryClientProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { UpdatePhone } from "@/components/update-phone";

const inter = Inter({
  subsets: ["latin"],
  style: "normal",
});

export const metadata: Metadata = {
  title: "Anunciei - Facilite sua venda",
  keywords: [
    "Anúncios de veículos Rio Grande do Sul",
    "Compra e venda de carros RS",
    "Plataforma de veículos RS",
    "Carros novos e usados RS",
    "Motos e caminhões à venda RS",
    "Mercado automotivo gaúcho",
    "App de veículos RS",
    "Vender carro no RS",
    "Comprar veículo no Rio Grande do Sul",
    "Anúncios automotivos RS",
  ],
  description:
    "Anunciei - Encontre os melhores anúncios de veículos no Rio Grande do Sul. Compre e venda carros, motos e caminhões na nossa plataforma especializada.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await auth();

  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <AuthProvider user={user}>
            {children} <Analytics />
            {user && !user.phone && <UpdatePhone />}
            <Toaster />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

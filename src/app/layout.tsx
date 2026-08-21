import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorker } from "@/components/ServiceWorker";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Le Rémi — Compteur de score",
  description:
    "Compteur de score intelligent pour le jeu de cartes Le Rémi. Rémi sec, contre, égalités : l'app calcule tout et raconte le résultat. 100 % local, installable.",
  applicationName: "Le Rémi",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Le Rémi",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a2019",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

// Applique le thème avant le premier paint (évite le flash).
const themeInit = `
(function(){
  try {
    var s = JSON.parse(localStorage.getItem('remi:settings') || '{}');
    var t = s.theme || 'dark';
    document.documentElement.setAttribute('data-theme', t);
    if (s.animations) document.documentElement.setAttribute('data-anim', s.animations);
  } catch(e){ document.documentElement.setAttribute('data-theme','dark'); }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-app felt-texture">
        <Providers>{children}</Providers>
        <ServiceWorker />
      </body>
    </html>
  );
}

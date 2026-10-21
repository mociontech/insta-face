import "./globals.css";
import SwRegister from "@/components/SwRegister";
import Integrations from "@/components/Integrations";
import QuickNavigation from "@/components/QuickNavigation";
import { experience } from "@/lib/experience";



export const metadata = {
  title: experience.name,
  description: "Experiencia de fotografia con avatares",
};


export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="touch-manipulation">
        <SwRegister />
        <Integrations />
        {children}
        <QuickNavigation />
      </body>
    </html>
  );
}

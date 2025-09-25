import "./globals.css";
import localFont from "next/font/local";

export const metadata = {
  title: "Face swap",
  description: "Face swap webapp",
};

const oracleFont = localFont({
  src: [
    { path: "./fonts/OracleSans_Lt.ttf", weight: "300", style: "normal" },
    { path: "./fonts/OracleSans_Rg.ttf", weight: "400", style: "normal" },
    { path: "./fonts/OracleSans_Bd.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-oracle",
});

const lorunerFont = localFont({
  src: [
    { path: "./fonts/MKXTitle.ttf", weight: "700", style: "normal" },
    { path: "./fonts/earthrealm.ttf", weight: "400", style: "normal" },
  ],
  variable: "--font-loruner",
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={oracleFont.variable + " " + lorunerFont.variable}>
      <body>{children}</body>
    </html>
  );
}

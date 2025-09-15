import "./globals.css";
import localFont from 'next/font/local'



export const metadata = {
  title: "Face swap",
  description: "Face swap webapp",
};


const oracleFont = localFont({
  src: [
    { path: './fonts/OracleSans_Lt.ttf', weight: '300', style: 'normal' },
    { path: './fonts/OracleSans_Rg.ttf', weight: '400', style: 'normal' },
    { path: './fonts/OracleSans_Bd.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-oracle',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={oracleFont.variable}>
      <body>{children}</body>
    </html>
  );
}

import "./globals.css";

export const metadata = {
  title: "Claro Gaming",
  description: "Face swap webapp",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <link rel="manifest" href="/manifest.json" />
      <body>{children}</body>
    </html>
  );
}

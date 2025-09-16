import './globals.css';
import localFont from 'next/font/local';

export const metadata = {
  title: 'Face swap',
  description: 'Face swap webapp',
};

const muliExtraBold = localFont({
  src: '/fonts/Muli-ExtraBold.ttf',
  weight: '900',
  style: 'normal',
  variable: '--font-muli-bold',
});

const monumentBlack = localFont({
  src: '/fonts/PPMonumentExtended-Black.otf',
  weight: '800',
  style: 'normal',
  variable: '--font-monument-black',
});

const monumentRegular = localFont({
  src: '/fonts/PPMonumentExtended-Regular.otf',
  weight: '400',
  style: 'normal',
  variable: '--font-monument-regular',
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${muliExtraBold.variable} ${monumentBlack.variable} ${monumentRegular.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

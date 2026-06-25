import './globals.css';

export const metadata = {
  title: 'Florist Invoice — Toko Bunga',
  description: 'Buat invoice profesional untuk toko bunga Anda dengan mudah dan cepat.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

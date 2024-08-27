import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'MTN Whatsapp Sender',
	description: 'Send messages to your contacts on whatsapp',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='ar'>
			<body className={inter.className}>{children}</body>
		</html>
	);
}

import type {Metadata, Viewport} from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css'; // Global styles
import { Toaster } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CursorRipple } from '@/components/CursorRipple';
import { FloatingCart } from '@/components/FloatingCart';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Chocket | Deliver Happiness Worldwide 🌍',
  description: 'Premium artisan chocolate e-commerce — handcrafted chocolates from Belgium, Switzerland, France & Italy. Luxury gifting & cross-border delivery.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Chocket',
  },
};

export const viewport: Viewport = {
  themeColor: '#0D0705',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-[#0D0705] text-[#FFF3E0]" suppressHydrationWarning>
        <ServiceWorkerRegister />
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <LoadingScreen />
              <CursorRipple />
              <Navigation />
              <main className="flex-1 pt-20 pb-24 md:pt-24 md:pb-0">
                {children}
              </main>
              <FloatingCart />
              <Toaster 
                position="top-center" 
                richColors 
                toastOptions={{
                  style: {
                    background: '#1A0F0B',
                    border: '1px solid #3E2723',
                    color: '#FFF3E0',
                  },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

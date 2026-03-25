import type {Metadata, Viewport} from 'next';
import { Outfit, Cinzel, Cormorant_Garamond } from 'next/font/google';
import './globals.css'; // Global styles
import { Toaster } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { MainContent } from '@/components/MainContent';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CursorRipple } from '@/components/CursorRipple';
import { FloatingCart } from '@/components/FloatingCart';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { InstallPWA } from '@/components/InstallPWA';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
  weight: ['400', '700', '900'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  style: 'italic',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Chocket | Deliver Happiness Worldwide 🌍',
  description: 'Premium artisan chocolate e-commerce — handcrafted chocolates from Belgium, Switzerland, France & Italy. Luxury gifting & cross-border delivery.',
  manifest: '/manifest.json',
  icons: {
    apple: '/celebration-chocolate.png',
  },
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
    <html lang="en" className={`${outfit.variable} ${cinzel.variable} ${cormorant.variable}`} data-scroll-behavior="smooth">
      <body className="font-sans antialiased min-h-screen flex flex-col bg-[#0D0705] text-[#FFF3E0]" suppressHydrationWarning>
        <ServiceWorkerRegister />
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <LoadingScreen />
              <CursorRipple />
              <Navigation />
              <MainContent>
                {children}
              </MainContent>
              <FloatingCart />
              <InstallPWA />
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

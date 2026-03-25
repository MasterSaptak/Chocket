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
import { PWAProvider } from '@/components/PWAProvider';
import DebugConsole from '@/components/DebugConsole';

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
  metadataBase: new URL('https://chocket.saptech.online'),
  title: {
    default: 'Chocket | Premium Artisan Chocolates & Global Gifting 🌍',
    template: '%s | Chocket'
  },
  description: 'Handcrafted luxury chocolates from Belgium, Switzerland, France & Italy. Experience premium artisan truffles, gift hampers, and global cold-chain delivery. Chocket delivers happiness worldwide.',
  keywords: ['artisan chocolate', 'luxury gifts', 'belgian chocolate', 'swiss chocolate', 'premium truffles', 'chocolate delivery', 'gourmet chocolates'],
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://chocket.saptech.online',
    siteName: 'Chocket',
    title: 'Chocket | Elite Artisan Chocolate Experience',
    description: 'Elevate your senses with handcrafted artisan chocolates. Luxury gifting with seamless global delivery.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Chocket Premium Artisan Chocolates'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chocket | Premium Artisan Chocolates',
    description: 'Experience the world of luxury artisan chocolates. Handcrafted excellence delivered worldwide.',
    images: ['/og-image.png'],
    creator: '@chocket'
  },
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
    <html lang="en" className={`${outfit.variable} ${cinzel.variable} ${cormorant.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-[#0D0705] text-[#FFF3E0]" suppressHydrationWarning>
        <PWAProvider>
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
                <DebugConsole />
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
        </PWAProvider>
      </body>
    </html>
  );
}

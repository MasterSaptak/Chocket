'use client';

import { usePathname } from 'next/navigation';

const DASHBOARD_ROUTES = ['/admin', '/superadmin', '/seller/dashboard'];

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_ROUTES.some(route => pathname?.startsWith(route));

  if (isDashboard) {
    // No padding, no extra wrappers — dashboards control their own layout
    return <>{children}</>;
  }

  return (
    <main className="flex-1 pt-20 pb-24 md:pt-24 md:pb-0">
      {children}
    </main>
  );
}

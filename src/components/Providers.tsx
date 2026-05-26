'use client';

import { StoreProvider } from '@/contexts/StoreContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      {children}
    </StoreProvider>
  );
}

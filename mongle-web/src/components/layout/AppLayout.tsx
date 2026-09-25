import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#09070D]">
      <main className="mx-auto min-h-screen w-full max-w-[480px] bg-[#09070D]">{children}</main>
    </div>
  );
}

export default AppLayout;

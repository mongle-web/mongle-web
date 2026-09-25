import { Outlet } from 'react-router-dom';

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#09060f] text-white">
      <main className="mx-auto min-h-screen w-full max-w-[480px]">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;

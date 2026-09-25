import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/features/home/pages/HomePage';

function AppRouter() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default AppRouter;

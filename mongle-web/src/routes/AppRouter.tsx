
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';
import DreamImageResultPage from '@/features/dream-record/pages/DreamImageResultPage';
import DreamRecordPage from '@/features/dream-record/pages/DreamRecordPage';
import HomePage from '@/features/home/pages/HomePage';

function AppRouter() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dreams/new" element={<DreamRecordPage />} />
          <Route path="/dreams/image-result" element={<DreamImageResultPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default AppRouter;

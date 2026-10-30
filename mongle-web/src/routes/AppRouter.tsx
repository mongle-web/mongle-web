import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';
import CalendarPage from '@/features/calendar/pages/CalendarPage';
import DreamArchivePage from '@/features/dream-archive/pages/DreamArchivePage';
import DreamAnalysisPage from '@/features/dream-analysis/pages/DreamAnalysisPage';
import DreamConnectPage from '@/features/dream-connect/pages/DreamConnectPage';
import DreamConnectResultPage from '@/features/dream-connect/pages/DreamConnectResultPage';
import DreamConnectSavedPage from '@/features/dream-connect/pages/DreamConnectSavedPage';
import DreamDetailPage from '@/features/dream-detail/pages/DreamDetailPage';
import DreamEditPage from '@/features/dream-detail/pages/DreamEditPage';
import DreamImageResultPage from '@/features/dream-record/pages/DreamImageResultPage';
import DreamRecordPage from '@/features/dream-record/pages/DreamRecordPage';
import HomePage from '@/features/home/pages/HomePage';
import AuthCallbackPage from '@/features/login/pages/AuthCallbackPage';
import LoginPage from '@/features/login/pages/LoginPage';
import NicknamePage from '@/features/login/pages/NicknamePage';
import WelcomePage from '@/features/login/pages/WelcomePage';
import ProfilePage from '@/features/profile/pages/ProfilePage';

function AppRouter() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dreams/new" element={<DreamRecordPage />} />
          <Route path="/dreams/image-result" element={<DreamImageResultPage />} />
          <Route path="/dreams/analysis" element={<DreamAnalysisPage />} />
          <Route path="/dreams/:dreamId" element={<DreamDetailPage />} />
          <Route path="/dreams/:dreamId/edit" element={<DreamEditPage />} />
          <Route path="/archive" element={<DreamArchivePage />} />
          <Route path="/connect" element={<DreamConnectPage />} />
          <Route path="/connect/:worldId" element={<DreamConnectResultPage />} />
          <Route path="/connect/:worldId/saved" element={<DreamConnectSavedPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup/nickname" element={<NicknamePage />} />
          <Route path="/signup/welcome" element={<WelcomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default AppRouter;

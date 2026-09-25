import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/features/home/pages/HomePage';

// 화면이 만들어지면 여기에 하나씩 추가하면 됨.

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
    ],
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
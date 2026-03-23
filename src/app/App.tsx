import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from "./auth/AuthProvider";
import { Analytics } from '@vercel/analytics/react';


export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Analytics />
    </AuthProvider>
  );
}

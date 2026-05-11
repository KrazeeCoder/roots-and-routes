import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from "./auth/AuthProvider";
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from "./components/ui/sonner";


export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors closeButton />
      <Analytics />
    </AuthProvider>
  );
}

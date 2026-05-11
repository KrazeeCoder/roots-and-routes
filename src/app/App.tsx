import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from "./auth/AuthProvider";
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from "./components/ui/sonner";
import { useEffect } from 'react';
import { addSkipLinks } from '../utils/accessibility';


export default function App() {
  useEffect(() => {
    // Add skip links for keyboard navigation
    addSkipLinks();
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors closeButton />
      <Analytics />
    </AuthProvider>
  );
}

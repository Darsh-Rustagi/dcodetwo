import Navbar from './components/navbar/navbar';
import './globals.css';

// --- EDIT ---: Import the AuthProvider we created
import { AuthProvider } from '../context/AuthContext'; 

export const metadata = {
  title: 'Mentora Dashboard',
  description: 'Study and Chat Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* --- EDIT ---
          Wrap the entire application, including the Navbar, with the AuthProvider.
          This ensures that any component in your app can access the user's
          login state using the `useAuth()` hook.
        */}
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

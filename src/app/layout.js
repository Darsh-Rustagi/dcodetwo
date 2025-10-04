// src/app/layout.js
import Navbar from './components/navbar/navbar';
import './globals.css';

export const metadata = {
  title: 'Mentora Dashboard',
  description: 'Study and Chat Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar></Navbar>
        {children}
        
      </body>
    </html>
  );
}

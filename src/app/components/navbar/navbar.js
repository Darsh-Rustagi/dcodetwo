'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ user, handleSignOut }) {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center sticky top-0 z-20">
      <div className="font-bold text-2xl text-zinc-900">Mentora</div>
      <ul className="flex gap-6">
        <li>
          <Link href="/" className={`text-black hover:text-blue-600 ${pathname === '/' ? 'text-blue-600 font-semibold' : ''}`}>Home</Link>
        </li>
        <li>
          <Link href="/study" className={`text-black hover:text-blue-600 ${pathname === '/study' ? 'text-blue-600 font-semibold' : ''}`}>Study</Link>
        </li>
        <li>
          <Link href="/chat" className={`text-black hover:text-blue-600 ${pathname === '/chat' ? 'text-blue-600 font-semibold' : ''}`}>Chat</Link>
        </li>
      </ul>
      {user && (
        <button
          onClick={handleSignOut}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors"
        >
          Sign Out
        </button>
      )}
    </nav>
  );
}

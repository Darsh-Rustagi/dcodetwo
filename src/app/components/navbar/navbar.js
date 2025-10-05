'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, MessageSquare, Users, User, LogOut } from 'lucide-react';

const navItems = [
    { href: '/studentdashboard', label: 'Dashboard', icon: Home },
    { href: '/chat', label: 'Chat', icon: MessageSquare }, // EDIT: Changed href from '/chats' to '/chat'
    { href: '/mentors', label: 'Find Mentors', icon: Users },
    { href: '/profile', label: 'Create Profile', icon: User },
];

export default function Navbar({ user, handleSignOut }) {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-amber-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/studentdashboard" className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-zinc-900 text-white rounded-full w-10 h-10 flex items-center justify-center">M</div>
            <span className="text-2xl font-bold text-zinc-900 hidden sm:block">Mentora</span>
          </Link>

          {/* Navigation Links */}
          <ul className="flex items-center gap-2 sm:gap-4">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <li key={item.href}>
                        <Link href={item.href} className="relative flex flex-col items-center p-2 text-zinc-600 hover:text-amber-600 transition-colors">
                            <item.icon size={24} />
                            <span className="text-xs font-semibold mt-1">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                                    layoutId="underline"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                        </Link>
                    </li>
                )
            })}
          </ul>

          {/* Sign Out Button */}
          <div>
            {user ? ( // Assuming you'll pass a user prop to determine login state
              <motion.button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-lg shadow-red-500/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={16} />
                <span className="hidden sm:block">Sign Out</span>
              </motion.button>
            ) : (
                // Placeholder for a login button if needed
                <div className="w-24"></div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}


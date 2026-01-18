'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white hover:text-purple-400 transition-colors">
          RecipeToBring
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/add">
                    <Button variant="ghost" className="text-white hover:text-purple-400">
                      Add Recipe
                    </Button>
                  </Link>
                  <Link href="/explore">
                    <Button variant="ghost" className="text-white hover:text-purple-400">
                      Explore
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.email}</span>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="border-white/20 hover:border-purple-500 text-white"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/explore">
                    <Button variant="ghost" className="text-white hover:text-purple-400">
                      Explore
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

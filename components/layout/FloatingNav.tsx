'use client';

import { FloatingDock } from '@/components/ui/floating-dock';
import { Home, Plus, Compass, User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';

export function FloatingNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const navItems = [
    {
      title: 'Home',
      icon: <Home className="h-full w-full" />,
      href: '/',
    },
    {
      title: 'Add Recipe',
      icon: <Plus className="h-full w-full" />,
      href: user ? '/add' : '/login?redirect=/add',
    },
    {
      title: 'Explore',
      icon: <Compass className="h-full w-full" />,
      href: '/explore',
    },
  ];

  if (user) {
    navItems.push({
      title: 'Sign Out',
      icon: <LogOut className="h-full w-full" />,
      href: '#signout',
    });
  } else {
    navItems.push({
      title: 'Sign In',
      icon: <User className="h-full w-full" />,
      href: '/login',
    });
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
      <FloatingDock 
        items={navItems}
        desktopClassName="bg-card/90 backdrop-blur-md border border-border"
        mobileClassName="bg-card/90 backdrop-blur-md border border-border"
      />
    </div>
  );
}

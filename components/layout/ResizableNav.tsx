"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter, usePathname } from "next/navigation";
import { Home, Plus, Compass, User, LogOut } from "lucide-react";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarButton,
  MobileNav,
  MobileNavMenu,
  MobileNavHeader,
  MobileNavToggle,
} from "@/components/ui/resizable-navbar";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ResizableNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    router.push("/");
  };

  const navItems = [
    {
      name: "Startsiite",
      link: "/",
    },
    {
      name: "Rezept hinzufüege",
      link: user ? "/add" : "/login?redirect=/add",
    },
    {
      name: "Entdecke",
      link: "/explore",
    },
    {
      name: "Fründe & Familie",
      link: user ? "/friends" : "/login?redirect=/friends",
    },
  ];

  return (
    <Navbar className="fixed">
      {/* Desktop Navigation */}
      <NavBody>
        {/* Logo */}
        <Link href="/" className="relative z-20 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Brings Rezept
          </span>
        </Link>

        {/* Desktop Navigation Items */}
        <NavItems items={navItems} />

        {/* Desktop Auth Buttons */}
        <div className="relative z-20 flex items-center gap-2">
          {user ? (
            <NavbarButton
              href="#"
              variant="dark"
              onClick={handleSignOut}
              as="button"
            >
              <LogOut className="h-4 w-4 inline mr-2" />
              Abmelde
            </NavbarButton>
          ) : (
            <NavbarButton href="/login" variant="gradient">
              <User className="h-4 w-4 inline mr-2" />
              Ahmelde
            </NavbarButton>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Brings Rezept
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <MobileNavToggle
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </MobileNavHeader>

        {/* Mobile Menu Dropdown */}
        <MobileNavMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.link}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium w-full",
                "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white",
                "hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all duration-200",
                pathname === item.link && "bg-gray-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              )}
            >
              {item.name}
            </Link>
          ))}

          <div className="h-px bg-gray-200 dark:bg-neutral-800 my-2 w-full" />

          {user ? (
            <button
              onClick={handleSignOut}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium w-full text-left",
                "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white",
                "hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all duration-200"
              )}
            >
              <LogOut className="h-4 w-4" />
              Abmelde
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium w-full",
                "bg-gradient-to-r from-primary to-blue-600 text-white",
                "hover:from-primary/90 hover:to-blue-700 transition-all duration-200",
                "justify-center"
              )}
            >
              <User className="h-4 w-4" />
              Ahmelde
            </Link>
          )}
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

'use client';

import Link from 'next/link';
import { Link2, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/Button';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSeparator } from './ui/Dropdown';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Link2 className="h-4 w-4" />
          </span>
          Shortly
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <Dropdown>
              <DropdownTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 transition hover:bg-surface-muted">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {user.email.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[10rem] truncate text-sm font-medium text-foreground sm:inline">
                  {user.email}
                </span>
              </DropdownTrigger>
              <DropdownMenu>
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium text-foreground">{user.email}</p>
                  <p className="text-xs text-muted">Signed in</p>
                </div>
                <DropdownSeparator />
                <DropdownItem danger onClick={() => logout()}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

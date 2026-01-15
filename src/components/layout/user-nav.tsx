
'use client';

import { useState, useEffect } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  LifeBuoy,
  LogOut,
  Settings,
  User,
} from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

export function UserNav() {
  const [isMounted, setIsMounted] = useState(false);
  const [userData, setUserData] = useState({ name: 'Farmer Singh', email: 'farmer.singh@example.com', initials: 'FS' });

  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem('cropnavi_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        // Logic to better parse identity when DB provides 'username' which might be an email
        const rawIdentity = user.username || user.email || 'User';
        const isEmail = rawIdentity.includes('@');

        const displayName = isEmail ? rawIdentity.split('@')[0] : rawIdentity;
        const displayEmail = isEmail ? rawIdentity : (user.email || 'user@cropnavi.com');

        setUserData({
          name: displayName,
          email: displayEmail,
          initials: (displayName || 'U').charAt(0).toUpperCase()
        });
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={`https://ui-avatars.com/api/?name=${userData.initials}&background=random`}
              alt="User avatar"
              data-ai-hint="user avatar"
            />
            <AvatarFallback>{userData.initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userData.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <Settings className="mr-2" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/support">
            <LifeBuoy className="mr-2" />
            <span>Support</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/login" onClick={() => localStorage.removeItem('cropnavi_user')}>
            <LogOut className="mr-2" />
            <span>Log out</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

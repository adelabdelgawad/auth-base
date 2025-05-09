'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppUser } from '@/types/auth';
import { User as UserIcon, LogOut, BookOpen } from 'lucide-react';
import { signOut } from 'next-auth/react'; // Import from next-auth/react instead

interface UserAvatarProps {
  user: AppUser
}

function getInitials(name: string): string {
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  } else {
    return words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
  }
}

export default function UserAvatar({ user }: UserAvatarProps) {
  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage alt={user?.fullname} />
          <AvatarFallback>{getInitials(user?.username || '')}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          {user?.fullname}
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          {user?.title}
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={handleSignOut}
          className="flex items-center gap-2 text-red-500 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

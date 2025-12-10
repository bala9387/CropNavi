
'use client';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  BookOpen,
  LayoutDashboard,
  LineChart,
  Recycle,
  ScanLine,
  Sprout,
  Trophy,
  Users,
  Home,
  Loader2,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const menuItems: MenuItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/crop-recommendation', label: 'Crop Recommendation', icon: Sprout },
  { href: '/market-analysis', label: 'Market Analysis', icon: LineChart },
  { href: '/sustainability-score', label: 'Sustainability Score', icon: Recycle },
  { href: '/disease-detection', label: 'Disease Detection', icon: ScanLine },
  { href: '/community', label: 'Community Forum', icon: Users },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/education', label: 'Educational Modules', icon: BookOpen },
];

interface SidebarNavProps {
    menuItems: MenuItem[];
    isTranslating: boolean;
}

export function SidebarNav({ menuItems: navItems, isTranslating }: SidebarNavProps) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };
  
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
           <Sprout className="size-7 text-primary" />
          <h2 className="font-headline text-xl font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            CropNavi
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <Link href={href} onClick={handleLinkClick}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(href) && (href !== '/dashboard' || pathname === '/dashboard')}
                  tooltip={label}
                >
                  <Icon />
                  <span>
                    {isTranslating ? <Loader2 className="animate-spin" /> : label}
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}

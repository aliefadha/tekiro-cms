import * as React from 'react'
import { Link, Outlet, useRouterState } from '@tanstack/react-router'

import {
  Battery,
  BookOpen,
  FolderTree,
  Image,
  LayoutDashboard,
  Package,
  PanelTop,
  UserRound,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import { useAuth } from '@/auth'

type NavItem = {
  title: string
  href: string
  icon: React.ReactElement
  exact?: boolean
}

const primaryNav: Array<NavItem> = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard />,
    exact: true,
  },
  {
    title: 'Category',
    href: '/category',
    icon: <FolderTree />,
  },
  {
    title: 'Product',
    href: '/product',
    icon: <Package />,
  },
  {
    title: 'Gallery',
    href: '/gallery',
    icon: <Image />,
  },
  {
    title: 'Catalogue',
    href: '/catalogue',
    icon: <PanelTop />,
  },
  {
    title: 'Article',
    href: '/article',
    icon: <BookOpen />,
  },
  {
    title: 'Cordless',
    href: '/cordless',
    icon: <Battery />,
  },
]

const sidebarTheme = {
  '--sidebar': '#000000',
  '--sidebar-foreground': '#85E408',
  '--sidebar-border': 'rgba(133, 228, 8, 0.2)',
  '--sidebar-muted': 'rgba(133, 228, 8, 0.15)',
  '--sidebar-accent': '#85E408',
  '--sidebar-accent-foreground': '#000000',
} as React.CSSProperties

function DashboardNavItem({ item }: { item: NavItem }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const isActive = React.useMemo(() => {
    if (item.exact) {
      return pathname === item.href
    }

    return pathname.startsWith(item.href)
  }, [item.exact, item.href, pathname])

  const itemClasses = [
    'flex items-center gap-3 rounded-xl px-4 py-6 text-lg font-medium transition-all duration-200',
    isActive
      ? 'bg-[#85E408] text-black'
      : 'text-[#85E408] hover:bg-[#85E408]/10 hover:text-black',
  ]
    .filter(Boolean)
    .join(' ')

  const iconClasses = `h-6 w-6 transition-opacity ${
    isActive ? 'opacity-100' : 'opacity-70'
  }`

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link to={item.href} className={itemClasses}>
          <span className={iconClasses}>{item.icon}</span>
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function AppSidebar() {
  return (
    <Sidebar className="border-none bg-black text-[#85E408]">
      <SidebarHeader className="px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src="/images/logo.jpg"
            alt="Logo"
            className="h-32 w-full object-contain"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-8 px-4 py-6">
        <SidebarGroup className="gap-2">
          <SidebarGroupLabel className="sr-only">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => (
                <DashboardNavItem key={item.href} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

export function DashboardLayout() {
  const auth = useAuth()

  const handleLogout = () => {
    auth.logout()
    window.location.href = '/login'
  }
  return (
    <SidebarProvider style={sidebarTheme}>
      <div className="bg-background flex min-h-svh w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 h-6" />
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-11 w-11 rounded-full border border-[#85E408]/20 bg-[#85E408]/10 p-0 transition hover:bg-[#85E408]/20"
                  >
                    <span className="sr-only">Open profile menu</span>
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#85E408]">
                      <UserRound className="size-5 text-black" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-40 rounded-2xl border border-[#F0F1F3]"
                >
                  <DropdownMenuItem
                    className="text-[#C1272D]"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="flex flex-1 flex-col">
            <div className="grow p-10 bg-[#F9F9F9]">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

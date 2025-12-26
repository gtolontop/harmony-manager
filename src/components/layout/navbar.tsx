"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@prisma/client";
import { ROLE_NAMES, hasMinRole } from "@/lib/rbac";

interface NavItem {
  label: string;
  href: string;
  minRole?: Role;
  exactRoles?: Role[];
}

const navItems: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Recrutement", href: "/recrutement" },
  { label: "Fidélité", href: "/fidelite" },
  { label: "Facturation", href: "/compta/facture", minRole: "recrue" },
  { label: "Historique", href: "/compta/historique", minRole: "chef_equipe" },
  { label: "Statistiques", href: "/stats", minRole: "recrue" },
  { label: "Manager", href: "/manager", minRole: "chef_equipe" },
  { label: "Admin", href: "/admin", exactRoles: ["superadmin"] },
];

interface NavbarProps {
  user: {
    id: string;
    username: string;
    displayName: string | null;
    image: string | null;
    role: Role;
  };
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => {
    if (item.exactRoles) {
      return item.exactRoles.includes(user.role);
    }
    if (item.minRole) {
      return hasMinRole(user.role, item.minRole);
    }
    return true;
  });

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {visibleItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors",
              mobile ? "block py-2" : "px-3 py-2",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          <span className="font-semibold hidden sm:inline-block">Harmony</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 flex-1">
          <NavLinks />
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Role Badge */}
          <Badge variant="secondary" className="hidden sm:flex">
            {ROLE_NAMES[user.role]}
          </Badge>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.image || undefined} alt={user.username} />
                  <AvatarFallback>
                    {(user.displayName || user.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.displayName || user.username}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="sm:hidden">
                <Badge variant="secondary">{ROLE_NAMES[user.role]}</Badge>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="sm:hidden" />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="flex flex-col space-y-1 mt-6">
                <NavLinks mobile />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

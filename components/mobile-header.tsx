'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Scissors, 
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { signOut } from '@/lib/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface MobileHeaderProps {
  role: 'julissa' | 'natalia';
}

const julissaLinks = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/dashboard/clients', label: 'Clientes', icon: Users },
  { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
];

const nataliaLinks = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/toppers', label: 'Toppers', icon: Scissors },
  { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
];

export function MobileHeader({ role }: MobileHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const links = role === 'julissa' ? julissaLinks : nataliaLinks;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const currentLink = links.find(l => l.href === pathname);

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur border-b border-border z-50 flex items-center justify-between px-4">
      {pathname !== '/dashboard' ? (
        <Link href="/dashboard" className="flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">{currentLink?.label || 'Volver'}</span>
        </Link>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold">Dulcesdlissa</span>
        </div>
      )}
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-semibold">Dulcesdlissa</span>
              </div>
            </div>
            
            <nav className="space-y-1 flex-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full mt-auto"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

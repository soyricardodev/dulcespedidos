'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Scissors, 
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { signOut } from '@/lib/client';
import { useRouter } from 'next/navigation';

interface DashboardNavProps {
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

export function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const links = role === 'julissa' ? julissaLinks : nataliaLinks;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-card border-r border-border p-4 fixed">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold">Dulcesdlissa</span>
        </div>
        
        <nav className="space-y-1 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
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
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </aside>
    </>
  );
}

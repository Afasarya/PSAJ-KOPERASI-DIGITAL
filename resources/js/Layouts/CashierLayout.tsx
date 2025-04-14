import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  CreditCard, 
  FileText, 
  Home, 
  LogOut, 
  Menu, 
  MessageSquare, 
  ShoppingCart,
  User
} from 'lucide-react';
import { ThemeToggle } from '@/Components/ThemeToggle';
import { Button } from '@/Components/ui/button';
import { PageProps } from '@/types';

interface CashierLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const CashierLayout: React.FC<CashierLayoutProps> = ({ children, title }) => {
  const { auth } = usePage<PageProps>().props;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigation = [
    { name: 'Dashboard', href: route('cashier.dashboard'), icon: Home },
    { name: 'Kasir (POS)', href: route('cashier.pos.index'), icon: CreditCard },
    { name: 'Riwayat Transaksi', href: route('cashier.transactions.index'), icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for larger screens */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r bg-card">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-primary">Koperasi Digital</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${route().current(item.href) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'}
                  `}
                >
                  <item.icon 
                    className="mr-3 h-5 w-5 flex-shrink-0" 
                    aria-hidden="true" 
                  />
                  {item.name}
                </Link>
              ))}
              <div className="px-2 py-4 mt-4 border-t border-border">
                <p className="px-2 mb-2 text-xs font-semibold text-muted-foreground tracking-wider">ASISTEN AI</p>
                <Link
                  href="/cashier/groq-assistant"
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  Groq Assistant
                </Link>
              </div>
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t p-4">
            <div className="flex items-center">
              <div className="ml-3 flex flex-1 flex-col">
                <p className="text-sm font-medium text-foreground">{auth.user.name}</p>
                <p className="text-xs text-muted-foreground">Kasir</p>
              </div>
              <ThemeToggle />
              <Link 
                href={route('logout')} 
                method="post" 
                as="button" 
                className="ml-2 p-1 rounded-full hover:bg-muted"
              >
                <span className="sr-only">Logout</span>
                <LogOut className="h-5 w-5 text-foreground" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={toggleSidebar}></div>
        <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-card">
          <div className="flex h-full flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-5">
              <h1 className="text-xl font-bold text-primary">Koperasi SMPN 1</h1>
              <Button size="icon" variant="ghost" onClick={toggleSidebar}>
                <span className="sr-only">Close menu</span>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 px-2 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group mb-2 flex items-center px-2 py-2 text-base font-medium rounded-md
                    ${route().current(item.href) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'}
                  `}
                  onClick={toggleSidebar}
                >
                  <item.icon 
                    className="mr-4 h-6 w-6 flex-shrink-0" 
                    aria-hidden="true" 
                  />
                  {item.name}
                </Link>
              ))}
              <div className="px-2 py-4 mt-4 border-t border-border">
                <p className="px-2 mb-2 text-xs font-semibold text-muted-foreground tracking-wider">ASISTEN AI</p>
                <Link
                  href="#"
                  className="group mb-2 flex items-center px-2 py-2 text-base font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={toggleSidebar}
                >
                  <MessageSquare className="mr-4 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                  Groq Assistant
                </Link>
              </div>
            </div>
            <div className="flex border-t p-4">
              <div className="flex items-center">
                <div className="flex flex-1 flex-col">
                  <p className="text-sm font-medium text-foreground">{auth.user.name}</p>
                  <p className="text-xs text-muted-foreground">Kasir</p>
                </div>
                <ThemeToggle />
                <Link 
                  href={route('logout')} 
                  method="post" 
                  as="button" 
                  className="ml-2 p-1 rounded-full hover:bg-muted"
                >
                  <span className="sr-only">Logout</span>
                  <LogOut className="h-5 w-5 text-foreground" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <div className="sticky top-0 z-10 bg-card border-b">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center md:hidden">
              <Button variant="outline" size="icon" onClick={toggleSidebar}>
                <span className="sr-only">Open menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </Button>
            </div>
            <div className="flex flex-1 justify-between">
              <h1 className="text-2xl font-bold">{title}</h1>
              <div className="ml-4 flex items-center md:ml-6">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CashierLayout;
import React from 'react';
import { Link } from '@inertiajs/react';
import { ThemeToggle } from '@/Components/ThemeToggle';

interface GuestLayoutProps {
  children: React.ReactNode;
}

const GuestLayout: React.FC<GuestLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div>
        <Link href="/">
          <h1 className="text-3xl font-bold text-primary">Koperasi SMPN 1 Purwokerto</h1>
        </Link>
      </div>

      <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-card shadow-md overflow-hidden sm:rounded-lg">
        {children}
      </div>
    </div>
  );
};

export default GuestLayout;
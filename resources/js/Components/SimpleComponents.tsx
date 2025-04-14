// resources/js/Components/SimpleComponents.tsx
import React, { ReactNode } from 'react';

// Simple Separator replacement
export const Separator: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`h-px w-full bg-border ${className}`} />
);

// Simple Pagination components
export const Pagination = ({ className = '', children }: { className?: string, children: ReactNode }) => (
  <div className={`flex justify-center my-4 ${className}`}>
    {children}
  </div>
);

export const PaginationContent = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center gap-1">{children}</div>
);

export const PaginationItem = ({ children }: { children: ReactNode }) => (
  <div>{children}</div>
);

export const PaginationLink = ({ 
  href, 
  isActive = false, 
  children 
}: { 
  href: string, 
  isActive?: boolean, 
  children: ReactNode 
}) => (
  <a
    href={href}
    className={`px-3 py-1 text-sm rounded-md ${
      isActive 
        ? 'bg-primary text-primary-foreground' 
        : 'hover:bg-muted'
    }`}
  >
    {children}
  </a>
);

export const PaginationNext = ({ 
  href, 
  className = '', 
  children 
}: { 
  href: string, 
  className?: string, 
  children?: ReactNode 
}) => (
  <a
    href={href}
    className={`px-3 py-1 text-sm rounded-md hover:bg-muted flex items-center gap-1 ${className}`}
  >
    {children || 'Next'}
    <span className="text-lg" aria-hidden="true">
      &rsaquo;
    </span>
  </a>
);

export const PaginationPrevious = ({ 
  href, 
  className = '', 
  children 
}: { 
  href: string, 
  className?: string, 
  children?: ReactNode 
}) => (
  <a
    href={href}
    className={`px-3 py-1 text-sm rounded-md hover:bg-muted flex items-center gap-1 ${className}`}
  >
    <span className="text-lg" aria-hidden="true">
      &lsaquo;
    </span>
    {children || 'Previous'}
  </a>
);

export const PaginationEllipsis = ({ className = '' }: { className?: string }) => (
  <span className={`px-3 py-1 text-sm ${className}`}>
    &hellip;
  </span>
);

// Simple dropdown components
export const DropdownMenu = ({ children }: { children: ReactNode }) => (
  <div className="relative">{children}</div>
);

export const DropdownMenuTrigger = ({ children }: { children: ReactNode }) => (
  <div className="cursor-pointer">{children}</div>
);

export const DropdownMenuContent = ({ children }: { children: ReactNode }) => (
  <div className="absolute right-0 mt-2 w-56 bg-card rounded-md shadow-lg border border-border z-10">
    {children}
  </div>
);

export const DropdownMenuCheckboxItem = ({ 
  checked = false, 
  onCheckedChange,
  children 
}: { 
  checked?: boolean, 
  onCheckedChange?: (checked: boolean) => void, 
  children: ReactNode 
}) => (
  <div 
    className="flex items-center px-3 py-2 text-sm hover:bg-muted cursor-pointer"
    onClick={() => onCheckedChange?.(!checked)}
  >
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={() => {}} 
      className="mr-2" 
    />
    {children}
  </div>
);
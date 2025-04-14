import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface PaginationProps {
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}

export const Pagination: React.FC<PaginationProps> = ({ links }) => {
  // Remove "Previous" and "Next" links as we'll handle those separately
  const pageLinks = links.filter(
    link => link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;'
  );

  const prevLink = links.find(link => link.label === '&laquo; Previous');
  const nextLink = links.find(link => link.label === 'Next &raquo;');

  return (
    <nav className="flex items-center space-x-1">
      {/* Previous button */}
      {prevLink && (
        <Button
          variant="outline"
          size="icon"
          className={!prevLink.url ? 'opacity-50 cursor-not-allowed' : ''}
          disabled={!prevLink.url}
          asChild={prevLink.url ? true : false}
        >
          {prevLink.url ? (
            <Link href={prevLink.url}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Link>
          ) : (
            <span>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </span>
          )}
        </Button>
      )}

      {/* Page links */}
      {pageLinks.map((link, i) => {
        // Remove HTML entities from label
        const label = link.label.replace(/&nbsp;/g, ' ');
        
        // Check if it's a "..." separator
        if (label === '...') {
          return (
            <span key={i} className="px-2">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </span>
          );
        }
        
        return (
          <Button
            key={i}
            variant={link.active ? 'default' : 'outline'}
            size="icon"
            className="w-9"
            asChild={!link.active && link.url ? true : false}
          >
            {!link.active && link.url ? (
              <Link href={link.url}>{label}</Link>
            ) : (
              <span>{label}</span>
            )}
          </Button>
        );
      })}

      {/* Next button */}
      {nextLink && (
        <Button
          variant="outline"
          size="icon"
          className={!nextLink.url ? 'opacity-50 cursor-not-allowed' : ''}
          disabled={!nextLink.url}
          asChild={nextLink.url ? true : false}
        >
          {nextLink.url ? (
            <Link href={nextLink.url}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Link>
          ) : (
            <span>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </span>
          )}
        </Button>
      )}
    </nav>
  );
};
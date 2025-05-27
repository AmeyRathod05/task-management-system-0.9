import React, { useState } from 'react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

interface ColumnVisibilityToggleProps<TData> {
  table: Table<TData>;
  className?: string;
}

export function ColumnVisibilityToggle<TData>({ 
  table,
  className = '' 
}: ColumnVisibilityToggleProps<TData>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        className="h-8"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" 
          />
        </svg>
        Columns
      </Button>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {table
              .getAllColumns()
              .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
              .map((column) => (
                <div 
                  key={column.id} 
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                  onClick={() => {
                    column.toggleVisibility(!column.getIsVisible());
                  }}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    checked={column.getIsVisible()}
                    onChange={() => {}}
                  />
                  <span className="capitalize">{column.id.replace(/_/g, ' ')}</span>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Close when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

"use client"

import * as React from "react"
import { useState } from "react"

import { cn } from "@/lib/utils"

type SortDirection = "asc" | "desc" | null

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean
  sortDirection?: SortDirection
  onSort?: () => void
  filterable?: boolean
  filterType?: 'text' | 'select' | 'number' | 'date' | 'boolean'
  filterOptions?: Array<{ label: string; value: string }>
  filterValue?: any
  onFilter?: (value: any) => void
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ 
    className, 
    sortable, 
    sortDirection, 
    onSort, 
    filterable, 
    filterType = 'text', 
    filterOptions = [], 
    filterValue, 
    onFilter, 
    children, 
    ...props 
  }, ref) => {
    const [showFilter, setShowFilter] = useState(false);

    // Handle filter click without triggering sort
    const handleFilterClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowFilter(!showFilter);
    };

    // Handle filter change
    const handleFilterChange = (value: any) => {
      if (onFilter) {
        onFilter(value);
      }
    };

    // Render filter input based on type
    const renderFilterInput = () => {
      if (!showFilter) return null;

      switch (filterType) {
        case 'text':
          return (
            <input
              type="text"
              value={filterValue || ''}
              onChange={(e) => handleFilterChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full p-1 text-sm border rounded"
              placeholder="Filter..."
            />
          );
        case 'select':
          return (
            <select
              value={filterValue || ''}
              onChange={(e) => handleFilterChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full p-1 text-sm border rounded"
            >
              <option value="">All</option>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        case 'number':
          return (
            <input
              type="number"
              value={filterValue || ''}
              onChange={(e) => handleFilterChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full p-1 text-sm border rounded"
              placeholder="Filter..."
            />
          );
        case 'date':
          return (
            <input
              type="date"
              value={filterValue || ''}
              onChange={(e) => handleFilterChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full p-1 text-sm border rounded"
            />
          );
        case 'boolean':
          return (
            <select
              value={filterValue || ''}
              onChange={(e) => handleFilterChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full p-1 text-sm border rounded"
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          );
        default:
          return null;
      }
    };

    return (
      <th
        ref={ref}
        className={cn(
          "h-12 px-4 text-left align-middle font-bold text-muted-foreground [&:has([role=checkbox])]:pr-0",
          sortable && "cursor-pointer select-none",
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            {children}
            {sortable && (
              <div className="flex flex-col ml-1">
                <ChevronUp 
                  className={cn(
                    "h-3 w-3 text-muted-foreground/50", 
                    sortDirection === "asc" && "text-foreground"
                  )} 
                />
                <ChevronDown 
                  className={cn(
                    "h-3 w-3 text-muted-foreground/50", 
                    sortDirection === "desc" && "text-foreground"
                  )} 
                />
              </div>
            )}
            {filterable && (
              <button 
                onClick={handleFilterClick}
                className="ml-1 p-1 hover:bg-muted rounded"
              >
                <FilterIcon className={cn(
                  "h-3 w-3 text-muted-foreground/50",
                  showFilter && "text-foreground"
                )} />
              </button>
            )}
          </div>
          {renderFilterInput()}
        </div>
      </th>
    );
  }
)
TableHead.displayName = "TableHead"

// Icons for sort and filter indicators
const ChevronUp = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m18 15-6-6-6 6"/>
  </svg>
)

const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m6 9 6 6 6-6"/>
  </svg>
)

const FilterIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

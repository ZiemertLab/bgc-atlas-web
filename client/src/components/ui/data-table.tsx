"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationFirst,
  PaginationLast
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

type SortDirection = "asc" | "desc" | null

type SortState = {
  column: string;
  direction: SortDirection;
}

type FilterType = 'text' | 'select' | 'number' | 'date' | 'boolean';

type FilterOption = {
  label: string;
  value: string;
};

type ColumnFilter = {
  type: FilterType;
  options?: FilterOption[];
};

type Column = {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filter?: ColumnFilter;
  render?: (row: any) => React.ReactNode;
}

type FilterState = {
  [key: string]: any;
};

type DataTableProps = {
  columns: Column[];
  data: any[];
  total: number;
  page: number;
  limit: number;
  loading?: boolean;
  sortState?: SortState;
  filterState?: FilterState;
  onSort?: (column: string) => void;
  onFilter?: (column: string, value: any) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTable({
  columns,
  data,
  total,
  page,
  limit,
  loading = false,
  sortState = { column: "", direction: null },
  filterState = {},
  onSort,
  onFilter,
  onPageChange,
  onPageSizeChange
}: DataTableProps) {
  const totalPages = Math.ceil(total / limit);
  const [topGoToPage, setTopGoToPage] = useState<string>("");
  const [bottomGoToPage, setBottomGoToPage] = useState<string>("");
  const topInputRef = React.useRef<HTMLInputElement>(null);
  const bottomInputRef = React.useRef<HTMLInputElement>(null);

  // Available page sizes
  const pageSizes = [10, 25, 50, 100];

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than the max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of page range
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(totalPages - 1, page + 1);

      // Adjust if we're near the start
      if (page <= 3) {
        endPage = Math.min(totalPages - 1, 4);
      }

      // Adjust if we're near the end
      if (page >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push(-1); // -1 represents ellipsis
      }

      // Add page numbers in the middle
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push(-2); // -2 represents ellipsis
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const handleGoToPage = (inputValue: string, setInputValue: React.Dispatch<React.SetStateAction<string>>) => {
    const pageNumber = parseInt(inputValue);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
    setInputValue("");
  };

  const handleGoToPageKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>, 
    inputValue: string, 
    setInputValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (e.key === 'Enter') {
      handleGoToPage(inputValue, setInputValue);
    }
  };

  // Reusable pagination controls component
  const PaginationControls = ({
    inputRef,
    goToPage,
    setGoToPage
  }: {
    inputRef: React.RefObject<HTMLInputElement>,
    goToPage: string,
    setGoToPage: React.Dispatch<React.SetStateAction<string>>
  }) => (
    <div className="flex items-center justify-between">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationFirst 
              onClick={() => onPageChange(1)}
              disabled={page === 1 || loading}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
            />
          </PaginationItem>

          {getPageNumbers().map((pageNum, i) => (
            <PaginationItem key={i}>
              {pageNum < 0 ? (
                <span className="flex h-9 w-9 items-center justify-center">...</span>
              ) : (
                <PaginationLink
                  isActive={pageNum === page}
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || loading}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLast 
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages || loading}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            type="number"
            min={1}
            max={totalPages}
            value={goToPage}
            onChange={(e) => {
              setGoToPage(e.target.value);
              // Ensure focus is maintained after state update
              setTimeout(() => {
                inputRef.current?.focus();
              }, 0);
            }}
            onKeyDown={(e) => handleGoToPageKeyDown(e, goToPage, setGoToPage)}
            placeholder="Page"
            className="w-28 h-9"
            disabled={loading}
          />
          <Button 
            onClick={() => handleGoToPage(goToPage, setGoToPage)} 
            size="sm"
            disabled={loading || !goToPage}
          >
            Go
          </Button>
        </div>

        {onPageSizeChange && (
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm text-muted-foreground">Page size:</span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                if (onPageSizeChange) {
                  onPageSizeChange(parseInt(value));
                }
              }}
              disabled={loading}
            >
              <SelectTrigger className="w-20 h-9">
                <SelectValue placeholder={limit.toString()} />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top pagination controls */}
      {totalPages > 1 && (
        <div className="mb-4">
          <PaginationControls 
            inputRef={topInputRef}
            goToPage={topGoToPage}
            setGoToPage={setTopGoToPage}
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  sortable={column.sortable}
                  sortDirection={sortState.column === column.key ? sortState.direction : null}
                  onSort={column.sortable && onSort ? () => onSort(column.key) : undefined}
                  filterable={column.filterable}
                  filterType={column.filter?.type}
                  filterOptions={column.filter?.options}
                  filterValue={filterState[column.key]}
                  onFilter={onFilter ? (value) => onFilter(column.key, value) : undefined}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Show skeleton loading state
              Array.from({ length: limit > 10 ? 10 : limit }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((column, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Show empty state
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              // Show actual data
              data.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(row) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom pagination controls */}
      {totalPages > 1 && (
        <div className="mt-4">
          <PaginationControls 
            inputRef={bottomInputRef}
            goToPage={bottomGoToPage}
            setGoToPage={setBottomGoToPage}
          />
        </div>
      )}

      <div className="text-sm text-muted-foreground text-center">
        Showing {data.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} entries
      </div>
    </div>
  )
}

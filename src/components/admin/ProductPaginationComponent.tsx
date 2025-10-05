import { Button } from '@/components/ui/button';

interface ProductPaginationComponentProps {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange: (page: number) => void;
}

export function ProductPaginationComponent({ pagination, onPageChange }: ProductPaginationComponentProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
        {pagination.total} products
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.hasPrevPage}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

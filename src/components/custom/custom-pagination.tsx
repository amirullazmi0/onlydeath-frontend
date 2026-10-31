import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface CustomPaginationProps {
    page: number;
    setPage: (page: number) => void;
    totalPage: number;
    totalData?: number;
}

export default function CustomPagination({
    page,
    setPage,
    totalPage,
    totalData,
}: Readonly<CustomPaginationProps>) {
    if (totalPage <= 0) return null;

    const getPageNumbers = () => {
        const showEllipsis = totalPage > 7;

        if (showEllipsis) {
            if (page <= 4) {
                return [1, 2, 3, 4, 5, 'ellipsis-end', totalPage];
            }
            if (page >= totalPage - 3) {
                return [
                    1,
                    'ellipsis-start',
                    totalPage - 4,
                    totalPage - 3,
                    totalPage - 2,
                    totalPage - 1,
                    totalPage,
                ];
            }
            return [1, 'ellipsis-start', page - 1, page, page + 1, 'ellipsis-end', totalPage];
        }

        return Array.from({ length: totalPage }, (_, i) => i + 1);
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full px-2 py-4 border-t">
            <div className="text-sm text-muted-foreground flex items-center gap-1 order-2 sm:order-1">
                {totalData !== undefined && (
                    <>
                        Total: <span className="font-medium text-foreground">{totalData}</span>
                    </>
                )}
            </div>

            <Pagination className="mx-0 w-auto order-1 sm:order-2">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => page > 1 && setPage(page - 1)}
                            className={cn(
                                'cursor-pointer select-none',
                                page <= 1 && 'pointer-events-none opacity-50',
                            )}
                        />
                    </PaginationItem>

                    {getPageNumbers().map((pageNum) => (
                        <PaginationItem key={pageNum}>
                            {typeof pageNum === 'string' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    isActive={page === pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className="cursor-pointer select-none"
                                >
                                    {pageNum}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => page < totalPage && setPage(page + 1)}
                            className={cn(
                                'cursor-pointer select-none',
                                page >= totalPage && 'pointer-events-none opacity-50',
                            )}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

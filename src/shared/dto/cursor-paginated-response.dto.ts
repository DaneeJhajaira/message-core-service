export class CursorPaginatedResponseDto<T> {
  data: T[];
  total: number;
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
}

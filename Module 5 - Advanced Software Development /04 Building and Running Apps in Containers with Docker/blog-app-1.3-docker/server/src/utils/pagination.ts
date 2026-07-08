/**
 * @fileoverview Pagination Utilities
 * @objective Standardize how pagination offsets (skip) and limits are calculated, and how paginated responses are structured.
 * @risk High limit values could cause database performance bottlenecks (mitigated by capping the limit to 100).
 * @relations Used in controllers that fetch lists of items (e.g. `content.controller.ts`).
 * @logic
 * - `getPaginationOptions`: Parses `page` and `limit` from strings, ensures minimums of 1, caps `limit` at 100, and calculates the database `skip` value.
 * - `createPaginatedResponse`: Wraps the raw data in a standard format, calculating total pages, and flags for `hasNextPage` and `hasPrevPage`.
 */
export const getPaginationOptions = (pageQuery?: string, limitQuery?: string) => {
  const parsedPage = parseInt(pageQuery || '1', 10);
  const parsedLimit = parseInt(limitQuery || '10', 10);

  const page = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
  const limit = isNaN(parsedLimit) ? 10 : Math.max(1, Math.min(100, parsedLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) => {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

export const toSkipTake = (pagination: { page: number; pageSize: number }) => ({
  skip: pagination.pageSize * (pagination.page - 1),
  take: pagination.pageSize,
});

export const getPaginationMeta = (
  pagination: { page: number; pageSize: number },
  totalItems: number,
) => ({
  ...pagination,
  ...pagination,
  totalItems,
  totalPages: Math.ceil(totalItems / pagination.pageSize),
});

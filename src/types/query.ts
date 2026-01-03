export type QueryManyParams<
  Filter extends object,
  SortFields extends readonly string[],
> = {
  pagination: {
    page: number;
    pageSize: number;
  };
  order?: {
    field: SortFields[number];
    direction: "asc" | "desc";
  };
  filter: Partial<Filter>;
};

export type QueryUniqueParams<
  Identifier extends readonly object[],
  IncludeFields extends readonly string[],
> = {
  identifier: Identifier[number];
  include?: Partial<Record<IncludeFields[number], boolean | undefined>>;
};

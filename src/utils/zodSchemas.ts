import { z } from "zod";

export const zBoolString = z.stringbool();

export const zUintString = z.coerce.number<string>().pipe(z.uint32());

export const zIntString = z.coerce.number<string>().pipe(z.int32());

export const zPintString = z.coerce.number<string>().pipe(z.int32().min(1));

export const zDateString = z.iso
  .date()
  .transform((s) => new Date(`${s}T00:00:00Z`));

export const zDateTimeString = z.iso
  .datetime({ offset: true })
  .transform((s) => new Date(s));

export const zListString = <T>(entries: z.ZodType<T, string>) =>
  z
    .string()
    .transform((s) => s.split(","))
    .pipe(z.array(entries));

export const zSetString = <T>(key: z.ZodType<T, string>) =>
  z
    .string()
    .transform((s) => new Set(s.split(",")))
    .pipe(z.set(key));

export const zMapRecord = <K, V>(
  key: z.ZodType<K, string>,
  value: z.ZodType<V, V>,
) =>
  z
    .record(z.string(), value)
    .transform((r) => new Map(Object.entries(r)))
    .pipe(z.map(key, value));

export const queryManySchema = <
  T extends z.ZodRawShape,
  U extends readonly string[],
>(
  filterShape: T,
  orderFields: [...U],
  defaults?: {
    pageSize?: number;
    order?: {
      field: U[number];
      direction: "asc" | "desc";
    };
  },
) => {
  const paginationSchema = z.object({
    page: zPintString.default(1),
    pageSize: zPintString.default(defaults?.pageSize ?? 10),
  });
  const orderSchema = z
    .object({
      sort: z.templateLiteral([z.string(), ":", z.string()]).optional(),
    })
    .transform((o) => {
      if (!o.sort) return undefined;
      const [field, direction] = o.sort.split(":");
      return {
        field: z.enum(orderFields).parse(field),
        direction: z.enum(["asc", "desc"]).parse(direction),
      };
    });

  const filterSchema = z.object(filterShape).partial();
  return (
    z
      .object({
        page: z.string().optional(),
        pageSize: z.string().optional(),
        sort: z.string().optional(),
      })
      // NOTE: this step doesnt yet invalidate orderBy without ordering
      // therefore the input type may not be totally accurate.
      .extend(filterSchema.shape)
      .transform((o) => {
        // any cast to make this stupid language cooperate
        const { page, pageSize, sort, ...rest } = o as any;
        return {
          pagination: paginationSchema.parse({ page, pageSize }),
          order: orderSchema.parse({ sort }),
          filter: rest as z.infer<typeof filterSchema>,
        };
      })
  );
};

export const includeSchema = <T extends readonly string[]>(
  includeFields: [...T],
) => {
  const includeEnum = z.enum(includeFields);
  type includeEnumType = z.infer<typeof includeEnum>;
  type includeRecord = Record<includeEnumType, boolean>;
  return zSetString(includeEnum).transform((s) => {
    const result: includeRecord = {} as includeRecord;
    for (const key of includeFields) {
      result[key] = s.has(key);
    }
    return result;
  });
};

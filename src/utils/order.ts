const hasKey = <T extends object>(obj: T, key: PropertyKey): key is keyof T => {
  return key in obj;
};

export const getOrder = <T extends object, U extends string>(
  order: undefined | { field: U; direction: "asc" | "desc" },
  orderMap: (dir: "asc" | "desc") => T = () => ({}) as T,
) => {
  if (order) {
    const orderMapped = orderMap(order.direction);
    if (hasKey(orderMapped, order.field)) {
      return orderMapped[order.field];
    } else {
      return { [order.field]: order.direction };
    }
  }
  return {};
};

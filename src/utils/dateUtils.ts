const THAI_OFFSET_MS = 7 * 60 * 60 * 1000;

export const getUTCYMD = (date: Date) => ({
  y: date.getUTCFullYear(),
  m: date.getUTCMonth(),
  d: date.getUTCDate(),
});

export const getThaiYMD = (date: Date) => {
  const dateThai = new Date(date.getTime() + THAI_OFFSET_MS);
  return getUTCYMD(dateThai);
};

// "thai date" here is UTC (y, m, d) from date
export const getRangeOfThaiDate = (date: Date) => {
  const { y, m, d } = getUTCYMD(date);

  const startOfDay = new Date(Date.UTC(y, m, d) - THAI_OFFSET_MS);
  const endOfDay = new Date(Date.UTC(y, m, d + 1) - 1 - THAI_OFFSET_MS);

  return { startOfDay, endOfDay };
};

export const isValidThaiTomorrow = (date: Date, tomorrow: Date) => {
  const { y: y1, m: m1, d: d1 } = getThaiYMD(date);
  const { y: y2, m: m2, d: d2 } = getThaiYMD(tomorrow);
  return y1 === y2 && m1 === m2 && d1 === d2;
};

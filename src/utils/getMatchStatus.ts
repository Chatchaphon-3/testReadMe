export const getMatchStatus = (start: Date, end: Date): string => {
  const now = new Date();
  if (now > end) return "COMPLETED";

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (start >= today && start < tomorrow) return "TODAY";

  const nextDay = new Date(tomorrow);
  nextDay.setDate(tomorrow.getDate() + 1);
  if (start >= tomorrow && start < nextDay) return "TOMORROW";

  return "UPCOMING";
};

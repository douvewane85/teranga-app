export function generatePeriods(startDate: string | Date, frequency: string, count: number = 12) {
  const periods = [];
  const start = new Date(startDate);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    if (frequency === "MONTHLY") d.setMonth(d.getMonth() + i);
    else if (frequency === "QUARTERLY") d.setMonth(d.getMonth() + (i * 3));
    else if (frequency === "SEMI_ANNUALLY") d.setMonth(d.getMonth() + (i * 6));
    else if (frequency === "ANNUALLY") d.setFullYear(d.getFullYear() + i);
    
    // e.g. "juillet 2026"
    const name = d.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1).replace(' ', '-');
    periods.push({
      name: formattedName,
      date: d,
    });
  }
  return periods;
}

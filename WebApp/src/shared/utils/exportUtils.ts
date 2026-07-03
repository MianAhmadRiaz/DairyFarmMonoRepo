export const exportToCSV = (data: any[], filename: string) => {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  csvRows.push(headers.join(','));

  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',')
        ? `"${value}"`
        : value;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
};

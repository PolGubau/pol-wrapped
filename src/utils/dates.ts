// Función para convertir el número decimal a hora
export const decimalToTime = (decimal: number): string => {
  const hours = Math.floor(decimal * 24); // Obtener las horas
  const minutes = Math.round((decimal * 24 - hours) * 60); // Obtener los minutos
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Función para convertir el número de serie de Excel a fecha
export const decimalToDate = (serial: number): string => {
  const epoch = new Date(1900, 0, 1);
  epoch.setDate(epoch.getDate() + serial - 2);
  return epoch.toISOString().split("T")[0];
};

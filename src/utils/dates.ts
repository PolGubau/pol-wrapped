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
export const convertTimeToMinutes = (time: string): number => { // "12:00" => 720
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const convertMinutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
};

export const calculateDeviation = (realTime: string, desiredTime: string): number => {
  const realTimeInMinutes = convertTimeToMinutes(realTime);
  const desiredTimeInMinutes = convertTimeToMinutes(desiredTime);

  // Si la hora real es antes que la deseada (cruza medianoche), sumamos 24 horas a la hora real
  let deviation = realTimeInMinutes - desiredTimeInMinutes;

  // Si la hora real es anterior a la deseada, debe sumarse 24 horas
  if (realTimeInMinutes < desiredTimeInMinutes) {
    deviation += 24 * 60; // 24 horas en minutos
  }
  return deviation;
};

// src/utils/dateUtils.js

/**
 * Dada una fecha ISO (YYYY-MM-DD o YYYY-MM-DD HH:mm:ss), devuelve DD/MM/YYYY o DD/MM/YYYY HH:mm
 */
export function formatDateToDMY(isoDate) {
  if (!isoDate) return "";
  // Acepta "2024-10-10" o "2024-10-10T10:40:19" o "2024-10-10 10:40:19"
  let date = isoDate;
  let time = "";

  // Si viene con T o espacio, separar fecha y hora
  if (isoDate.includes("T") || isoDate.includes(" ")) {
    [date, time] = isoDate.replace("T", " ").split(" ");
  }

  const [year, month, day] = date.split("-");
  // Si hay hora, mostrarla
  if (time) {
    // Opcional: solo hh:mm si prefieres
    const [hh, mm] = time.split(":");
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year} ${hh}:${mm}`;
    // return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year} ${time}`; // Si prefieres toda la hora
  }
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

// src/utils/clienteUtils.js

export function transformarCliente(cliente) {
  // Normalizar el campo 'servicios' si falta (podría venir undefined)
  const servicios = Array.isArray(cliente.servicios) ? cliente.servicios : [];

  if (cliente.clientable && typeof cliente.clientable === "object") {
    if (cliente.clientable_type === "App\\Models\\Persona") {
      return {
        ...cliente,
        servicios,
        persona: {
          nombre: cliente.clientable.nombre || "",
          apellido: cliente.clientable.apellido || "",
          dni: cliente.clientable.dni ? cliente.clientable.dni.toString() : "",
          email: cliente.clientable.email || "",
          telefono: cliente.clientable.telefono || ""
        }
      };
    } else if (cliente.clientable_type === "App\\Models\\Empresa") {
      return {
        ...cliente,
        servicios,
        persona: {
          nombre: cliente.clientable.nombre || "",
          apellido: "",
          dni: cliente.clientable.cuit || "",
          email: "",
          telefono: ""
        }
      };
    }
  }
  // Si no tiene clientable, igual devuelvo un shape homogéneo
  return {
    ...cliente,
    servicios,
    persona: {
      nombre: "",
      apellido: "",
      dni: "",
      email: "",
      telefono: ""
    }
  };
}

// Si la respuesta viene empaquetada (por ejemplo, [array, status]), desempaqueta y devuelve el array.
export function unpackData(data) {
  return Array.isArray(data) && data.length > 0 && Array.isArray(data[0])
    ? data[0]
    : data;
}

// Convierte una cadena a Title Case
export function titleCase(str = '') {
  return str
    .split(' ')
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');
}

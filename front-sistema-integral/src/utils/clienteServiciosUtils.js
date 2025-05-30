// src/utils/clienteServiciosUtils.js
export function getClientesPorServiciosAsignados(serviciosDisponibles, serviciosUsuarioIds, clientesCompletos) {
  // Recolecta IDs de clientes de los servicios permitidos
  const idsSet = new Set();
  serviciosDisponibles.forEach(servicio => {
    if (serviciosUsuarioIds.includes(Number(servicio.id))) {
      (servicio.clientes || []).forEach(cliente => {
        idsSet.add(Number(cliente.id));
      });
    }
  });
  // Retorna solo los clientes completos (nombre, apellido, dni, etc)
  return clientesCompletos.filter(cli => idsSet.has(Number(cli.id)));
}

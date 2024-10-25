// src/context/AsideLinksContext.js
import React, { createContext, useContext } from 'react';

const AsideLinksContext = createContext();

export const useAsideLinks = () => useContext(AsideLinksContext);

export const AsideLinksProvider = ({ children }) => {
  const subsystemsLinks = {
    facturacion: [
      { href: '/facturacion', label: 'Home Facturación' },
      { href: '/facturacion/bombeo-agua', label: 'Bombeo de Agua' },
      { href: '/facturacion/hornopirolitico', label: 'Horno Pirolítico' },
      { href: '/facturacion/Terminal', label: 'Alquiler Terminal' },
      { href: '/facturacion/periodos', label: 'Periodos' },
      { href: '/facturacion/recibos', label: 'Recibos' },
      { href: '/facturacion/clientes', label: 'Gestión Clientes' },
    ],
    inventario: [
      { href: '/inventario/agregar', label: 'Agregar Producto' },
      { href: '/inventario/stock', label: 'Ver Stock' },
    ],
    // Puedes agregar más subsistemas aquí...
  };
  
  return (
    <AsideLinksContext.Provider value={subsystemsLinks}>
      {children}
    </AsideLinksContext.Provider>
  );
};
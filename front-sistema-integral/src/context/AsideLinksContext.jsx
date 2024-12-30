// src/context/AsideLinksContext.js
import React, { createContext, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faFileInvoiceDollar, faMoneyBillWave, faUsersViewfinder, faFireBurner, faBus, faFaucetDrip  } from '@fortawesome/free-solid-svg-icons';

const AsideLinksContext = createContext();

export const useAsideLinks = () => useContext(AsideLinksContext);

export const AsideLinksProvider = ({ children }) => {
  const subsystemsLinks = {
    facturacion: [
      { href: '/facturacion',
        label: (
          <>
            <FontAwesomeIcon
              icon={faMoneyBillWave}
              size="1x"  // Tamaño del ícono
              className="me-2"
            />
            Home Facturación
          </>
        )
      },
      { href: '/facturacion/bombeo-agua',
        label: (
          <>
            <FontAwesomeIcon
              icon={faFaucetDrip}
              size="1x"  // Tamaño del ícono
              className="me-2"
            />
            Bombeo de Agua
          </>
        )
      },
      { href: '/facturacion/hornopirolitico', 
        label:(
          <>
            <FontAwesomeIcon
              icon={faFireBurner}
              size="1x"  // Tamaño del ícono
              className="me-2"
            />
            Horno Pirolítico
          </>
        ) 
      },
      { href: '/facturacion/Terminal', 
        label:(
          <>
            <FontAwesomeIcon
              icon={faBus}
              size="1x"  // Tamaño del ícono
              className="me-2"
            />
            Alquiler Terminal
          </>
        ) },
      { href: '/facturacion/periodos',
        label: (
          <>
            <FontAwesomeIcon
              icon={faCalendarCheck}
              size="1x"  // Tamaño del ícono
              className="me-2"
            />
            Periodos
          </>
        )
      },
      { href: '/facturacion/recibos', 
        label: (
          <>
            <FontAwesomeIcon
              icon={faFileInvoiceDollar}
              size="1x"  // Tamaño del ícono
              className="me-2"
            />
            Recibos
          </>
        )
      },
      { href: '/facturacion/clientes',
        label: (
          <>
            <FontAwesomeIcon
              icon={faUsersViewfinder}
              size="1x"  // Tamaño del ícono
              className="me-2"
            />
            Clientes
          </>
        )
      },
    ],
    inventario: [
      { href: '/inventario/agregar', label: 'Agregar Producto' },
      { href: '/inventario/stock', label: 'Ver Stock' },
    ],
    usuarios: [
      { href: '/usuarios', label: 'Usuarios' },
      { href: '/usuarios/roles', label: 'Roles' },
      { href: '/usuarios/permisos', label: 'Permisos' },
    ],
  };
  
  return (
    <AsideLinksContext.Provider value={subsystemsLinks}>
      {children}
    </AsideLinksContext.Provider>
  );
};

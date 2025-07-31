import React, { createContext, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck, faFileInvoiceDollar, faMoneyBillWave,
  faUsersViewfinder, faFireBurner, faBus, faFaucetDrip,
  faAddressCard, faUserTie, faCashRegister,
  faFilterCircleDollar, faListOl, faListCheck
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from './AuthContext'; // Importar AuthContext para usar los permisos

const AsideLinksContext = createContext();

export const useAsideLinks = () => useContext(AsideLinksContext);

export const AsideLinksProvider = ({ children }) => {
  const { user } = useContext(AuthContext); // Obtener los permisos del usuario

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = (permission) => user.permissions.includes(permission);

  const subsystemsLinks = {
    facturacion: [
      
      {
        href: '/facturacion',
        label: (
          <>
            <FontAwesomeIcon
              icon={faMoneyBillWave}
              size="1x"
              className="me-2"
            />
            Home Facturación
          </>
        )
      },
            hasPermission('clientes.index') && {
        href: '/facturacion/clientes',
        label: (
          <>
            <FontAwesomeIcon
              icon={faUsersViewfinder}
              size="1x"
              className="me-2"
            />
            Clientes
          </>
        )
      },
      hasPermission('bombeoagua.access') && {
        href: '/facturacion/bombeo-agua',
        label: (
          <>
            <FontAwesomeIcon
              icon={faFaucetDrip}
              size="1x"
              className="me-2"
            />
            Bombeo de Agua
          </>
        )
      },
      hasPermission('hornopirolitico.access') && {
        href: '/facturacion/hornopirolitico',
        label: (
          <>
            <FontAwesomeIcon
              icon={faFireBurner}
              size="1x"
              className="me-2"
            />
            Horno Pirolítico
          </>
        )
      },
      hasPermission('alquilerplataforma.access') && {
        href: '/facturacion/alquiler-plataforma',
        label: (
          <>
            <FontAwesomeIcon
              icon={faBus}
              size="1x"
              className="me-2"
            />
            Alquiler Plataforma
          </>
        )
      },
      hasPermission('cuentas.index') && {
        href: '/facturacion/periodos',
        label: (
          <>
            <FontAwesomeIcon
              icon={faCalendarCheck}
              size="1x"
              className="me-2"
            />
            Historial de Periodos
          </>
        )
      },
      hasPermission('recibos.index') && {
        href: '/facturacion/recibos',
        label: (
          <>
            <FontAwesomeIcon
              icon={faFileInvoiceDollar}
              size="1x"
              className="me-2"
            />
            Historial de Recibos
          </>
        )
      },
    ].filter(Boolean),

    inventario: [
      { href: '/inventario/agregar', label: 'Agregar Producto' },
      { href: '/inventario/stock', label: 'Ver Stock' },
    ],    

    caja: [
      hasPermission('caja.access') && {
        href: '/caja',
        label: (
          <>
            <FontAwesomeIcon icon={faCashRegister} size="1x" className="me-2" />
            Home Caja
          </>
        )
      },
      hasPermission('caja.historial') && {
        href: '/caja/historial',
        label: (
          <>
            <FontAwesomeIcon icon={faListOl} size="1x" className="me-2" />
            Historial de cobros
          </>
        )
      },
      hasPermission('cierres.index') && {
        href: '/caja/arqueo',
        label: (
          <>
            <FontAwesomeIcon icon={faFilterCircleDollar} size="1x" className="me-2" />
            Arqueo diario
          </>
        )
      },
      // Ejemplo de otro permiso futuro:
      // hasPermission('caja.reportes') && { ... }
    ].filter(Boolean),

    usuarios: [
      hasPermission('users.index') && {
        href: '/usuarios',
        label: (
          <>
            <FontAwesomeIcon
              icon={faAddressCard}
              size="1x"
              className="me-2"
            />
            Usuarios
          </>
        )
      },
      hasPermission('roles.index') && {
        href: '/usuarios/roles',
        label: (
          <>
            <FontAwesomeIcon
              icon={faUserTie}
              size="1x"
              className="me-2"
            />
            Roles
          </>
        )
      },
      hasPermission('permisos.index') && {
        href: '/usuarios/permisos',
        label: (
          <>
            <FontAwesomeIcon
              icon={faListCheck}
              size="1x"
              className="me-2"
            />
            Permisos
          </>
        )
      },
    ].filter(Boolean), // Filtrar elementos falsy
  };

  return (
    <AsideLinksContext.Provider value={subsystemsLinks}>
      {children}
    </AsideLinksContext.Provider>
  );
};

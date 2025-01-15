import React, { createContext, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck, faFileInvoiceDollar, faMoneyBillWave,
  faUsersViewfinder, faFireBurner, faBus, faFaucetDrip,
  faAddressCard, faUserTie, faListCheck
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
      hasPermission('hornopirolitico.access') && { // Solo mostrar si tiene permiso hornopirolitico.access
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
      hasPermission('alquilerterminal.access') && { // Solo mostrar si tiene permiso alquilerterminal.access
        href: '/facturacion/Terminal',
        label: (
          <>
            <FontAwesomeIcon
              icon={faBus}
              size="1x"
              className="me-2"
            />
            Alquiler Terminal
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
            Periodos
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
            Recibos
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
    ].filter(Boolean), // Filtrar los elementos `null` o `false` (si no tiene permisos)

    inventario: [
      { href: '/inventario/agregar', label: 'Agregar Producto' },
      { href: '/inventario/stock', label: 'Ver Stock' },
    ],

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
    ].filter(Boolean), // Filtrar los elementos `null` o `false` (si no tiene permisos)
  };

  return (
    <AsideLinksContext.Provider value={subsystemsLinks}>
      {children}
    </AsideLinksContext.Provider>
  );
};

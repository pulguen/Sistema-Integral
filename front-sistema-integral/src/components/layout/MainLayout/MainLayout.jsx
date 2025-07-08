import React from 'react';
import { Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAsideLinks } from '../../../context/AsideLinksContext';
import '../../../styles/MainLayout.css';

const MainLayout = ({ children, section }) => {
  const links = useAsideLinks();
  const asideLinks = links[section] || [];
  const location = useLocation();

  return (
    <Container fluid className="grid-container">
      <aside className="sidebar">
        <h2 className="titulo-slidebar">Menú</h2>
        <ul>
          {asideLinks.map((link, index) => {
            // Detecta si es el home de un sistema (ej: '/facturacion', '/caja', etc)
            const isHome = /^\/[^/]+$/.test(link.href);
            // Si es home, solo es activo si es exactamente la ruta; si no, también si la url empieza con el href + '/'
            const isActive = isHome
              ? location.pathname === link.href
              : (location.pathname === link.href || location.pathname.startsWith(link.href + '/'));

            return (
              <li key={index}>
                <Link
                  to={link.href}
                  className={`nav-link${isActive ? ' active' : ''}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
      <main className="main-content">{children}</main>
    </Container>
  );
};

export default MainLayout;

import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAsideLinks } from '../../../context/AsideLinksContext'; // Importar el contexto de los enlaces
import '../../../styles/MainLayout.css';

const MainLayout = ({ children, section }) => {
  const links = useAsideLinks(); // Obtener los enlaces del contexto
  const asideLinks = links[section] || []; // Enlaces correspondientes a la sección del subsistema

  return (
    <Container fluid className="grid-container">
      <aside className="sidebar">
        <h2 className="titulo-slidebar">Menú</h2>
        <ul>
          {asideLinks.map((link, index) => (
            <li key={index}>
              <Link to={link.href} className="nav-link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main className="main-content">{children}</main>
    </Container>
  );
};

export default MainLayout;

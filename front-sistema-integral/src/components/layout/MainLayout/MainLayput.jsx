import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../../../styles/MainLayout.css';

const MainLayout = ({ children, asideLinks }) => {
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
      <main className="main-content">
        {children}
      </main>
    </Container>
  );
};

export default MainLayout;

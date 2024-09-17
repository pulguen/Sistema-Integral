// src/components/layout/Navbar/Navbar.jsx
import React, { useContext } from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext.jsx';
import Image from 'react-bootstrap/Image';
import logo from '../../../assets/images/logonav.png';
import './Navbar.css';

const NavBar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="mb-4">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          <Image
            src={logo}
            alt="Logo"
            width={100}
            className="d-inline-block align-top"
          />{' '}
          <span className="brand-text">SISTEMA INTEGRAL</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll">
          <span className="navbar-toggler-icon">
            <div></div>
            <div></div>
            <div></div>
          </span>
        </Navbar.Toggle>

        <Navbar.Collapse id="navbar-nav">
          {location.pathname !== '/' && (
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/facturacion">Facturación</Nav.Link>
              <Nav.Link as={Link} to="/inventario">Inventario</Nav.Link>
              <Nav.Link as={Link} to="/recursos-humanos">Recursos Humanos</Nav.Link>
            </Nav>
          )}

          <Nav className="ms-auto">
            <Button variant="outline-light" onClick={handleLogout}>
              Salir
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;

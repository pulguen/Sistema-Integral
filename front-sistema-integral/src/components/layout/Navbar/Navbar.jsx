import React, { useContext } from 'react';
import { Navbar, Nav, Form, FormControl, Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext.jsx';

const NavBar = ({ searchTerm, onSearchChange }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirigir a la página de login después de cerrar sesión
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">Mi Sistema</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/facturacion">Facturación</Nav.Link>
            <Nav.Link as={Link} to="/inventario">Inventario</Nav.Link>
            <Nav.Link as={Link} to="/recursos-humanos">Recursos Humanos</Nav.Link>
          </Nav>
          <Form className="d-flex">
            <FormControl
              type="search"
              placeholder="Buscar"
              className="me-2"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Button variant="outline-success">Buscar</Button>
          </Form>
          <Button variant="outline-light" className="ms-3" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
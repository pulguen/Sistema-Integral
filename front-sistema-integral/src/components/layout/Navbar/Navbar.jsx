// src/components/layout/Navbar/Navbar.jsx
import React, { useContext } from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext.jsx';
import Image from 'react-bootstrap/Image';
import logo from '../../../assets/images/logonav.png';
import Swal from 'sweetalert2'; // Importa Swal
import '../../../styles/Navbar.css';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const handleLogout = async () => {
    // Mostrar alerta de confirmación
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas cerrar sesión?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6', // Color del botón de confirmación
      cancelButtonColor: '#d33', // Color del botón de cancelación
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await logout(); // Llamar a la función logout del contexto

        // Mostrar alerta de éxito
        await Swal.fire({
          icon: 'success',
          title: 'Cerraste sesión',
          text: 'Has cerrado sesión exitosamente.',
          timer: 2000, // Duración de la alerta en milisegundos
          showConfirmButton: false,
        });
      } catch (error) {
        // Manejar errores y mostrar alerta de error
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al cerrar sesión. Inténtalo de nuevo.',
        });
      }
    }
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
              <Nav.Link as={Link} to="/usuarios">Usuarios</Nav.Link>
            </Nav>
          )}

          <Nav className="ms-auto align-items-center">
            {/* Mostrar el nombre del usuario con saludo */}
            {user && (
              <Nav.Item className="me-3 user-welcome">
                {`${user.name}, bienvenido/a`}
              </Nav.Item>
            )}
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

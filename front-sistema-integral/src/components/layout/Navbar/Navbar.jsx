import React, { useContext, useEffect, useState } from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import Image from 'react-bootstrap/Image';
import logo from '../../../assets/images/logonav.png';
import Swal from 'sweetalert2';
import '../../../styles/Navbar.css';

// Íconos
import { MdReceiptLong, MdInventory2 } from 'react-icons/md';
import { FaUserTie, FaUsers } from 'react-icons/fa';
import { FaCashRegister } from 'react-icons/fa';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const [permissions, setPermissions] = useState(user.permissions);
  const location = useLocation();

  useEffect(() => {
    const updatePermissions = () => {
      setPermissions([...user.permissions]);
    };
    window.addEventListener('permissionsUpdated', updatePermissions);
    return () => {
      window.removeEventListener('permissionsUpdated', updatePermissions);
    };
  }, [user.permissions]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      await logout();
    }
  };

  const hasAccess = (permission) => permissions.includes(`${permission}.access`);

  return (
    <Navbar expand="lg" className="mb-4 custom-navbar">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          <Image src={logo} alt="Logo" width={100} className="d-inline-block align-top" />
          <span className="brand-text">SIMZA</span>
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
            <Nav className="me-auto navbar-systems">
              {hasAccess('facturacion') && (
                <Nav.Link
                  as={Link}
                  to="/facturacion"
                  className={location.pathname.startsWith('/facturacion') ? 'active' : ''}
                >
                  <MdReceiptLong className="nav-icon" />
                  Facturación
                </Nav.Link>
              )}
              {hasAccess('inventario') && (
                <Nav.Link
                  as={Link}
                  to="/inventario"
                  className={location.pathname.startsWith('/inventario') ? 'active' : ''}
                >
                  <MdInventory2 className="nav-icon" />
                  Inventario
                </Nav.Link>
              )}
              {hasAccess('recursoshumanos') && (
                <Nav.Link
                  as={Link}
                  to="/recursos-humanos"
                  className={location.pathname.startsWith('/recursos-humanos') ? 'active' : ''}
                >
                  <FaUserTie className="nav-icon" />
                  Recursos Humanos
                </Nav.Link>
              )}
              {hasAccess('usuarios') && (
                <Nav.Link
                  as={Link}
                  to="/usuarios"
                  className={location.pathname.startsWith('/usuarios') ? 'active' : ''}
                >
                  <FaUsers className="nav-icon" />
                  Usuarios
                </Nav.Link>
              )}
              {hasAccess('caja') && (
                <Nav.Link
                  as={Link}
                  to="/caja"
                  className={location.pathname.startsWith('/caja') ? 'active' : ''}
                >
                  <FaCashRegister className="nav-icon" />
                   Caja
                </Nav.Link>
              )}
            </Nav>
          )}

          <Nav className="ms-auto align-items-center">
            {user && <Nav.Item className="me-3 user-welcome">{`${user.name}, bienvenido/a`}</Nav.Item>}
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

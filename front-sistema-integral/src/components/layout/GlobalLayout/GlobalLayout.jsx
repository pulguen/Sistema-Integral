// src/components/layout/GlobalLayout/GlobalLayout.jsx
import React from 'react';
import NavBar from '../Navbar/Navbar';

const GlobalLayout = ({ children }) => {
  return (
    <>
      {/* Siempre muestra el NavBar */}
      <NavBar />
      
      {/* Aquí va el contenido dinámico (páginas) */}
      <div className="content">{children}</div>

    </>
  );
};

export default GlobalLayout;
// src/components/layout/GlobalLayout/GlobalLayout.jsx
import React from 'react';
import NavBar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

const GlobalLayout = ({ children }) => {
  return (
    <>
      {/* Siempre muestra el NavBar */}
      <NavBar />
      
      {/* Aquí va el contenido dinámico (páginas) */}
      <div className="content">{children}</div>

      {/* Siempre muestra el Footer */}
      <Footer />
    </>
  );
};

export default GlobalLayout;
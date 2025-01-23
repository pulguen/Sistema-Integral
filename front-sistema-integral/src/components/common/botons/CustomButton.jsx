// src/components/common/botons/CustomButton.jsx
import React from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../../../styles/CustomButton.css';

const CustomButton = ({
  variant = 'primary',
  children,
  onClick = () => {},
  type = 'button',
  size = 'md',
  className = '',
  // 1. Agrega el prop disabled con un valor por defecto
  disabled = false,
}) => {
  return (
    <Button
      className={`custom-button ${variant} ${className}`}
      onClick={onClick}
      type={type}
      size={size}
      // 2. Aplica el prop disabled al <Button> de Bootstrap
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

// Validación de los props con PropTypes
CustomButton.propTypes = {
  variant: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  // 3. Declara disabled en PropTypes
  disabled: PropTypes.bool,
};

export default CustomButton;

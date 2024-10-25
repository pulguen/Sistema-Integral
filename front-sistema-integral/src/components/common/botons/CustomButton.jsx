import React from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../../../styles/CustomButton.css';

const CustomButton = ({
  variant = 'primary',    // Valor predeterminado
  children,
  onClick = () => {},     // Valor predeterminado
  type = 'button',        // Valor predeterminado
  size = 'md',            // Valor predeterminado
  className = '',         // Valor predeterminado
}) => {
  return (
    <Button className={`custom-button ${variant} ${className}`} onClick={onClick} type={type} size={size}>
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
};

export default CustomButton;

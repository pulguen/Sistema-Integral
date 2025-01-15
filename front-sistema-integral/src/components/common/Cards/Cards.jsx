import React from 'react';
import { Card, Button, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const CommonCard = ({
  title,
  description,
  buttonText,
  route,
  variant = 'primary',
  colSize = 4,
  disabled = false, // Nueva propiedad para controlar si el botón debe estar deshabilitado
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!disabled) {
      navigate(route); // Navegar solo si el botón no está deshabilitado
    }
  };

  return (
    <Col md={colSize} className="mb-4">
      <Card>
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Card.Text>{description}</Card.Text>
          <Button variant={variant} onClick={handleClick} disabled={disabled}>
            {buttonText}
          </Button>
          {disabled && (
            <p className="text-muted mt-2">No tienes permisos para acceder a este sistema.</p>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

CommonCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  variant: PropTypes.string,
  colSize: PropTypes.number,
  disabled: PropTypes.bool, // Asegurar que `disabled` sea un booleano
};

export default CommonCard;

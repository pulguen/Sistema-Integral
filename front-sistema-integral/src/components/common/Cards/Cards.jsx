import React from 'react';
import { Card, Button, Col, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

const CommonCard = ({
  title,
  description,
  buttonText,
  route,
  variant = 'primary',
  colSize = 4,
  disabled = false,
  isLoading = false,
  onClick = null,
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(); // usa la función pasada desde el padre (Home)
    }
  };

  return (
    <Col md={colSize} className="mb-4">
      <Card className="shadow-sm h-100">
        <Card.Body className="d-flex flex-column justify-content-between">
          <div>
            <Card.Title>{title}</Card.Title>
            <Card.Text>{description}</Card.Text>
          </div>
          <div>
            <Button
              variant={variant}
              onClick={handleClick}
              disabled={disabled || isLoading}
              className="w-100 mt-3"
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" role="status" className="me-2" />
                  Cargando...
                </>
              ) : (
                buttonText
              )}
            </Button>
            {disabled && (
              <p className="text-muted mt-2 text-center" style={{ fontSize: '0.9rem' }}>
                No tienes permisos para acceder a este sistema.
              </p>
            )}
          </div>
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
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  onClick: PropTypes.func,
};

export default CommonCard;

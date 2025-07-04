import React from 'react';
import { Card, Col, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import CustomButton from '../botons/CustomButton';
import '../../../styles/CustomCard.css';

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
  cardClassName = '',   // <-- Nueva prop con default vacío
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <Col md={colSize} className="mb-4">
      <Card
        className={`shadow-sm h-100 animated-fade-in position-relative ${disabled ? 'card-disabled' : ''} ${cardClassName}`}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      >
        {/* Overlay solo si está deshabilitado */}
        {disabled && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
            style={{
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '0.7rem',
              zIndex: 5,
              pointerEvents: 'none'
            }}
          >
            <i className="bi bi-lock-fill fs-2 mb-2 text-secondary" aria-hidden="true" />
          </div>
        )}

        <Card.Body className="d-flex flex-column justify-content-between" style={{ minHeight: 190 }}>
          <div>
            <Card.Title as="h3" style={{ fontSize: '1.2rem', fontWeight: 600 }}>{title}</Card.Title>
            <Card.Text style={{ fontSize: '1rem', minHeight: 48 }}>{description}</Card.Text>
          </div>
          <div>
            <CustomButton
              variant={variant}
              onClick={handleClick}
              disabled={disabled || isLoading}
              className="w-100 mt-3"
              aria-busy={isLoading}
              tabIndex={disabled ? -1 : 0}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" role="status" className="me-2" />
                  Cargando...
                </>
              ) : (
                buttonText
              )}
            </CustomButton>
            {disabled && (
              <p className="text-muted mt-2 text-center mb-0" style={{ fontSize: '0.96rem' }}>
                <i className="bi bi-lock-fill me-1" aria-hidden="true" />
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
  cardClassName: PropTypes.string, // <-- ¡IMPORTANTE!
};

export default CommonCard;

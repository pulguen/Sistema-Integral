// src/components/common/cards/CommonCard.jsx
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
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(route);
  };

  return (
    <Col md={colSize} className="mb-4">
      <Card>
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Card.Text>{description}</Card.Text>
          <Button variant={variant} onClick={handleClick}>
            {buttonText}
          </Button>
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
};

export default CommonCard;

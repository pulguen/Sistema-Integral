// src/features/facturacion/components/BombeoAgua/ClientSearch.jsx
import React from "react";
import { InputGroup, Form, ListGroup, Spinner, Row, Col } from "react-bootstrap";

export default function ClientSearch({
  searchTerm,
  onSearchTermChange,
  clients,
  loading,
  showList,
  onScroll,
  onClientSelect,
  dropdownRef
}) {
  return (
    <section className="form-section mb-4">
      <h4 className="mb-3 text-secondary">Información del Cliente</h4>
      <Row>
        <Col md={6} ref={dropdownRef} className="position-relative">
          <InputGroup>
            <Form.Control
              placeholder="Buscar por DNI, NOMBRE o APELLIDO"
              aria-label="Buscar por DNI, NOMBRE o APELLIDO" 
              value={searchTerm}
              onChange={e => onSearchTermChange(e.target.value)}
              autoComplete="off"
            />
            {loading && (
              <InputGroup.Text>
                <Spinner animation="border" size="sm" />
              </InputGroup.Text>
            )}
          </InputGroup>
          {showList && (
          <ListGroup
            className="position-absolute w-100 client-dropdown"
            style={{ maxHeight: 200, overflowY: "auto", zIndex: 1000 }}
            onScroll={onScroll}
          >
            {clients.map(c => {
              if (!c.persona) return null; // Protege ante datos rotos
              return (
                <ListGroup.Item
                  key={c.id}
                  action
                  onClick={() => onClientSelect(c.id)}
                >
                  {c.persona.nombre} {c.persona.apellido} — {c.persona.dni}
                </ListGroup.Item>
              );
            })}
          </ListGroup>
          )}
        </Col>
      </Row>
    </section>
  );
}

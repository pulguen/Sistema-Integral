import React, { useState, useEffect } from "react";
import { InputGroup, Form, Button, Spinner, ListGroup } from "react-bootstrap";
import { FaSearch, FaTimes } from "react-icons/fa";

/**
 * Props:
 * - searchClients: función async (stringTerm) => array de clientes [{id, persona: {nombre, apellido, dni}, ...}]
 * - onClientSelect: función (cliente) => void
 * - servicesAllowed: array de id de servicios del usuario
 * - placeholder: string opcional
 */
export default function ClientSearch({
  searchClients,
  onClientSelect,
  servicesAllowed = [],
  placeholder = "Buscar clientes por Dni, Apellido o Nombre..."
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Lógica de búsqueda
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const found = await searchClients(searchTerm);
      // Filtrar por servicios permitidos
      const filtered = found.filter(c =>
        Array.isArray(c.servicios) &&
        c.servicios.some(s => servicesAllowed.includes(s.id))
      );
      setResults(filtered);
      setShowDropdown(true);
    } finally {
      setSearching(false);
    }
  };

  // Permitir Enter para buscar
  const handleKeyDown = e => {
    if (e.key === "Enter") handleSearch();
  };

  // Resetear búsqueda
  const handleReset = () => {
    setSearchTerm("");
    setResults([]);
    setShowDropdown(false);
  };

  // Selección de cliente
  const handleSelect = cli => {
    setShowDropdown(false);
    setResults([]);
    setSearchTerm(`${cli.persona.nombre} ${cli.persona.apellido}`);
    onClientSelect(cli);
  };

  // Ocultar dropdown al hacer click fuera
  useEffect(() => {
    if (!showDropdown) return;
    const handler = e => {
      if (!e.target.closest(".client-search-dropdown")) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  return (
    <div style={{ position: "relative" }}>
      <InputGroup>
        <Form.Control
          placeholder={placeholder}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {searchTerm && (
          <Button variant="outline-secondary" onClick={handleReset}>
            <FaTimes />
          </Button>
        )}
        <Button variant="primary" onClick={handleSearch} disabled={searching}>
          {searching ? <Spinner size="sm" animation="border" /> : <FaSearch />}
        </Button>
      </InputGroup>
      {/* Resultados */}
      {showDropdown && (
        <ListGroup
          className="client-search-dropdown"
          style={{
            position: "absolute",
            zIndex: 20,
            width: "100%",
            maxHeight: 240,
            overflowY: "auto",
            background: "#fff"
          }}
        >
          {results.length === 0 && (
            <ListGroup.Item className="text-muted">
              Sin resultados o sin servicios permitidos
            </ListGroup.Item>
          )}
          {results.map(cli => (
            <ListGroup.Item
              key={cli.id}
              action
              onClick={() => handleSelect(cli)}
              style={{ cursor: "pointer" }}
            >
              <strong>{cli.persona.nombre} {cli.persona.apellido}</strong>
              {" - DNI: "}
              {cli.persona.dni}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}
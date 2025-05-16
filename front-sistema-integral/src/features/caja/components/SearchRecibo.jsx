// SearchRecibo.jsx
import React from 'react';
import { Form } from 'react-bootstrap';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import { FaSearch, FaEraser } from 'react-icons/fa';

const SearchRecibo = ({
  busqueda,
  setBusqueda,
  busquedaManual,
  setBusquedaManual,
  handleBuscarRecibo,
  handleLimpiar,
  loading,
  canSearch,
  inputRef
}) => {
  return (
    <>
      <Form.Group controlId="busqueda" className="mb-3">
        <Form.Label>Buscar recibo</Form.Label>
        <Form.Control
          type="text"
          placeholder="Escanee el código de barras con el lector o ingrese número de recibo"
          value={busqueda}
          ref={inputRef}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleBuscarRecibo();
            }
          }}
          aria-label="Búsqueda de recibo"
        />
        <Form.Text muted>
          {busquedaManual
            ? "Ingrese el número de recibo manualmente."
            : "Escanee el código de barras completo con el lector."}
        </Form.Text>
        <Form.Switch
          id="busqueda-manual-switch"
          label="Búsqueda manual"
          className="mt-2"
          checked={busquedaManual}
          onChange={(e) => setBusquedaManual(e.target.checked)}
        />
      </Form.Group>
      <div className="d-flex align-items-center gap-2">
        <CustomButton
          variant="primary"
          onClick={handleBuscarRecibo}
          disabled={loading || !canSearch}
        >
          <FaSearch style={{ marginRight: '5px' }} />
          {loading ? 'Buscando...' : 'Buscar Recibo'}
        </CustomButton>
        <CustomButton variant="danger" onClick={handleLimpiar} disabled={loading}>
          <FaEraser style={{ marginRight: '5px' }} />
          Limpiar
        </CustomButton>
      </div>
    </>
  );
};

export default SearchRecibo;
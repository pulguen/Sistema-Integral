import React from 'react';
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import { FaSearch, FaEraser, FaKeyboard, FaBarcode, FaMoneyCheckAlt } from 'react-icons/fa';

const SearchRecibo = ({
  busqueda,
  setBusqueda,
  busquedaManual,
  setBusquedaManual,
  handleBuscarRecibo,
  handleLimpiar,
  loading,
  canSearch,
  inputRef,
  onCobrarSeleccionados,
  puedenCobrarSeleccionados,
  cantidadRecibos,
  cajaCerrada
}) => {
  const modoBusqueda = busquedaManual
    ? {
        label: 'BÚSQUEDA MANUAL',
        icon: <FaKeyboard className="me-2" />,
        bg: 'bg-warning-subtle border border-warning text-warning-emphasis',
        description: 'Ingrese el número de recibo manualmente.'
      }
    : {
        label: 'LECTOR DE CÓDIGO DE BARRAS',
        icon: <FaBarcode className="me-2" />,
        bg: 'bg-info-subtle border border-info text-info-emphasis',
        description: 'Escanee el código de barras completo con el lector.'
      };

  const toggleBusquedaManual = () => setBusquedaManual(v => !v);

  const cobrarDisabled = !puedenCobrarSeleccionados || cajaCerrada;
  let cobrarTooltip = '';
  if (cajaCerrada) cobrarTooltip = 'La caja ya fue cerrada por hoy.';
  else if (!puedenCobrarSeleccionados) cobrarTooltip = 'No hay recibos seleccionados disponibles para cobrar.';

  return (
    <>
      <h6><strong>Tipo de búsqueda</strong></h6>
      <div
        className={`d-flex align-items-center mb-3 p-2 rounded justify-content-between w-100 ${modoBusqueda.bg}`}
        style={{
          transition: 'background 0.3s, color 0.3s',
          cursor: 'pointer',
          minHeight: 48,
          minWidth: 340,
          maxWidth: 450
        }}
        onClick={toggleBusquedaManual}
      >
        <div className="d-flex align-items-center fw-bold fs-6 position-relative" style={{ width: 300 }}>
          <span style={{
            visibility: 'hidden',
            position: 'absolute',
            pointerEvents: 'none'
          }}>
            <FaBarcode className="me-2" />
            LECTOR DE CÓDIGO DE BARRAS
          </span>
          {modoBusqueda.icon}
          {modoBusqueda.label}
        </div>
        <OverlayTrigger
          overlay={
            <Tooltip>
              Alternar entre búsqueda manual y con lector de código de barras
            </Tooltip>
          }
        >
          <Form.Switch
            id="busqueda-manual-switch"
            label=""
            checked={busquedaManual}
            onChange={e => {
              e.stopPropagation();
              setBusquedaManual(e.target.checked);
            }}
            style={{ pointerEvents: 'auto' }}
          />
        </OverlayTrigger>
      </div>

      <Form.Group controlId="busqueda" className="mb-3">
        <Form.Label><strong>Buscar recibo</strong></Form.Label>
        <Form.Control
          type="text"
          placeholder="Escanee el código de barras o ingrese número de recibo"
          value={busqueda}
          ref={inputRef}
          onChange={e => setBusqueda(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleBuscarRecibo();
            }
          }}
          aria-label="Búsqueda de recibo"
          className={`fw-bold ${busquedaManual ? 'border-warning' : 'border-info'}`}
        />
        <Form.Text muted className="fw-semibold">
          {modoBusqueda.description}
        </Form.Text>
      </Form.Group>

      <div className="d-flex align-items-center gap-2">
        <CustomButton
          variant="primary"
          onClick={handleBuscarRecibo}
          disabled={loading || !canSearch}
        >
          <FaSearch className="me-2" />
          {loading ? 'Buscando...' : 'Buscar Recibo'}
        </CustomButton>
        <OverlayTrigger
          placement="top"
          overlay={cobrarDisabled ? <Tooltip>{cobrarTooltip}</Tooltip> : <></>}
        >
          <span>
            <CustomButton
              variant="success"
              onClick={onCobrarSeleccionados}
              disabled={cobrarDisabled}
              tabIndex={cobrarDisabled ? -1 : 0}
            >
              <FaMoneyCheckAlt className="me-2" />
              {cantidadRecibos > 1
                ? `Cobrar ${cantidadRecibos} recibos`
                : "Cobrar recibo"}
            </CustomButton>
          </span>
        </OverlayTrigger>
        <CustomButton
          variant="danger"
          onClick={handleLimpiar}
          disabled={loading}
        >
          <FaEraser className="me-2" />
          Limpiar
        </CustomButton>
      </div>
    </>
  );
};

export default SearchRecibo;

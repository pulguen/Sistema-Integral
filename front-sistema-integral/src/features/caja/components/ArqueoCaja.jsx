import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { Card, Spinner, Breadcrumb } from "react-bootstrap";
import { Link } from "react-router-dom";
import customFetch from "../../../context/CustomFetch.js";
import Swal from "sweetalert2";
import CommonTable from "../../../components/common/table/table.jsx";
import CustomButton from "../../../components/common/botons/CustomButton.jsx";
import { AuthContext } from "../../../context/AuthContext";
import { formatDateToDMY } from "../../../utils/dateUtils.js";
import DetalleCierreModal from "../../../components/common/modals/DetalleCierreModal";
import formatNumber from "../../../utils/formatNumber.js";

// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCashRegister, faSyncAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";

// Reutilizado del sistema de caja
import RecibosProcesadosHoy from "./RecibosProcesadosHoy";

const ArqueoCaja = () => {
  const { user } = useContext(AuthContext);
  const hasPermission = (permission) => user.permissions.includes(permission);

  const [loading, setLoading] = useState(false);
  const [cierre, setCierre] = useState(null);
  const [cierresList, setCierresList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [recibosHoy, setRecibosHoy] = useState([]);
  const [loadingRecibosHoy, setLoadingRecibosHoy] = useState(false);

  // Estados para el modal de detalle
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [detalleCierre, setDetalleCierre] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [detalleError, setDetalleError] = useState("");

  // --- FUNCIONES DE ARQUEO ---

  const handleCierreCaja = async () => {
    setLoading(true);
    try {
      const response = await customFetch("/cierres", "POST");
      setCierre(response);

      Swal.fire({
        icon: "success",
        title: "Cierre generado correctamente",
        text: `Cierre creado para el día ${formatDateToDMY(response.f_cierre)}`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      fetchCierresList();
      fetchRecibosHoy(); // refrescar también el resumen
    } catch (error) {
      console.error("Error generando cierre de caja:", error);
      let errorString = "";
      if (typeof error === "string") errorString = error;
      else if (error.error) errorString = error.error;
      else if (error.body) errorString = error.body;
      else if (error.message) errorString = error.message;

      if (errorString.includes("Duplicate entry")) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ya se ha generado el cierre de caja para el día de hoy.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo generar el cierre de caja.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCierre = () => {
    Swal.fire({
      title: "¿Confirmás el cierre de caja?",
      text: "Esta acción no puede deshacerse. Se generará un cierre para el día actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, generar cierre",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        handleCierreCaja();
      }
    });
  };

  const fetchCierresList = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await customFetch("/cierres", "GET");
      if (response && Array.isArray(response.data)) {
        setCierresList(response.data);
      } else if (Array.isArray(response)) {
        setCierresList(response);
      } else {
        setCierresList([]);
      }
    } catch (error) {
      Swal.fire("Error", "Error al obtener cierres.", "error");
      console.error("Error al obtener cierres:", error);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const fetchRecibosHoy = useCallback(async () => {
    setLoadingRecibosHoy(true);
    try {
      const fechaPago = new Date().toISOString().split("T")[0];
      const response = await customFetch(`/recibos/pagados/${fechaPago}`);
      let dataArray = [];
      if (response?.data && Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (Array.isArray(response)) {
        dataArray = response;
      }
      setRecibosHoy(dataArray);
    } catch (err) {
      console.error("Error al obtener los recibos de hoy:", err);
    } finally {
      setLoadingRecibosHoy(false);
    }
  }, []);

  useEffect(() => {
    fetchCierresList();
    fetchRecibosHoy();
  }, [fetchCierresList, fetchRecibosHoy]);

  // --- FUNCIONES DE DETALLE DE CIERRE ---

  const fetchDetalleCierre = async (id) => {
    setLoadingDetalle(true);
    setDetalleCierre(null);
    setDetalleError("");
    try {
      const response = await customFetch(`/cierres/${id}`, "GET");
      console.log("DETALLE CIERRE RAW:", response);
      setDetalleCierre(response?.data || response);
      setShowDetalleModal(true);
    } catch (error) {
      setDetalleError("No se pudo obtener el detalle del cierre.");
      setShowDetalleModal(true);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleCloseDetalle = () => {
    setShowDetalleModal(false);
    setDetalleCierre(null);
    setDetalleError("");
  };

  // --- COLUMNAS PARA CommonTable ---
  const columns = useMemo(() => [
    { Header: "ID", accessor: "id" },
    {
      Header: "Fecha Cierre",
      accessor: "f_cierre",
      Cell: ({ value }) => formatDateToDMY(value),
    },
    {
      Header: "Fecha Creación",
      accessor: "created_at",
      Cell: ({ value }) => formatDateToDMY(value),
    },
    {
      Header: "Fecha Actualización",
      accessor: "updated_at",
      Cell: ({ value }) => formatDateToDMY(value),
    },
    { Header: "N° Recibos", accessor: "t_recibos" },
    {
      Header: "Débito",
      accessor: "i_debito",
      Cell: ({ value }) => `$ ${formatNumber(value)}`,
    },
    {
      Header: "Crédito",
      accessor: "i_credito",
      Cell: ({ value }) => `$ ${formatNumber(value)}`,
    },
    {
      Header: "Recargo",
      accessor: "i_recargo",
      Cell: ({ value }) => `$ ${formatNumber(value)}`,
    },
    {
      Header: "Descuento",
      accessor: "i_descuento",
      Cell: ({ value }) => `$ ${formatNumber(value)}`,
    },
    {
      Header: "Total",
      accessor: "i_total",
      Cell: ({ value }) => `$ ${formatNumber(value)}`,
    },
    // --- COLUMNA DE ACCIÓN ---
    {
      Header: "Acción",
      id: "detalle",
      Cell: ({ row }) => (
        <CustomButton
          variant="outline-primary"
          size="sm"
          onClick={() => fetchDetalleCierre(row.original.id)}
        >
          Ver Detalle
        </CustomButton>
      )
    }
  ], []);

  // --- RENDER ---
  return (
    <Card className="p-4 mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Inicio
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/Home Caja" }}>
          Caja
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Cierre de Caja</Breadcrumb.Item>
      </Breadcrumb>

      <h2 className="text-center mb-4 text-primary">Cierre de Caja</h2>
      <h5 className="text-center mb-4 text-primary">Genera el cierre de caja correspondiente a la fecha actual.</h5>

      {/* Mostramos resumen de recibos pagados hoy */}
      <RecibosProcesadosHoy
        recibosHoy={recibosHoy}
        loadingRecibosHoy={loadingRecibosHoy}
        fetchRecibosHoy={fetchRecibosHoy}
        canViewPaid={hasPermission("recibos.index-pagados")}
      />

      {/* Card de acción para cierre */}
      {hasPermission("cierres.store") && (
        <Card className="mb-4 shadow-sm text-center bg-light-subtle border border-danger-subtle">
          <Card.Body>
            <div className="mb-3">
              <FontAwesomeIcon icon={faCashRegister} size="3x" className="text-danger" />
            </div>
            <h4 className="text-danger">¿Listo para cerrar la caja de hoy?</h4>
            <p className="text-muted">
              Esta acción registrará todos los movimientos realizados hoy. Verificá que no falte ningún cobro.
            </p>
            <CustomButton
              variant="danger"
              size="lg"
              className="px-4 py-2 fs-5 fw-bold"
              onClick={handleConfirmCierre}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                  Generando cierre...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCashRegister} className="me-2" />
                  Generar Cierre de Caja
                </>
              )}
            </CustomButton>
          </Card.Body>
        </Card>
      )}

      {/* Detalle del cierre generado */}
      {cierre && (
        <div className="mt-3">
          <h4>Detalle del Cierre Generado:</h4>
          <CommonTable columns={columns} data={[cierre]} />
        </div>
      )}

      {/* Historial de cierres */}
      <div className="mt-4">
        <h4>Historial de Cierres de Caja</h4>
        <CustomButton onClick={fetchCierresList} disabled={loadingList}>
          <FontAwesomeIcon icon={faSyncAlt} className="me-2" />
          {loadingList ? "Cargando..." : "Refrescar Historial"}
        </CustomButton>
        {loadingList ? (
          <div className="text-center mt-3">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          </div>
        ) : hasPermission("cierres.show") ? (
          cierresList.length > 0 ? (
            <CommonTable columns={columns} data={cierresList} />
          ) : (
            <p className="mt-3 text-center">No se encontraron cierres anteriores.</p>
          )
        ) : (
          <div className="mt-3 text-center text-danger">
            Tu usuario no cuenta con autorización para visualizar el historial de cierres de caja.
          </div>
        )}
      </div>

      {/* Modal de Detalle de Cierre */}
      <DetalleCierreModal
        show={showDetalleModal}
        onHide={handleCloseDetalle}
        loading={loadingDetalle}
        detalle={detalleCierre}
        error={detalleError}
      />
    </Card>
  );
};

export default ArqueoCaja;

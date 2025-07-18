import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { Card, Spinner, Breadcrumb, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import CommonTable from "../../../components/common/table/table.jsx";
import CustomButton from "../../../components/common/botons/CustomButton.jsx";
import { AuthContext } from "../../../context/AuthContext";
import { formatDateToDMY, formatDateOnlyDMY } from "../../../utils/dateUtils.js";
import DetalleCierreModal from "../../../components/common/modals/DetalleCierreModal";
import formatNumber from "../../../utils/formatNumber.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCashRegister, faSyncAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";
import RecibosProcesadosHoy from "./RecibosProcesadosHoy";
import { CajaContext } from "../../../context/CajaContext.jsx";
import customFetch from "../../../context/CustomFetch.js";

const ArqueoCaja = () => {
  const { user } = useContext(AuthContext);
  const hasPermission = (permission) => user.permissions.includes(permission);

  // Contextos (ya extraigo el nuevo fetchRecibosPorFechaYCierre)
  const { fetchDetalleCierre, fetchRecibos, fetchRecibosPorFechaYCierre } = useContext(CajaContext);

  // Estados principales
  const [loading, setLoading] = useState(false);
  const [cierre, setCierre] = useState(null);
  const [cierresList, setCierresList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [recibosHoy, setRecibosHoy] = useState([]);
  const [loadingRecibosHoy, setLoadingRecibosHoy] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [detalleCierre, setDetalleCierre] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [detalleError, setDetalleError] = useState("");
  const [cajaCerradaHoy, setCajaCerradaHoy] = useState(false);
  const [detalleCargandoId, setDetalleCargandoId] = useState(null);

  // Memo para las fechas cerradas
  const fechasCerradasSet = useMemo(
    () => new Set(cierresList.map((c) => (c.f_cierre || "").slice(0, 10))),
    [cierresList]
  );

  // Verifica si la caja de hoy ya está cerrada
  const verificarCajaCerradaHoy = useCallback((cierres) => {
    const hoy = new Date().toISOString().split("T")[0];
    return cierres.some(
      (cierre) => (cierre.f_cierre || "").slice(0, 10) === hoy
    );
  }, []);

  // Fetch historial de cierres
  const fetchCierresList = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await customFetch("/cierres", "GET");
      let lista = [];
      if (response && Array.isArray(response.data)) {
        lista = response.data;
      } else if (Array.isArray(response)) {
        lista = response;
      }
      lista.sort((a, b) => new Date(b.f_cierre) - new Date(a.f_cierre));
      setCierresList(lista);
      setCajaCerradaHoy(verificarCajaCerradaHoy(lista));
    } catch (error) {
      console.error("Error al obtener cierres:", error);
      Swal.fire("Error", "Error al obtener cierres.", "error");
      setCierresList([]);
      setCajaCerradaHoy(false);
    } finally {
      setLoadingList(false);
    }
  }, [verificarCajaCerradaHoy]);

  // Fetch recibos de hoy (por defecto solo pagados; podés poner [1,2] si querés ambos)
const fetchRecibosHoy = useCallback(async () => {
  setLoadingRecibosHoy(true);
  try {
    const fechaPago = new Date().toISOString().split("T")[0];
    const recibos = await fetchRecibos({
      f_pago_min: fechaPago,
      f_pago_max: fechaPago,
      condicion_pago_id: [1, 2]
    });
    setRecibosHoy(recibos);
  } catch (err) {
    setRecibosHoy([]);
  } finally {
    setLoadingRecibosHoy(false);
  }
}, [fetchRecibos]);


  useEffect(() => {
    fetchCierresList();
    fetchRecibosHoy();
  }, [fetchCierresList, fetchRecibosHoy]);

  // Nuevo: Traer ambos tipos de recibos para el detalle de cierre en UN solo request
  const traerRecibosPorFecha = useCallback(
    async (fecha) => {
      // usa el context optimizado!
      return await fetchRecibosPorFechaYCierre(fecha);
    },
    [fetchRecibosPorFechaYCierre]
  );

  // Detalle extendido de cierre
  const fetchDetalleCierreExtendido = useCallback(
    async (id, f_cierre) => {
      setDetalleCargandoId(id);
      setLoadingDetalle(true);
      setDetalleCierre(null);
      setDetalleError("");
      try {
        const cierreResponse = await fetchDetalleCierre(id);
        const fecha = f_cierre.slice(0, 10);
        const recibos = await traerRecibosPorFecha(fecha); // Un solo fetch
        setDetalleCierre({
          ...cierreResponse,
          recibosPagados: recibos.pagados,
          recibosAnulados: recibos.anulados,
        });
        setShowDetalleModal(true);
      } catch (error) {
        setDetalleError("No se pudo obtener el detalle del cierre.");
        setShowDetalleModal(true);
      } finally {
        setLoadingDetalle(false);
        setDetalleCargandoId(null);
      }
    },
    [fetchDetalleCierre, traerRecibosPorFecha]
  );

  // Cierre de caja
  const handleCierreCaja = async (fecha) => {
    setLoading(true);
    try {
      const response = await customFetch("/cierres", "POST", { fecha });
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
      fetchRecibosHoy();
    } catch (error) {
      let errorString = "";
      if (typeof error === "string") errorString = error;
      else if (error?.error) errorString = error.error;
      else if (error?.body) errorString = error.body;
      else if (error?.message) errorString = error.message;

      if (
        errorString &&
        errorString.includes("No existen recibos con fecha de pago")
      ) {
        Swal.fire({
          icon: "error",
          title: "No se puede generar el cierre",
          text:
            "No existen recibos con fecha de pago para la fecha seleccionada. No es posible generar el cierre de caja para ese día.",
        });
        return;
      }
      if (errorString?.includes("Duplicate entry")) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ya se ha generado el cierre de caja para el día seleccionado.",
        });
        return;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo generar el cierre de caja.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Utilidad para parsear fecha local
  function parseLocalDate(dateString) {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // Confirmación de cierre
  const handleConfirmCierre = () => {
    const hoyISO = new Date().toISOString().slice(0, 10);

    Swal.fire({
      title: "¿Confirmás el cierre de caja?",
      html: `
        <label for="fechaCierreInput" style="display:block; margin-bottom:4px;">Fecha de cierre</label>
        <input id="fechaCierreInput" type="date" class="swal2-input" value="${hoyISO}" max="${hoyISO}" style="width:auto; margin:0 auto 10px auto;" />
        <div style="font-size:0.93em;color:#555;margin-top:8px;">
          Esta acción no puede deshacerse.<br>
          Se generará el cierre para la fecha seleccionada.
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, generar cierre",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const fechaElegida = document.getElementById("fechaCierreInput").value;
        if (!fechaElegida) {
          Swal.showValidationMessage("Debés seleccionar una fecha de cierre.");
          return false;
        }
        const dia = parseLocalDate(fechaElegida).getDay();
        if (dia === 0 || dia === 6) {
          Swal.showValidationMessage(
            "No podés realizar el cierre de caja en sábado o domingo. Seleccioná un día hábil."
          );
          return false;
        }
        if (fechasCerradasSet.has(fechaElegida)) {
          Swal.showValidationMessage(
            "Ya existe un cierre para esa fecha. Elegí otra."
          );
          return false;
        }
        return fechaElegida;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        handleCierreCaja(result.value);
      }
    });
  };

  // Handler para cerrar modal de detalle
  const handleCloseDetalle = () => {
    setShowDetalleModal(false);
    setDetalleCierre(null);
    setDetalleError("");
  };

  // Columnas para la tabla
  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      {
        Header: "Fecha Cierre",
        accessor: "f_cierre",
        Cell: ({ value }) => formatDateOnlyDMY(value),
      },
      {
        Header: "Fecha Creación",
        accessor: "created_at",
        Cell: ({ value }) => formatDateOnlyDMY(value),
      },
      {
        Header: "Fecha Actualización",
        accessor: "updated_at",
        Cell: ({ value }) => formatDateOnlyDMY(value),
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
      {
        Header: "Acción",
        id: "detalle",
        Cell: ({ row }) => (
          <CustomButton
            variant="outline-primary"
            size="sm"
            onClick={() =>
              fetchDetalleCierreExtendido(row.original.id, row.original.f_cierre)
            }
            disabled={detalleCargandoId !== null}
          >
            {detalleCargandoId === row.original.id ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
              </>
            ) : (
              "Ver Detalle"
            )}
          </CustomButton>
        ),
      },
    ],
    [detalleCargandoId, fetchDetalleCierreExtendido]
  );

  // Render principal
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
      <h5 className="text-center mb-4 text-primary">
        Genera el cierre de caja correspondiente a la fecha seleccionada.
      </h5>

      {/* ALERTA si la caja de hoy ya está cerrada */}
      {cajaCerradaHoy && (
        <Alert variant="info" className="text-center">
          <b>
            La caja de hoy ya fue cerrada. No se puede volver a generar el cierre.
          </b>
        </Alert>
      )}

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
              <FontAwesomeIcon
                icon={faCashRegister}
                size="3x"
                className="text-danger"
              />
            </div>
            <h4 className="text-danger">¿Listo para cerrar la caja?</h4>
            <p className="text-muted">
              Esta acción registrará todos los movimientos de la fecha que selecciones. Verificá que no falte ningún cobro.
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

      {cierre && (
        <div className="mt-3">
          <h4>Detalle del Cierre Generado:</h4>
          <CommonTable columns={columns} data={[cierre]} />
        </div>
      )}

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
            <p className="mt-3 text-center">
              No se encontraron cierres anteriores.
            </p>
          )
        ) : (
          <div className="mt-3 text-center text-danger">
            Tu usuario no cuenta con autorización para visualizar el historial de cierres de caja.
          </div>
        )}
      </div>

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

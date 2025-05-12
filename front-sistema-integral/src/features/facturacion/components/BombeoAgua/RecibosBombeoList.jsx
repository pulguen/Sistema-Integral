import React, { useContext, useCallback, useState } from "react";
import { Table } from "react-bootstrap";
import { FaTrash, FaCheck, FaInfoCircle } from "react-icons/fa";
import CustomButton from "../../../../components/common/botons/CustomButton.jsx";
import Swal from "sweetalert2";
import "../../../../styles/EmptyState.css";
import customFetch from "../../../../context/CustomFetch.js";
import { BombeoAguaContext } from "../../../../context/BombeoAguaContext.jsx";
import ReciboImprimibleModal from "../../../../components/common/modals/ReciboImprimibleModal.jsx";

const RecibosBombeoList = () => {
  const { recibos, handleConfirmRecibo, handleDeleteRecibo } = useContext(
    BombeoAguaContext
  );
  const [showReciboModal, setShowReciboModal] = useState(false);
  const [confirmedRecibo, setConfirmedRecibo] = useState(null);

  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const confirmRecibo = useCallback(
    async (recibo) => {
      try {
        const { isConfirmed } = await Swal.fire({
          title: "¿Confirmar Recibo?",
          text: "No podrás revertir esta acción.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, confirmar",
        });
        if (!isConfirmed) return;

        const formatVenc = (v) => {
          const d = parseLocalDate(v);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`;
        };

        const newRecibosData = {
          cliente_id: recibo.cliente_id.toString(),
          cuenta_corriente: recibo.periodos.map((p) => p.id.toString()),
          f_vencimiento: formatVenc(recibo.vencimiento),
          comentario: recibo.observaciones,
        };
        const response = await customFetch("/recibos", "POST", newRecibosData);
        if (response?.n_recibo) {
          const updated = {
            ...recibo,
            n_recibo: response.n_recibo,
            created_at: response.created_at,
            barcode: response.codigo_barra,
            importe: response.i_debito,
            recargo: response.i_recargo,
            descuento: response.i_descuento,
            total: response.i_total,
            observaciones: response.comentarios[0]?.cuerpo || "",
          };
          handleConfirmRecibo(updated);
          setConfirmedRecibo(updated);
          setShowReciboModal(true);
          Swal.fire(
            "Confirmado",
            "El recibo ha sido confirmado y registrado.",
            "success"
          );
        } else {
          Swal.fire("Error", "No se recibió el número de recibo.", "error");
        }
      } catch {
        Swal.fire("Error", "Hubo un problema al confirmar el recibo.", "error");
      }
    },
    [handleConfirmRecibo]
  );

  const deleteRecibo = useCallback(
    (recibo) => {
      Swal.fire({
        title: "¿Eliminar Recibo?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
      }).then((result) => {
        if (result.isConfirmed) {
          handleDeleteRecibo(recibo);
          Swal.fire("Eliminado", "El recibo ha sido eliminado.", "success");
        }
      });
    },
    [handleDeleteRecibo]
  );

  const handleCloseModal = () => {
    setShowReciboModal(false);
    setConfirmedRecibo(null);
  };

  return (
    <>
      {recibos.length > 0 ? (
        <div className="table-responsive">
          <h3 className="mt-4">Vista Previa de datos para el recibo</h3>
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>DNI/CUIT</th>
                <th>Volumen (m³)</th>
                <th>Total a Pagar</th>
                <th>Vencimiento</th>
                <th>Períodos Incluidos</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recibos.map((recibo, i) => {
                const volumen = recibo.volumen != null
                  ? recibo.volumen
                  : recibo.periodos.reduce(
                      (sum, p) => sum + (parseFloat(p.cantidad) || 0),
                      0
                    );
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      {recibo.cliente_nombre} {recibo.cliente_apellido}
                    </td>
                    <td>{recibo.cliente_dni}</td>
                    <td>{volumen.toFixed(2)}</td>
                    <td>
                      AR$ {recibo.totalAmount?.toFixed(2) ?? "0.00"}
                    </td>
                    <td>
                      {recibo.vencimiento
                        ? parseLocalDate(recibo.vencimiento).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {recibo.periodos && recibo.periodos.length > 0
                        ? recibo.periodos.map((p, idx) => (
                            <span key={idx}>
                              {p.mes}/{p.año}
                              {idx < recibo.periodos.length - 1 ? ", " : ""}
                            </span>
                          ))
                        : "N/A"}
                    </td>
                    <td>{recibo.observaciones}</td>
                    <td>
                      <CustomButton
                        variant="success"
                        onClick={() => confirmRecibo(recibo)}
                      >
                        <FaCheck className="me-1" /> Confirmar
                      </CustomButton>{" "}
                      <CustomButton
                        variant="danger"
                        onClick={() => deleteRecibo(recibo)}
                      >
                        <FaTrash className="me-1" /> Eliminar
                      </CustomButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className="empty-state-container text-center mt-5">
          <FaInfoCircle
            className="empty-state-icon text-muted mb-3"
            size={60}
          />
          <h4 className="text-muted">No hay recibos disponibles para generar</h4>
          <p className="text-muted">
            Parece que no hay recibos generados todavía. Puedes crear uno nuevo.
          </p>
        </div>
      )}

      {confirmedRecibo && (
        <ReciboImprimibleModal
          show={showReciboModal}
          handleClose={handleCloseModal}
          recibo={confirmedRecibo}
        />
      )}
    </>
  );
};

export default RecibosBombeoList;

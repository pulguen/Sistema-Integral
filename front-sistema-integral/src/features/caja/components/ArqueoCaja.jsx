import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { Card, Spinner, Breadcrumb } from "react-bootstrap";
import { Link } from "react-router-dom";
import customFetch from "../../../context/CustomFetch.js";
import Swal from "sweetalert2";
import CommonTable from "../../../components/common/table/table.jsx";
import CustomButton from "../../../components/common/botons/CustomButton.jsx";
import { AuthContext } from "../../../context/AuthContext"; // Asegúrate de que la ruta sea la correcta

const ArqueoCaja = () => {
  // Se obtiene el usuario desde AuthContext y se define hasPermission
  const { user } = useContext(AuthContext);
  const hasPermission = (permission) => user.permissions.includes(permission);

  const [loading, setLoading] = useState(false);
  const [cierre, setCierre] = useState(null);
  const [cierresList, setCierresList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Función para generar el cierre de caja (se asume que el servidor genera el cierre con la fecha actual)
  const handleCierreCaja = async () => {
    setLoading(true);
    try {
      const response = await customFetch("/cierres", "POST");
      console.log("Cierre de caja generado:", response);
      setCierre(response);
      Swal.fire({
        icon: "success",
        title: "Cierre de caja generado",
        text: `Cierre creado para ${response.f_cierre}`,
      });
      // Refrescar el historial luego de generar el cierre
      fetchCierresList();
    } catch (error) {
      console.error("Error generando cierre de caja:", error);
      let errorString = "";
      if (typeof error === "string") {
        errorString = error;
      } else if (error.error) {
        errorString = error.error;
      } else if (error.body) {
        errorString = error.body;
      } else if (error.message) {
        errorString = error.message;
      }
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

  // Función para obtener el historial de cierres (GET /cierres)
  const fetchCierresList = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await customFetch("/cierres", "GET");
      console.log("Listado de cierres:", response);
      // Si la respuesta está paginada, se extrae la propiedad "data"
      if (response && Array.isArray(response.data)) {
        setCierresList(response.data);
      } else if (Array.isArray(response)) {
        setCierresList(response);
      } else {
        setCierresList([]);
      }
    } catch (error) {
      Swal.fire("Error", "Error al obtener clientes.", "error");
      console.error("Error al obtener clientes:", error);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchCierresList();
  }, [fetchCierresList]);

  // Definición de columnas para mostrar la información del cierre
  const columns = useMemo(() => [
    { Header: "ID", accessor: "id" },
    {
      Header: "Fecha Cierre",
      accessor: "f_cierre",
      Cell: ({ value }) => new Date(value).toLocaleString()
    },
    {
      Header: "Fecha Creación",
      accessor: "created_at",
      Cell: ({ value }) => new Date(value).toLocaleString()
    },
    {
      Header: "Fecha Actualización",
      accessor: "updated_at",
      Cell: ({ value }) => new Date(value).toLocaleString()
    },
    {
      Header: "Débito",
      accessor: "i_debito",
      Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`
    },
    {
      Header: "Crédito",
      accessor: "i_credito",
      Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`
    },
    {
      Header: "Recargo",
      accessor: "i_recargo",
      Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`
    },
    {
      Header: "Descuento",
      accessor: "i_descuento",
      Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`
    },
    {
      Header: "Total",
      accessor: "i_total",
      Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`
    },
    { Header: "Total de Recibos", accessor: "t_recibos" },
  ], []);

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
      <p>Genera el cierre de caja correspondiente a la fecha actual.</p>
      <CustomButton
        onClick={hasPermission("cierres.store") ? handleCierreCaja : undefined}
        disabled={loading || !hasPermission("cierres.store")}
      >
        {loading ? (
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
        ) : (
          "Generar Cierre de Caja"
        )}
      </CustomButton>
      {cierre && (
        <div className="mt-3">
          <h4>Detalle del Cierre Generado:</h4>
          <CommonTable columns={columns} data={[cierre]} />
        </div>
      )}

      <div className="mt-4">
        <h4>Historial de Cierres de Caja</h4>
        <CustomButton onClick={fetchCierresList} disabled={loadingList}>
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
    </Card>
  );
};

export default ArqueoCaja;

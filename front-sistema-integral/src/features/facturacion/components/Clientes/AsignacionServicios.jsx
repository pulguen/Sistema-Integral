import React, { useMemo } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import CustomButton from '../../../../components/common/botons/CustomButton.jsx';
import { FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function AsignacionServicios({
  serviciosDisponibles,
  tributos,
  serviciosAsignados,
  setServiciosAsignados,
  onAsignar,
  hasPermission
}) {
  const groupedServices = useMemo(() => {
    return serviciosDisponibles.reduce((acc, s) => {
      const t = tributos[s.tributo_id] || { nombre: `Tributo ${s.tributo_id}` };
      if (!acc[s.tributo_id]) acc[s.tributo_id] = { tributo: t, services: [] };
      acc[s.tributo_id].services.push(s);
      return acc;
    }, {});
  }, [serviciosDisponibles, tributos]);

  const handleAsignar = async () => {
    if (serviciosAsignados.length === 0) {
      return Swal.fire('Error', 'Debe seleccionar al menos un servicio.', 'error');
    }
    try {
      await onAsignar();
    } catch {
      Swal.fire('Error', 'Hubo un problema al asignar los servicios.', 'error');
    }
  };

  return (
    <Form>
      <Form.Group controlId="servicios">
        {Object.entries(groupedServices).map(([_, group]) => (
          <div key={group.tributo.id} className="mb-3">
            <h6 className="text-primary">{group.tributo.nombre}</h6>
            <Row>
              {group.services.map(s => (
                <Col md={6} key={s.id}>
                  <Form.Check
                    type="checkbox"
                    label={s.nombre}
                    value={s.id}
                    checked={serviciosAsignados.includes(s.id)}
                    onChange={() =>
                      setServiciosAsignados(prev =>
                        prev.includes(s.id)
                          ? prev.filter(x => x !== s.id)
                          : [...prev, s.id]
                      )
                    }
                  />
                </Col>
              ))}
            </Row>
          </div>
        ))}
      </Form.Group>
      <CustomButton
        variant="primary"
        className="mt-3"
        onClick={handleAsignar}
        disabled={!hasPermission('clientes.sync-serv')}
      >
        <FaSave /> Asignar Servicios
      </CustomButton>
    </Form>
  );
}

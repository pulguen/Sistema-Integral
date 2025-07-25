// src/mocks/mockRecibos.js

const mockRecibos = [
  {
    id: 1,
    n_recibo: 1001,
    emisor: { name: "María López" },
    i_debito: 150000,
    i_recargo: 3000,
    i_total: 153000,
    f_vencimiento: "2025-07-15T00:00:00.000Z",
    f_pago: null,
    condicion_pago_id: 1,
    cajero: { name: "Pedro Martínez" },
    anulado: false,
    estado: "emitido",
    cancelado: false,
  },
  {
    id: 2,
    n_recibo: 1002,
    emisor: { name: "Carlos Gómez" },
    i_debito: 80000,
    i_recargo: 0,
    i_total: 80000,
    f_vencimiento: "2025-08-10T00:00:00.000Z",
    f_pago: "2025-08-01T00:00:00.000Z",
    condicion_pago_id: 2,
    cajero: { name: "Laura Fernández" },
    anulado: false,
    estado: "pagado",
    cancelado: false,
  },
  {
    id: 3,
    n_recibo: 1003,
    emisor: { name: "Ana Torres" },
    i_debito: 120000,
    i_recargo: 5000,
    i_total: 125000,
    f_vencimiento: "2025-06-01T00:00:00.000Z",
    f_pago: null,
    condicion_pago_id: 3,
    cajero: { name: "Jorge Rivas" },
    anulado: false,
    estado: "emitido",
    cancelado: false,
  },
];

export default mockRecibos;

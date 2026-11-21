import { DetalleFactura, Factura, Lote, MovimientoInventario, Producto } from '../types';
import { apiVetSoft } from './apiVetSoft';

export function listarInventario(token: string) {
  return apiVetSoft<{ productos: Producto[]; lotes: Lote[]; movimientos: MovimientoInventario[] }>('/api/inventario', token);
}

export function guardarProducto(token: string, producto: Omit<Producto, 'id_producto'>) {
  return apiVetSoft<{ idProducto: number }>('/api/inventario/productos', token, 'POST', {
    sku: producto.sku, nombre: producto.nombre, precioVenta: producto.precio_venta,
    stockMinimo: producto.stock_minimo, requiereVencimiento: producto.requiere_vencimiento,
  });
}

export function guardarLote(token: string, lote: Omit<Lote, 'id_lote'>) {
  return apiVetSoft<{ idLote: number }>('/api/inventario/lotes', token, 'POST', {
    idProducto: lote.id_producto, codigoLote: lote.codigo_lote,
    fechaVencimiento: lote.fecha_vencimiento, stockActual: lote.stock_actual,
  });
}

export function ajustarLote(token: string, idLote: number, delta: number, motivo: string) {
  return apiVetSoft<{ mensaje: string }>('/api/inventario/ajustes', token, 'POST', { idLote, delta, motivo });
}

export function listarFacturas(token: string) {
  return apiVetSoft<{ facturas: Factura[]; detallesFactura: (DetalleFactura & { id_producto: number })[] }>('/api/facturacion', token);
}

export function crearFactura(token: string, idCliente: number) {
  return apiVetSoft<{ idFactura: number }>('/api/facturacion', token, 'POST', { idCliente });
}

export function agregarDetalle(token: string, idFactura: number, idLote: number, cantidad: number) {
  return apiVetSoft<{ mensaje: string }>(`/api/facturacion/${idFactura}/detalles`, token, 'POST', { idLote, cantidad });
}

export function actualizarFactura(token: string, id: number, accion: 'confirmar' | 'anular') {
  return apiVetSoft<{ mensaje: string }>(`/api/facturacion/${id}/${accion}`, token, 'POST');
}

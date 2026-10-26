export const CATEGORIES = ['HARDWARE', 'SOFTWARE', 'RED', 'ACCESOS', 'OTRO'];
export const PRIORITIES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
export const STATUSES = ['NUEVO', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];

// Estados a los que se puede pasar desde cada estado (espejo de backend/src/domain/status.js).
// ASIGNADO se alcanza asignando un técnico, no con un botón de estado.
export const NEXT_STATUS = {
  NUEVO: [],
  ASIGNADO: ['EN_PROCESO'],
  EN_PROCESO: ['RESUELTO'],
  RESUELTO: ['CERRADO', 'EN_PROCESO'],
  CERRADO: [],
};

export const CAN_ASSIGN = ['NUEVO', 'ASIGNADO', 'EN_PROCESO'];

// Los valores del dominio viajan en mayúsculas; en pantalla se muestran en formato de oración ("En proceso").
const DISPLAY = { CRITICA: 'Crítica', EN_PROCESO: 'En proceso' };
export const label = (value) => DISPLAY[value] || value.charAt(0) + value.slice(1).toLowerCase();

// La bitácora automática la redacta el backend con los valores del dominio ("de ASIGNADO a EN_PROCESO");
// en pantalla se muestran con el mismo formato de oración que el resto de la interfaz.
export const humanizeMessage = (text) =>
  text.replace(/\b(NUEVO|ASIGNADO|EN_PROCESO|RESUELTO|CERRADO)\b/g, (status) => label(status));

export const formatDate = (iso) =>
  new Date(iso).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' });

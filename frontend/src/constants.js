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

export const label = (value) => value.replace('_', ' ');

export const formatDate = (iso) =>
  new Date(iso).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' });

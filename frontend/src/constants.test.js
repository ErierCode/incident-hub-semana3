import { describe, expect, it } from 'vitest';
import { humanizeMessage, label } from './constants.js';
import { initials } from './components/Avatar.jsx';

describe('formato de textos', () => {
  it.each([
    ['HARDWARE', 'Hardware'],
    ['RED', 'Red'],
    ['CRITICA', 'Crítica'],
    ['EN_PROCESO', 'En proceso'],
    ['CERRADO', 'Cerrado'],
  ])('label(%s) = %s', (value, expected) => {
    expect(label(value)).toBe(expected);
  });

  it('convierte los estados de la bitácora automática a formato de oración', () => {
    expect(humanizeMessage('Estado cambiado de ASIGNADO a EN_PROCESO')).toBe('Estado cambiado de Asignado a En proceso');
  });

  it('no altera los mensajes que no mencionan estados', () => {
    expect(humanizeMessage('Asignado a Ana López')).toBe('Asignado a Ana López');
  });

  it.each([
    ['Erick Pu', 'EP'],
    ['  ana lópez  ', 'AL'],
    ['Madonna', 'M'],
    ['', '?'],
  ])('iniciales de "%s" = %s', (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});

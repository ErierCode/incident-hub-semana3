// Avatar con iniciales y un color estable por nombre (paleta de personas de Fluent).
const COLORS = ['#0078d4', '#8764b8', '#038387', '#c239b3', '#ca5010', '#498205', '#4f6bed', '#a4262c'];

export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function colorFor(name) {
  let hash = 0;
  for (const char of String(name || '')) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return COLORS[hash % COLORS.length];
}

export default function Avatar({ name, small = false }) {
  return (
    <span className={`avatar${small ? ' sm' : ''}`} style={{ background: colorFor(name) }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

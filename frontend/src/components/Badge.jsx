import { label } from '../constants.js';

export default function Badge({ kind, value }) {
  return <span className={`badge badge-${kind}-${value}`}>{label(value)}</span>;
}

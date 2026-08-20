import { getStatusColor } from '../../utils/helpers';

export function Badge({ status, text }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full 
      text-xs font-medium ${getStatusColor(status || text)}`}>
      {text || status}
    </span>
  );
}
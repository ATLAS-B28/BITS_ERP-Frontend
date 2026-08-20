export function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;

  const styles = {
    info:    'bg-blue-50 border-blue-200 text-blue-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    error:   'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  };

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border
      text-sm ${styles[type]}`}>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100">✕</button>
      )}
    </div>
  );
}
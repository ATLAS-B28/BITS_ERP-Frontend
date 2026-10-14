import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export function ReasonModal({ isOpen, onClose, onConfirm, title, loading }) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setReason('');
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Provide Reason'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={loading}
            disabled={!reason.trim()}
            onClick={() => {
              onConfirm(reason.trim());
              setReason('');
            }}
          >
            Confirm
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">
          Please provide a reason for this action. This will be recorded for audit purposes.
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Enter reason..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={500}
        />
        <p className="text-xs text-gray-400">
          {reason.length}/500 characters
        </p>
      </div>
    </Modal>
  );
}

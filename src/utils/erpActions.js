// Returns available actions for a PO based on role and status
export function getPOActions(status, role) {
  const actions = [];

  if (status === 'DRAFT') {
    if (['ADMIN','PROC_MANAGER','PROC_EMPLOYEE'].includes(role)) {
      actions.push({ label: 'Submit', action: 'submit', variant: 'primary' });
    }
  }

  if (status === 'SUBMITTED') {
    if (['ADMIN','PROC_MANAGER'].includes(role)) {
      actions.push({ label: 'Approve', action: 'approve', variant: 'success' });
      actions.push({ label: 'Reject', action: 'reject', variant: 'danger' });
    }
  }

  if (status === 'APPROVED') {
    if (['ADMIN','PROC_MANAGER','PROC_EMPLOYEE'].includes(role)) {
      actions.push({ label: 'Mark Received', action: 'receive', variant: 'primary' });
    }
  }

  return actions;
}

// Returns available actions for a Sales Order
export function getSalesOrderActions(status, role) {
  const actions = [];

  if (status === 'PENDING') {
    if (['ADMIN','SALES_MANAGER'].includes(role)) {
      actions.push({ label: 'Confirm', action: 'confirm', variant: 'success' });
      actions.push({ label: 'Cancel', action: 'cancel', variant: 'danger' });
    }
  }

  if (status === 'CONFIRMED') {
    if (['ADMIN','SALES_MANAGER'].includes(role)) {
      actions.push({ label: 'Dispatch', action: 'dispatch', variant: 'primary' });
    }
  }

  if (status === 'DISPATCHED') {
    if (['ADMIN','SALES_MANAGER','SALES_EMPLOYEE'].includes(role)) {
      actions.push({ label: 'Mark Delivered', action: 'deliver', variant: 'success' });
    }
  }

  return actions;
}
export function formatCurrency(amount) {
    if(amount == null) return '₹0.00'
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount)
}

export function formatDate(dateString) {
    if(!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

export function formatDateTime(dateString) {
    if(!dateString) return '-'
    return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

export function getStatusColor(status) {
    const colors = {
        DRAFT:      'bg-gray-100 text-gray-700',
        PENDING:    'bg-yellow-100 text-yellow-700',
        SUBMITTED:  'bg-blue-100 text-blue-700',
        CONFIRMED:  'bg-blue-100 text-blue-700',
        APPROVED:   'bg-green-100 text-green-700',
        ACTIVE:     'bg-green-100 text-green-700',
        DELIVERED:  'bg-green-100 text-green-700',
        RECEIVED:   'bg-green-100 text-green-700',
        DISPATCHED: 'bg-purple-100 text-purple-700',
        REJECTED:   'bg-red-100 text-red-700',
        CANCELLED:  'bg-red-100 text-red-700',
        EXCEEDED:   'bg-red-100 text-red-700',
        SUSPENDED:  'bg-red-100 text-red-700', 
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
}

export function getErrorMessage(error) {
    return error?.response?.data?.message || error?.message || 'An error occurred'
}
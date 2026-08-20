export function StatCard({
    label, value, sub, icon, color='blue'
}) {
    const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red:    'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    }

    return (
        <div className="bg-white rounded-lg border, border-gray-200 shadow-sm p-5 flex items-start gap-4">
            {icon && (
                <div className={`p-2.5 rounded-lg ${colors[color]}`}>
                    {icon}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                {sub && (
                    <p className="text-sm text-gray-500 mt-1">{sub}</p>
                )}
            </div>
        </div>
    )
}
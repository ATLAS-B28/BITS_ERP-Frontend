export function Table({columns, data, loading = false, emptyText = 'No data available', className = ''}) {
    if(loading) {
        return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span className="ml-2 text-sm text-gray-500">Loading...</span>
      </div>
      )
    }
    if(!data || data.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-sm text-gray-500">{emptyText}</p>
            </div>
        )
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200">
                        {columns.map((col) => (
                            <th key={col.key} 
                            className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4 first:pl-0">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                 <tbody className="divide-y divide-gray-100">
          {data.map((row, i) => (
            <tr key={row.id || i}
              className="hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key}
                  className="py-3 px-4 first:pl-0 text-gray-700">
                  {col.render ? col.render(row) : row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
            </table>
        </div>
    )
}
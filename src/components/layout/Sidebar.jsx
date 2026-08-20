import {NavLink, useNavigate} from 'react-router-dom'
import {useAuth} from '../../hooks/useAuth'

const navItems = [
    {
        section: 'Main',
        items: [
            {
                path: '/dashboard',
                label: 'Dashboard',
                icon: (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg> 
                ),
                roles: ['ADMIN','INV_MANAGER','INV_EMPLOYEE','PROC_MANAGER',
                'PROC_EMPLOYEE','SALES_MANAGER','SALES_EMPLOYEE',
                'FIN_MANAGER','FIN_EMPLOYEE']
            }
        ]
    },
    {
        section: 'Administration',
        items: [
            {
                path: '/admin/users',
                label: 'User Management',
                icon: (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4.351l8.667 10.349H3.333L12 4.351z"/>
          </svg> 
                ),
                roles: ['ADMIN']
            }
        ]
    },
    {
        section: 'Inventory',
        items: [
            {
                path: '/inventory/products',
                label: 'Products',
                icon: (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4-8-4m8 4v10l-3 3m11-13l-3-3m0 0l-3 3"/>
          </svg> 
                ),
                roles: ['ADMIN','INV_MANAGER','INV_EMPLOYEE']
            },
            {
                path: '/inventory/low-stock',
                label: 'Low Stock',
                icon: (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.5 -1.67 1.5 -2.5L13.5 16.5c-.83-.83-2.37-1.5-3.5-1.5s-2.67.67-3.5 1.5L4.5 19c-1 .83-2 2.5-1 3.5s2.5 1 3.5 0l7-7z"/>
          </svg> 
                ),
                roles: ['ADMIN','INV_MANAGER']
            }
        ]
    },
    {
    section: 'Procurement',
    items: [
      {
        path: '/procurement/vendors',
        label: 'Vendors',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        ),
        roles: ['ADMIN','PROC_MANAGER','PROC_EMPLOYEE'],
      },
      {
        path: '/procurement/orders',
        label: 'Purchase Orders',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        ),
        roles: ['ADMIN','PROC_MANAGER','PROC_EMPLOYEE'],
      },
    ],
  },
  {
    section: 'Sales',
    items: [
      {
        path: '/sales/customers',
        label: 'Customers',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        ),
        roles: ['ADMIN','SALES_MANAGER','SALES_EMPLOYEE'],
      },
      {
        path: '/sales/orders',
        label: 'Sales Orders',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
        ),
        roles: ['ADMIN','SALES_MANAGER','SALES_EMPLOYEE'],
      },
    ],
  },
  {
    section: 'Finance',
    items: [
      {
        path: '/finance/summary',
        label: 'P&L Summary',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        ),
        roles: ['ADMIN','FIN_MANAGER','FIN_EMPLOYEE'],
      },
      {
        path: '/finance/ledger',
        label: 'Ledger',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        ),
        roles: ['ADMIN','FIN_MANAGER','FIN_EMPLOYEE'],
      },
      {
        path: '/finance/budgets',
        label: 'Budgets',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        ),
        roles: ['ADMIN','FIN_MANAGER'],
      },
    ],
  },
  {
    section: 'GIS',
    items: [
      {
        path: '/gis/map',
        label: 'Map View',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
        ),
        roles: ['ADMIN','INV_MANAGER','PROC_MANAGER','SALES_MANAGER'],
      },
    ],
  },
]

export function Sidebar({collapsed, onCollapse}) {
    const {role, logout} = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const canAccess = (roles) => roles.includes(role)

    return (
      <aside className={`fixed left-0 top-0 h-screen bg-gray-900 text-white
      flex flex-col transition-all duration-300 z-40
      ${collapsed ? 'w-16' : 'w-64'}`}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center
          justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">B</span>
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-sm tracking-wide">BITS ERP</p>
            <p className="text-xs text-gray-400">
              {role?.replace('_', ' ')}
            </p>
          </div>
        )}  
        <button
          onClick={onCollapse}
          className="ml-auto text-gray-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}/>
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((section) => {
          const accessible = section.items.filter(i => canAccess(i.roles));
          if (accessible.length === 0) return null;
          return (
            <div key={section.section} className="mb-4">
              {!collapsed && (
                <p className="text-xs font-semibold text-gray-500 uppercase
                  tracking-wider px-3 mb-1">
                  {section.section}
                </p>
              )}
              {accessible.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                    transition-colors mb-0.5
                    ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
            );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
            text-gray-400 hover:bg-gray-800 hover:text-white
            transition-colors w-full">
          <svg className="w-5 h-5 flex-shrink-0" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
           </div>
    </aside>
    )
}
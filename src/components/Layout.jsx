import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Warehouse, 
  BarChart3,
  LogOut,
  Bell
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, children, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{children}</span>
  </Link>
);

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col fixed h-full z-20">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
            <Warehouse size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">InvoSync</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink to="/" icon={LayoutDashboard} active={location.pathname === '/'}>
            Dashboard
          </SidebarLink>
          <SidebarLink to="/products" icon={Package} active={location.pathname === '/products'}>
            Products
          </SidebarLink>
          <SidebarLink to="/customers" icon={Users} active={location.pathname === '/customers'}>
            Customers
          </SidebarLink>
          <SidebarLink to="/orders" icon={ShoppingCart} active={location.pathname === '/orders'}>
            Orders
          </SidebarLink>
          <SidebarLink to="/inventory" icon={Warehouse} active={location.pathname === '/inventory'}>
            Inventory
          </SidebarLink>
          <SidebarLink to="/reports" icon={BarChart3} active={location.pathname === '/reports'}>
            Reports
          </SidebarLink>
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 transition-colors w-full">
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            {location.pathname === '/' ? 'Overview' : location.pathname.substring(1).replace('-', ' ')}
          </h1>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300"></div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

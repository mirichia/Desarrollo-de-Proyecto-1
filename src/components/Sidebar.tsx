import React from 'react';
import { LayoutDashboard, Package, Truck, Calendar, HelpCircle, User, ChevronLeft, PanelLeftClose } from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  currentTab,
  onSelectTab,
}) => {
  const navItems = [
    { id: 'inicio' as NavigationTab, label: 'Inicio', icon: LayoutDashboard },
    { id: 'pedidos' as NavigationTab, label: 'Pedidos', icon: Package },
    { id: 'flota' as NavigationTab, label: 'Flota y almacenes', icon: Truck },
    { id: 'simulacion' as NavigationTab, label: 'Simulación 5D', icon: Calendar },
  ];

  return (
    <>
      {/* Mobile / Tablet backdrop overlay when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container with collapsible sliding animation */}
      <aside
        className={`bg-[#082937] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-[#0d3b4f] z-40 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen
            ? 'w-64 translate-x-0 opacity-100'
            : 'w-0 -translate-x-full opacity-0 border-r-0 pointer-events-none'
        }`}
      >
        {/* Top section with Logo, User Card & Nav */}
        <div className="w-64 shrink-0">
          {/* Brand Logo & Collapse toggle button */}
          <div className="px-5 py-5 flex items-center justify-between border-b border-[#0d3b4f]/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
                {/* High-fidelity stylized rhombuses logo matching PAQRAP icon */}
                <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7">
                  <rect x="6" y="6" width="10" height="10" transform="rotate(45 11 11)" fill="#10B981" fillOpacity="0.8" />
                  <rect x="18" y="6" width="10" height="10" transform="rotate(45 23 11)" fill="#34D399" />
                  <rect x="6" y="18" width="10" height="10" transform="rotate(45 11 23)" fill="#059669" />
                  <rect x="18" y="18" width="10" height="10" transform="rotate(45 23 23)" fill="#10B981" />
                </svg>
              </div>
              <span className="font-extrabold text-xl tracking-wider text-white font-sans">
                PAQRAP
              </span>
            </div>

            {/* Collapse button */}
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#0d384c]/70 transition-colors"
              title="Ocultar menú lateral"
              aria-label="Ocultar menú lateral"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* User Card */}
          <div className="mx-4 my-4 p-3 bg-[#0d384c]/60 rounded-xl flex items-center gap-3 border border-[#144960]/50">
            <div className="w-10 h-10 rounded-full bg-slate-200/90 flex items-center justify-center text-slate-700 shrink-0 shadow-inner">
              <User className="w-6 h-6 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-semibold text-white leading-tight truncate">
                Supervisor logístico
              </h4>
              <p className="text-[11px] text-slate-300 leading-tight truncate">
                Rol: Supervisor
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] text-emerald-400 font-medium">En línea</span>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="mt-4 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 text-[14px] font-medium rounded-lg relative transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-[#10435a] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#0d384c]/50'
                  }`}
                >
                  {/* Active Indicator green bar on left */}
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#22c55e] rounded-r-md" />
                  )}
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom section with Help */}
        <div className="p-4 border-t border-[#0d3b4f]/60 w-64 shrink-0">
          <button
            onClick={() => onSelectTab('ayuda')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium rounded-lg transition-colors text-left ${
              currentTab === 'ayuda'
                ? 'bg-[#10435a] text-white'
                : 'text-slate-300 hover:text-white hover:bg-[#0d384c]/50'
            }`}
          >
            <HelpCircle className="w-5 h-5 text-slate-300" />
            <span>Ayuda</span>
          </button>
        </div>
      </aside>
    </>
  );
};

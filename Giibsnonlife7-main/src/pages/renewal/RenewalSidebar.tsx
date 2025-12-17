// src/components/sidebar/RenewalSidebar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const RenewalSidebar: React.FC = () => {
  const location = useLocation();

  // Renewal menu items
  const menuItems = [
    { 
      path: "/renewal", 
      label: "Renewal List", 
      icon: "📋",
      description: "View and manage all renewals"
    },
    { 
      path: "/renewal/renewal-model", 
      label: "Renewal Model", 
      icon: "⚙️",
      description: "CSU renewal processing tools"
    },
  ];

  // helper to check active for renewal routes
  const isActive = (itemPath: string) => {
    if (itemPath === "/renewal") {
      return location.pathname === "/renewal" || 
             location.pathname.startsWith("/renewal/");
    }
    if (itemPath === "/renewal/renewal-model") {
      return location.pathname === "/renewal/renewal-model";
    }
    return false;
  };

  return (
    <aside
      className="
        fixed left-0 top-0 bottom-0 z-40
        bg-gradient-to-b from-slate-800 to-blue-900 text-white
        flex flex-col
        overflow-y-auto
        md:w-64 sm:w-20 w-16
        mt-14 md:mt-14 sm:mt-14
        transition-all duration-300
      "
      aria-label="Renewal sidebar"
    >
      {/* Sidebar Header - Hide on small screens */}
      <div className="p-5 border-b border-gray-700/50 md:block sm:hidden hidden">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <span className="text-lg">🔄</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">Renewal System</h1>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="p-4 border-b border-gray-700/50 md:hidden sm:block block">
        <div className="flex justify-center">
          <div className="p-2 bg-blue-600 rounded-lg">
            <span className="text-lg">🔄</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {/* Main Renewal Links */}
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center 
              py-3 px-5 
              text-white/80 no-underline 
              transition-all duration-200 
              border-l-4 border-transparent 
              hover:bg-white/10 hover:text-white
              md:justify-start sm:justify-center justify-center
              md:px-5 sm:px-2 px-1
              ${isActive(item.path)
                ? "bg-white/15 text-white border-l-orange-500"
                : ""
              }
            `}
            title={item.label} // Tooltip for mobile
          >
            <span className="md:text-xl sm:text-lg text-base">{item.icon}</span>
            <div className="flex-1 md:block sm:hidden hidden">
              <div className="text-sm font-medium ml-3">{item.label}</div>
              <div className="text-xs text-gray-300 mt-0.5 ml-3">{item.description}</div>
            </div>
          </Link>
        ))}
      </nav>

      {/* Sidebar Footer - Hide on small screens */}
      <div className="p-4 border-t border-gray-700/50 md:block sm:hidden hidden">
        <div className="text-xs text-gray-400 text-center">
          GIBS Enterprise v7
          <div className="text-[10px] text-gray-500 mt-1">
            Renewal Management
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="p-2 border-t border-gray-700/50 md:hidden sm:block block">
        <div className="text-[8px] text-gray-400 text-center rotate-90 whitespace-nowrap mt-4">
          Renewal
        </div>
      </div>
    </aside>
  );
};

export default RenewalSidebar;
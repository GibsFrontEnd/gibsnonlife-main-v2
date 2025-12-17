// src/components/sidebar/QuoteSidebar.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllRisks } from "../../features/reducers/adminReducers/riskSlice";
import type { AppDispatch, RootState } from "@/features/store";

const QuoteSidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { risks } = useSelector((s: RootState) => s.risks);
  const [quotesOpen, setQuotesOpen] = useState(true);

  // load risks
  useEffect(() => {
    dispatch(getAllRisks({ pageNumber: 1, pageSize: 100 }) as any);
  }, [dispatch]);

  // Build quotation items (All + each risk)
  const quotationItems = [
    { path: "quotes", label: "All", icon: "📋", id: "all" },
    ...(risks || []).map((risk) => ({
      path: `quotes/${risk.riskID}`,
      label: risk.riskName,
      icon: "🔸",
      id: risk.riskID,
    })),
  ];

  // helper to detect active link (handles nested routes)
  const isActive = (itemPath: string) =>
    location.pathname === itemPath ||
    location.pathname.startsWith(itemPath + "/");

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
      aria-label="Quotation sidebar"
    >
      {/* Sidebar Header - Hide on small screens */}
      <div className="p-5 border-b border-gray-700/50 md:block sm:hidden hidden">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <span className="text-lg">💼</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">Quotation System</h1>
            <p className="text-xs text-gray-300 mt-1">Policy Quotation Management</p>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="p-4 border-b border-gray-700/50 md:hidden sm:block block">
        <div className="flex justify-center">
          <div className="p-2 bg-blue-600 rounded-lg">
            <span className="text-lg">💼</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {/* Quotations section (collapsible) */}
        <div>
          <button
            onClick={() => setQuotesOpen((v) => !v)}
            className={`
              w-full flex items-center justify-between 
              py-3 px-5 
              text-white/80 no-underline 
              transition-all duration-200 
              border-l-4 border-transparent 
              hover:bg-white/10 hover:text-white
              md:justify-start sm:justify-center justify-center
              md:px-5 sm:px-2 px-1
              ${
                location.pathname.startsWith("/quotes")
                  ? "bg-white/15 text-white border-l-orange-500"
                  : ""
              }
            `}
            aria-expanded={quotesOpen}
            aria-controls="quotes-submenu"
            title="Quotations" // Tooltip for mobile
          >
            <div className="flex items-center md:flex-initial sm:flex-none">
              <span className="md:text-xl sm:text-lg text-base">🔒</span>
              <span className="text-sm font-medium ml-3 md:block sm:hidden hidden">
                Quotations
              </span>
            </div>
            <span className="text-sm md:block sm:hidden hidden">
              {quotesOpen ? "▼" : "▶"}
            </span>
          </button>

          <div
            id="quotes-submenu"
            className={`
              transition-all
              ${quotesOpen ? "block" : "hidden"}
              ${quotesOpen ? "md:pl-6 sm:pl-0 pl-0" : ""}
            `}
          >
            {!risks && (
              <div className="py-2 px-2 text-xs text-gray-400 italic text-center md:text-left">
                Loading…
              </div>
            )}

            {risks &&
              quotationItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`
                    flex items-center 
                    py-2 px-3 
                    text-white/70 no-underline 
                    transition-all duration-150 
                    rounded-md hover:bg-white/10 hover:text-white
                    md:justify-start sm:justify-center justify-center
                    md:px-3 sm:px-2 px-1
                    ${
                      isActive(item.path)
                        ? "bg-white/15 text-white font-medium"
                        : ""
                    }
                  `}
                  title={item.label} // Tooltip for mobile
                >
                  <span className="md:text-sm sm:text-xs text-xs mr-3">{item.icon}</span>
                  <span className="text-sm md:block sm:hidden hidden">{item.label}</span>
                </Link>
              ))}

            {risks && quotationItems.length === 1 && (
              <div className="py-2 px-3 text-xs text-gray-400 italic text-center md:text-left">
                No risks found.
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer - Hide on small screens */}
      <div className="p-4 border-t border-gray-700/50 md:block sm:hidden hidden">
        <div className="text-xs text-gray-400 text-center">
          GIBS Enterprise v7
          <div className="text-[10px] text-gray-500 mt-1">
            Quotation Management
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="p-2 border-t border-gray-700/50 md:hidden sm:block block">
        <div className="text-[8px] text-gray-400 text-center rotate-90 whitespace-nowrap mt-4">
          Quote
        </div>
      </div>
    </aside>
  );
};

export default QuoteSidebar;
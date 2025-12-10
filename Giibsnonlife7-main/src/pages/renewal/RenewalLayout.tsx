// src/layouts/RenewalLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import RenewalSidebar from "./RenewalSidebar";

const RenewalLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Hidden on small screens, shown on xl and larger */}
      <RenewalSidebar />
      
      {/* Main content area - Responsive margin */}
      <div className="
        flex-1 
        w-full
        min-h-screen 
        overflow-y-auto
        transition-all duration-300
        /* No margin on mobile */
        sm:ml-0
        /* Small margin on medium screens if needed */
        md:ml-0
        /* Full sidebar margin on xl screens */
        xl:ml-64
      ">
        {/* Main content container with responsive padding */}
        <div className="
          h-full
          /* Responsive padding for mobile */
          p-4
          /* Larger padding on medium screens */
          md:p-6
          /* Even larger padding on large screens */
          lg:p-8
          /* Max width for very large screens */
          xl:max-w-7xl
        ">
          <Outlet />
        </div>
      </div>
      
      {/* Optional: Add a backdrop overlay for mobile when sidebar might be toggled */}
      {/* Uncomment if you add sidebar toggle functionality */}
      {/* <div className="fixed inset-0 bg-black/50 z-30 xl:hidden" /> */}
    </div>
  );
};

export default RenewalLayout;
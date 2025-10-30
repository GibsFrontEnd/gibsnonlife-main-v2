import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col relative h-screen overflow-y-hidden">
      <div className="fixed top-0 h-[60px] w-full z-[100]">
        <Header />
      </div>
      <main className="w-full mt-[60px] flex-1 h-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "../UI/new-button"

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { title: "Home", link: "/dashboard" },
    { title: "CSU", link: "/csu" },
    { title: "Quotation", link: "/quotations" },
  { title: "Underwriting", link: "/underwriting" },
    { title: "Claims", link: "/claims" },
    { title: "Reinsurance", link: "/re-insurance" },
    { title: "Requisition", link: "/requisition" },
    { title: "Accounting", link: "/accounting" },
    { title: "Analytics", link: "/analytics" },
    { title: "Admin", link: "/admin" },
  ];


  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.replace("/login");  
    window.location.replace("/login");  
    };
    
  
  return (
    <header  className="bg-white border-b border-gray-200 px-5 flex items-center justify-between h-16 shadow ml-auto" style={{ backgroundColor: "rgb(255, 206, 187)" }}>
      <div className="font-bold text-lg"></div>

      <nav className="hidden xl:flex items-center gap-0">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.link}
            className={({ isActive }) =>
              `px-4 py-2 bg-transparent border-none text-gray-500 text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out border-b-2 border-transparent hover:text-gray-700 hover:bg-gray-50 ${
                isActive ? "text-secondary border-b-secondary" : ""
              }`
            }
          >
            {item.title}
          </NavLink>
        ))}
        <Button onClick={()=>{handleLogout();}} variant="destructive">Logout</Button>
      </nav>
      <button
        className="block xl:hidden w-fit p-2 text-black hover:text-gray-800"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b h-[64px]">
          <h2 className="font-bold">Menu</h2>
          <button onClick={() => setMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="flex flex-col p-4">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.link}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition ${
                  isActive ? "text-secondary font-semibold" : ""
                }`
              }
            >
              {item.title}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;

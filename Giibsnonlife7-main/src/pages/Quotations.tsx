import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import QuoteSidebar from "../components/quotations/quotations.sidebar";

const Quotations = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/quotations") {
      navigate("quotes");
    }
  }, [navigate]);

  return (
    <div className="w-full flex h-full">
      <QuoteSidebar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:ml-52 max-md:ml-15">
        <Outlet />
      </div>
    </div>
  );
};

export default Quotations;

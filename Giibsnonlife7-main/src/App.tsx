import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import "./styles/global.css";
import { useAuth } from "./hooks/use-auth";
import { useSelector } from "react-redux";
import type { RootState } from "./features/store";
import { Toaster } from "./components/UI/toaster";
import HomePage from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/admin/admin-page.Dashboard";
import AdminSecurity from "./pages/admin/admin-page.Security";
import AdminProducts from "./pages/admin/admin-page.Products";
import AdminFeatures from "./pages/admin/admin-page.Features";
import AdminSettings from "./pages/admin/admin-page.Settings";
import Dashboard from "./pages/Dashboard";
import CSU from "./pages/CSU";
import CSUEnquiries from "./pages/csu/csu-page.enquiries";
import CSUCustomers from "./pages/csu/csu-page.customers";
import CSUMessaging from "./pages/csu/csu-page.messaging";
import CSUTickets from "./pages/csu/csu-page.tickets";
import CSUParty from "./pages/csu/csu-page.party";
import AdminCompany from "./pages/admin/admin-page.Company";
import Quotations from "./pages/Quotations";
import QuoteQuotations from "./pages/quotation/quotation-page.quotations";
import EditProposal from "./components/quotations/quotes/EditProposal";
import ClauseManager from "./components/quotations/quotes/ClauseManager";
import CreateProposal from "./components/quotations/quotes/CreateProposal";
import QuoteCreator from "./components/quotations/quotes/QuoteCreator";
import MotorQuoteCreator from "./components/quotations/quotes/MotorQuoteCreator";


const App: React.FC = () => {
  useAuth();
  const isExpired = useSelector((state: RootState) => state.auth.isExpired);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/csu" element={<CSU />}>
            <Route path="enquiries" element={<CSUEnquiries />} />
            <Route path="customers" element={<CSUCustomers />} />
            <Route path="partners" element={<CSUParty />} />
            <Route path="messaging" element={<CSUMessaging />} />
            <Route path="tickets" element={<CSUTickets />} />
          </Route>
          <Route path="/quotations" element={<Quotations />}>
            <Route path="quotes" element={<QuoteQuotations />} />
            <Route path="quotes/:businessId" element={<QuoteQuotations />} />
            <Route path="clauses/:proposalNo" element={<ClauseManager />} />
            <Route path="create" element={<CreateProposal />} />
            <Route path="create/:businessId" element={<CreateProposal />} />
            <Route path="edit/:proposalNo" element={<EditProposal />} />
            <Route path="quote/:proposalNo" element={<QuoteCreator />} />
            <Route path="quote/motor/:proposalNo" element={<MotorQuoteCreator />} />
            <Route path="customers" element={<CSUCustomers />} />
            <Route path="partners" element={<CSUParty />} />
            <Route path="messaging" element={<CSUMessaging />} />
            <Route path="tickets" element={<CSUTickets />} />
          </Route>


          <Route path="/admin" element={<Admin />}>
            <Route index element={<AdminDashboard />} />
            <Route path="security" element={<AdminSecurity />} />
            <Route path="company" element={<AdminCompany />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="features" element={<AdminFeatures />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to={!isExpired ? "/dashboard" : "/"} />}
        />
      </Routes>
    </>
  );
};

export default App;

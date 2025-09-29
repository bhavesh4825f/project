import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/login";         
import Register from "./pages/Register";   // Client registration
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/profile";
import ManageUsers from "./pages/manage_users";
import AdminApplications from "./pages/AdminApplications"; // Merged admin applications page
import DocumentHistory from "./pages/document_history";
import SendDocument from "./pages/send_document";
import ContactQueries from "./pages/contact_queies";
import PanCard from "./pages/apply pan";
import IncomeApplication from "./pages/apply_income";
import ApplyCaste from "./pages/apply_caste";
import ApplyBirth from "./pages/apply_birth";
import MyApplications from "./pages/my_applications";
import AdminPaymentHistory from "./pages/admin_payment_history";
import PaymentHistory from "./pages/payment_history";
import Payment from "./pages/Payment";
import "./styles/mobile.css"; // Mobile responsive styles
import ApplicationDetails from "./pages/ApplicationDetails";
import PriceManagement from "./pages/price_management";
import ServiceManagement from "./pages/ServiceManagement";
import DynamicServiceApplication from "./pages/DynamicServiceApplication";
import DebugAPI from "./pages/DebugAPI";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* CLIENT ROUTES */}
        <Route path="/login" element={<Login />} />          {/* Client login */}
        <Route path="/register" element={<Register />} />    {/* Client registration */}
        {/* ADMIN ROUTE */}
        {/* Common/Protected Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/manage_users" element={<ManageUsers />} />
        <Route path="/admin-applications" element={<AdminApplications />} />
        <Route path="/document_history" element={<DocumentHistory />} />
        <Route path="/send_document" element={<SendDocument />} />
        <Route path="/send_document/:id" element={<SendDocument />} />
        <Route path="/contact_queries" element={<ContactQueries />} />
        
        {/* Legacy routes for backwards compatibility */}
        <Route path="/admin_document" element={<AdminApplications />} />
        <Route path="/manage-applications" element={<AdminApplications />} />
        
        {/* Application Routes */}
        <Route path="/apply-pan" element={<PanCard />} />
        <Route path="/apply-income" element={<IncomeApplication />} />
        <Route path="/apply-caste" element={<ApplyCaste />} />
        <Route path="/apply-birth" element={<ApplyBirth />} />
        <Route path="/apply/:serviceId" element={<DynamicServiceApplication />} />

        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/admin-payment-history" element={<AdminPaymentHistory />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/payment/:id" element={<Payment />} />
        <Route path="/price-management" element={<PriceManagement />} />
        <Route path="/service-management" element={<ServiceManagement />} />
        <Route path="/application-details/:id" element={<ApplicationDetails />} />
        <Route path="/debug-api" element={<DebugAPI />} />
      </Routes>
    </Router>
  );
}
import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import AdminDashboard from "../components/AdminDashboard";

const AdminDashboardPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title="Admin Dashboard" />
        <AdminDashboard />
      </MasterLayout>
    </>
  );
};

export default AdminDashboardPage;

import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import AccountantDashboardLayer from "../components/AccountantDashboardLayer";

const AccountantDashboardPage = () => {
  return (
    <>
     {/* MasterLayout */}
     <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title="Accountant Dashboard" />
      <AccountantDashboardLayer />
      </MasterLayout>
    </>
  );
};

export default AccountantDashboardPage;

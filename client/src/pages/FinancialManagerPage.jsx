import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import FinancialMangerLayer from "../components/FinancialMangerLayer";


const FinancialManagerPage = () => {
  return (
    <>
     {/* MasterLayout */}
     <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title="Financial-Manager-Dashboard" />
      <FinancialMangerLayer />
      </MasterLayout>
    </>
  );
};

export default FinancialManagerPage;

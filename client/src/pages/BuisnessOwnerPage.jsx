import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import BuisnessOwnerLayer from "../components/BuisnessOwnerDashboard";


const BuisnessOwenerPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>

        {/* Breadcrumb */}
        <Breadcrumb title="Buisness Owner" />

        {/* DashBoardLayerTwo */}
        <BuisnessOwnerLayer/>

      </MasterLayout>
    </>
  );
};

export default BuisnessOwenerPage;

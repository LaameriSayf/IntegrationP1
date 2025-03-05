import React from "react";
import { useParams } from "react-router-dom";
import ResetPasswordLayer from "../components/ResetPasswordLayer";

const ResetPasswordPage = () => {
  const { token } = useParams(); // Get token from URL

  return (
    <>

      {/* ResetPasswordPageLayer */}
      <ResetPasswordLayer  token={token} />

    </>
  );
};

export default ResetPasswordPage; 

import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import '../App.css'
//import '/assets/css/auth.css'
const ResetPasswordLayer = () => {
    const [resetpassword, setResetPassword] = useState("");
    const [passwordconfirm, setPasswordConfirm] = useState("");
    const [error ,  setError] = useState(""); 
    const [success , setSuccess] = useState(""); 
    const navigate = useNavigate();
    const { userId, token } = useParams();

    // Handle input changes
    const handleChange = (e) => {
      if (e.target.name === "resetpassword1") setResetPassword(e.target.value);
      if (e.target.name === "passwordconfirm") setPasswordConfirm(e.target.value);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (resetpassword !== passwordconfirm) {
        setError("Passwords do not match!");
        return;
      }

      if (resetpassword.length < 8) {
        setError("Password must be at least 8 characters!");
        return;
      }

      try {
        const response = await axios.post(`http://localhost:5001/api/password/reset-password/${userId}/${token}`, {
          password: resetpassword,
        });
        console.log("Response received:", response.data);

        if (response.data.Status === "Success") {
          setSuccess("Password reset successfully! Redirecting...");
          setTimeout(() => navigate("/sign-in"), 1000);
        } else {
          setError(response.data.message || "Something went wrong at redirecting!");
        }
      } catch (error) {
        setError("Failed to reset password. Please try again.", error);
        setError("Failed to reset password. Please try again.");
      }
    };

  return (
<section className='auth bg-base d-flex flex-wrap'>
  <div className='auth-left d-lg-block d-none'>
    <div className='d-flex align-items-center flex-column h-100 justify-content-center'>
      <img src="assets/images/auth/f2.jpg" alt='Forgot Password' className='auth-image' />
    </div>
  </div>
  <div className='auth-right py-32 px-24 d-flex flex-column justify-content-center'>
    <div className='max-w-464-px mx-auto w-100'>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className='icon-field mb-16'>
          <span className='icon top-50 translate-middle-y'>
            <Icon icon='solar:lock-password-outline' />
          </span>
          <input
            type='password'
            className='form-control h-56-px bg-neutral-50 radius-12'
            id='reset-password'
            placeholder='Password'
            name='resetpassword1'
            value={resetpassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className='mb-20'>
          <div className='position-relative '>
            <div className='icon-field'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='solar:lock-password-outline' />
              </span>
              <input
                type='password'
                className='form-control h-56-px bg-neutral-50 radius-12'
                id='password-confirm'
                placeholder='Password confirm'
                name='passwordconfirm'
                value={passwordconfirm}
                onChange={handleChange}
                required
              />
            </div>
            <span
              className='toggle-password ri-eye-line cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light'
              data-toggle='#your-password'
            />
          </div>
          <span className='mt-12 text-sm text-secondary-light'>
            Your password must have at least 8 characters
          </span>
        </div>
        <button
          type='submit'
          className='btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32'
        >
          Reset Password
        </button>
      </form>
    </div>
  </div>
</section>
  );
};

export default ResetPasswordLayer;

import { Icon } from "@iconify/react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignUpLayer = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phoneNumber: '', role: '', image: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prevState => ({ ...prevState, image: e.target.files[0] }));
  };


  const handleResendEmail = async () => {
    if (!formData.email) {
      toast.error("Please enter your email first!");
      return;
    }
    try {
      await axios.post('http://localhost:5001/api/users/resend-verification-email', { email: formData.email });
      toast.success('Verification email resent successfully!');
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast.error(error.response?.data?.message || 'Failed to resend verification email.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    try {
      const response = await axios.post('http://localhost:5001/api/users/sign-up', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log(response.data);
      toast.success("Sign-up successful! Please verify your email.");
    } catch (error) {
      console.error('Sign-up error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Sign-up failed.');
    }
  };

  return (
    <section className='auth bg-base d-flex flex-wrap'>
      <div className='auth-left d-lg-block d-none'>
        <div className='d-flex align-items-center flex-column h-100 justify-content-center'>
          <img src='/assets/images/signup.jpg' alt='Sign up illustration' />
        </div>
      </div>
      <div className='auth-right py-32 px-24 d-flex flex-column justify-content-center'>
        <div className='max-w-464-px mx-auto w-100'>
          <Link to='/' className='mb-40 max-w-290-px'>
            <img src='/assets/images/2.png' alt='LOGO FINOVA' />
          </Link>
          <h4 className='mb-12'>Sign Up to your Account</h4>
          <p className='mb-32 text-secondary-light text-lg'>Welcome! Please enter your details</p>

          <form onSubmit={handleSubmit}>
            <div className='icon-field mb-16'>
              <Icon icon='f7:person' className='icon top-50 translate-middle-y' />
              <input type='text' name='name' value={formData.name} onChange={handleChange}
                className='form-control h-56-px bg-neutral-50 radius-12' placeholder='Username' required />
            </div>

            <div className='icon-field mb-16'>
              <Icon icon='mage:email' className='icon top-50 translate-middle-y' />
              <input type='email' name='email' value={formData.email} onChange={handleChange}
                className='form-control h-56-px bg-neutral-50 radius-12' placeholder='Email' required />
            </div>

            <div className='icon-field mb-16'>
              <Icon icon='solar:lock-password-outline' className='icon top-50 translate-middle-y' />
              <input type='password' name='password' value={formData.password} onChange={handleChange}
                className='form-control h-56-px bg-neutral-50 radius-12' placeholder='Password' required />
            </div>

            <div className='icon-field mb-16'>
              <Icon icon='mdi:phone' className='icon top-50 translate-middle-y' />
              <input type='text' name='phoneNumber' value={formData.phoneNumber} onChange={handleChange}
                className='form-control h-56-px bg-neutral-50 radius-12' placeholder='Phone Number' required />
            </div>

            <div className='icon-field mb-16'>
              <Icon icon='mdi:account' className='icon top-50 translate-middle-y' />
              <select name='role' value={formData.role} onChange={handleChange}
                className='form-control h-56-px bg-neutral-50 radius-12' required>
                <option value=''>Select Role</option>
                <option value='Business owner'>Business owner</option>
                <option value='Financial manager'>Financial manager</option>
                <option value='Accountant'>Accountant</option>
                <option value='Admin'>Admin</option>
              </select>
            </div>

            <div className='icon-field mb-16'>
              <Icon icon='mdi:image' className='icon top-50 translate-middle-y' />
              <input type='file' name='image' onChange={handleFileChange}
                className='form-control h-56-px bg-neutral-50 radius-12' />
            </div>

            <button type='submit' className='btn btn-primary w-100 mt-32 radius-12'>Sign Up</button>
            <div className='d-flex justify-content-end mt-1'>
            <button type='button' onClick={handleResendEmail} className='btn btn-secondary btn-sm radius-8 px-3 py-1'>
          Resend Verification Email
            </button>
              </div>
           
          
            <div className='mt-32 text-center text-sm'>
              <p>Already have an account? <Link to='/sign-in' className='text-primary-600'>Sign In</Link></p>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer />
    </section>
  );
};

export default SignUpLayer;

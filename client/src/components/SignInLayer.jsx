import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import axios from 'axios';

const SignInLayer = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [verificationMessage, setVerificationMessage] = useState('');
  const navigate = useNavigate();
  const { email, password } = formData;
  const location = useLocation(); 

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === 'true') {
      setVerificationMessage("You have successfully verified your email!");
    }
  }, [location.search]);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/users/sign-in', formData);
      const { token, role } = res.data;
      console.log(res.data);

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      switch (role) {
        case 'Admin':
          navigate("/admin-dashboard");
          break;
        case 'Business owner':
          navigate("/business-owner-dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      console.error('Error during sign-in:', error.response ? error.response.data : error.message);
      toast.error(error.response ? error.response.data.message : 'Sign-in failed. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <section className='auth bg-base d-flex flex-wrap'>
      <div className='auth-left d-lg-block d-none'>
        <div className='d-flex align-items-center flex-column h-100 justify-content-center'>
          <img src='assets/images/auth/auth-img.png' alt='' />
        </div>
      </div>
      <div className='auth-right py-32 px-24 d-flex flex-column justify-content-center'>
        <div className='max-w-464-px mx-auto w-100'>
          <div>
            <Link to='/' className='mb-40 max-w-290-px'>
              <img src='assets/images/logo.png' alt='' />
            </Link>
            <h4 className='mb-12'>Sign In to your Account</h4>
            <p className='mb-32 text-secondary-light text-lg'>
              Welcome back! Please enter your details
            </p>
          </div>
          {verificationMessage && (
            <div className="alert alert-success mb-4">
              {verificationMessage}
            </div>
          )}
          <form onSubmit={onSubmit}>
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='mage:email' />
              </span>
              <input
                type='email'
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Email'
                name='email'
                value={email}
                onChange={onChange}
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
                    id='your-password'
                    placeholder='Password'
                    name='password'
                    value={password}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
            </div>
            <button
              type='submit'
              className='btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32'
            >
              Sign In
            </button>
            <div className='mt-32 text-center text-sm'>
              <p className='mb-0'>
                Forgot password{" "}
                <Link to='/forgot-password' className='text-primary-600 fw-semibold'>
                  Reset Password
                </Link>
              </p>
            </div>
            <div className='mt-32 text-center text-sm'>
              <p className='mb-0'>
                Don’t have an account?{" "}
                <Link to='/sign-up' className='text-primary-600 fw-semibold'>
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInLayer;

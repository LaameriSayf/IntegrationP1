import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CompleteProfileLayer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "",
    image: null,
  });
  const [userId, setUserId] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("userId");
    const prov = params.get("provider");
    setUserId(id);
    setProvider(prov);
    console.log("UserId récupéré:", id);
    console.log("Provider récupéré:", prov);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phoneNumber: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const validateForm = () => {
    const { phoneNumber, password, confirmPassword, role } = formData;

    if (!userId) {
      toast.error("Missing user ID!");
      return false;
    }

    if (!phoneNumber || !password || !confirmPassword || !role) {
      toast.error("Please fill in all required fields.");
      return false;
    }

    const digitsOnly = phoneNumber.replace(/\D/g, "");
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      toast.error("Please enter a valid phone number.");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }

    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordPattern.test(password)) {
      toast.error(
        "Password must be at least 8 characters long, with at least one letter and one number."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const data = new FormData();
    data.append("userId", userId.toString());
    data.append("phoneNumber", formData.phoneNumber);
    data.append("password", formData.password); // Mise à jour du mot de passe
    data.append("role", formData.role);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const response = await axios.post(
        "http://localhost:5001/auth/complete-profile",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(response.data.message);
      setTimeout(() => navigate("/sign-in"), 3000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error completing profile."
      );
    }
  };

  return (
    <section className="auth bg-base d-flex flex-wrap">
      <div className="auth-left d-lg-block d-none">
        <div className="d-flex align-items-center flex-column h-100 justify-content-center">
          <img src="/assets/images/signup.jpg" alt="Complete profile illustration" />
        </div>
      </div>
      <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center">
        <div className="max-w-464-px mx-auto w-100">
          <div>
            <h4 className="mb-12">Complete Your Profile</h4>
            <p className="mb-32 text-secondary-light text-lg">
              Please provide the required details to finalize your registration.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="solar:lock-password-outline" />
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Password"
                required
              />
            </div>
            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="solar:lock-password-outline" />
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Confirm Password"
                required
              />
            </div>
            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mdi:phone" />
              </span>
              <PhoneInput
                country={"us"}
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                inputClass="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Phone Number"
                required
              />
            </div>
            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mdi:account" />
              </span>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-control h-56-px bg-neutral-50 radius-12"
                required
              >
                <option value="">Select a Role</option>
                <option value="Business owner">Business Owner</option>
                <option value="Financial manager">Financial Manager</option>
                <option value="Accountant">Accountant</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mdi:image" />
              </span>
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                className="form-control h-56-px bg-neutral-50 radius-12"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
            >
              Save Profile
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default CompleteProfileLayer;
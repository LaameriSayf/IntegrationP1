import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; 
import Swal from "sweetalert2"; // Import SweetAlert2

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("userId");
    setUserId(id);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("Missing user ID!");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordPattern.test(formData.password)) {
      alert("Password must be at least 8 characters long, with at least one letter and one number.");
      return;
    }

    // Show confirmation popup
    const result = await Swal.fire({
      title: "Confirm Save",
      text: "Are you sure you want to save the changes?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, save it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      const data = new FormData();
      data.append("userId", userId.toString());
      data.append("phoneNumber", formData.phoneNumber);
      data.append("password", formData.password);
      data.append("confirmPassword", formData.confirmPassword);
      data.append("role", formData.role);
      if (formData.image) {
        data.append("image", formData.image);
      }

      try {
        const response = await axios.post("http://localhost:5001/auth/complete-profile", data, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });

        Swal.fire("Success", response.data.message, "success");
        navigate("/sign-in");
      } catch (error) {
        Swal.fire("Error", error.response?.data?.message || "Error during registration", "error");
      }
    }
  };

  return (
    <div className="container">
      <h2 className="text-center mb-4">Complete Your Registration</h2>
      <form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow">
        <div className="mb-3">
          <div className="position-relative">
            <div className="icon-field">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="solar:lock-password-outline" />
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control h-56-px bg-neutral-50 radius-12"
                id="your-password"
                placeholder="Password"
                required
              />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="position-relative">
            <div className="icon-field">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="solar:lock-password-outline" />
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control h-56-px bg-neutral-50 radius-12"
                id="confirm-password"
                placeholder="Confirm Password"
                required
              />
            </div>
          </div>
        </div>

        {/* Phone number field with country code */}
        <div className="icon-field mb-3">
          <span className="icon top-50 translate-middle-y">
            <Icon icon="mdi:phone" />
          </span>
          <PhoneInput
            country={"us"} // Set default country (USA)
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            inputClass="form-control h-56-px bg-neutral-50 radius-12"
            placeholder="Phone Number"
          />
        </div>

        <div className="icon-field mb-3">
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

        <div className="icon-field mb-3">
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

        <button type="submit" className="btn btn-primary w-100">
          Save
        </button>
      </form>
    </div>
  );
};

export default CompleteProfileLayer;

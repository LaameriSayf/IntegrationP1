import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from 'sweetalert2'; // Import de SweetAlert2
import { FaEnvelope } from "react-icons/fa";

const InputFormWithF = () => {
  const [formData, setFormData] = useState({
    userEmail: "",
    approvalType: "",
    details: ""
  });
  
  const [errors, setErrors] = useState({
    userEmail: "",
    approvalType: "",
    details: ""
  });

  const { userEmail, approvalType, details } = formData;

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userEmail) {
      tempErrors.userEmail = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(userEmail)) {
      tempErrors.userEmail = "Please enter a valid email";
      isValid = false;
    }

    if (!approvalType) {
      tempErrors.approvalType = "Request type is required";
      isValid = false;
    }

    if (!details.trim()) {
      tempErrors.details = "Details are required";
      isValid = false;
    } else if (details.length < 10) {
      tempErrors.details = "Details must be at least 10 characters";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5001/api/approvals/create", formData);
      console.log("API Response:", res.data);

      // Afficher SweetAlert au lieu de toast.success
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Your request has been submitted successfully!',
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true,
      });

      setFormData({
        userEmail: "",
        approvalType: "",
        details: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Submission error:", error.response ? error.response.data : error.message);
      toast.error(
        error.response ? error.response.data.message : "Submission failed. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    }
  };

  return (
    <div className="col-md-6">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0 flex items-center gap-2">
            <FaEnvelope /> Submit a Request
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row gy-3">
              <div className="col-12">
                <label className="form-label">Email</label>
                <div className="icon-field">
                  <span className="icon">
                    <Icon icon="mage:email" />
                  </span>
                  <input
                    type="email"
                    name="userEmail"
                    className={`form-control ${errors.userEmail ? 'is-invalid' : ''}`}
                    placeholder="Your email"
                    value={userEmail}
                    onChange={onChange}
                  />
                  {errors.userEmail && (
                    <div className="invalid-feedback">{errors.userEmail}</div>
                  )}
                </div>
              </div>
              <div className="col-12">
                <label className="form-label">Request Type</label>
                <div className="icon-field">
                  <span className="icon">
                    <Icon icon="f7:list" />
                  </span>
                  <select
                    name="approvalType"
                    value={approvalType}
                    onChange={onChange}
                    className={`form-control ${errors.approvalType ? 'is-invalid' : ''}`}
                  >
                    <option value="">Select a type</option>
                    <option value="Software Access">Software Access</option>
                    <option value="Project Authorization">Project Authorization</option>
                    <option value="Financial Validation">Financial Validation</option>
                  </select>
                  {errors.approvalType && (
                    <div className="invalid-feedback">{errors.approvalType}</div>
                  )}
                </div>
              </div>
              <div className="col-12">
                <label className="form-label">Details</label>
                <div className="icon-field">
                  <span className="icon">
                    <Icon icon="solar:document-linear" />
                  </span>
                  <textarea
                    name="details"
                    className={`form-control ${errors.details ? 'is-invalid' : ''}`}
                    placeholder="Details of your request"
                    value={details}
                    onChange={onChange}
                    rows="3"
                  />
                  {errors.details && (
                    <div className="invalid-feedback">{errors.details}</div>
                  )}
                </div>
              </div>
              <div className="col-12 flex gap-3">
                <button type="submit" className="btn btn-primary-600 w-50">
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ userEmail: "", approvalType: "", details: "" });
                    setErrors({});
                  }}
                  className="btn btn-secondary w-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InputFormWithF;
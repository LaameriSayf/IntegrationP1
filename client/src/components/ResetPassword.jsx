import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
    const { token } = useParams(); // Get reset token from URL
    const navigate = useNavigate(); // Redirect after successful reset

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `http://localhost:5001/api/auth/reset-password/${token}`,
                { password } // ✅ Ensure correct field name
            );

            setMessage(response.data.message);
            setError(""); // Clear previous errors

            // Redirect to sign-in after a delay
            setTimeout(() => navigate("/sign-in"), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Error resetting password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth forgot-password-page bg-base d-flex flex-wrap">
            <div className="auth-left d-lg-block d-none">
                <div className="d-flex align-items-center flex-column h-100 justify-content-center">
                    <img src="/assets/images/auth/forgot-pass-img.png" alt="Forgot Password" />
                </div>
            </div>

            <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center">
                <div className="max-w-464-px mx-auto w-100">
                    <h4 className="mb-12">Reset Password</h4>
                    <p className="mb-32 text-secondary-light text-lg">
                        Reset your password by entering a new one below.
                    </p>

                    {message && <p className="text-success">{message}</p>}
                    {error && <p className="text-danger">{error}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="icon-field">
                            <input
                                type="password"
                                className="form-control h-56-px bg-neutral-50 radius-12"
                                placeholder="Enter New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="icon-field mt-3">
                            <input
                                type="password"
                                className="form-control h-56-px bg-neutral-50 radius-12"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>

                        <div className="text-center mt-24">
                            <Link to="/sign-in" className="text-primary-600 fw-bold">
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ResetPassword;

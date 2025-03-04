import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Icon } from '@iconify/react';

const ViewProfileLayer = () => {
    const [imagePreview, setImagePreview] = useState('https://res.cloudinary.com/dusuncugj/image/upload/v1739799045/user_images/123.png');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const [user, setUser] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        role: '',
        image: ''
    });
    
    const [updatedUser, setUpdatedUser] = useState({
        name: "",
        email: "",
        phoneNumber: "",
    });
        const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [editing, setEditing] = useState(false);

    const fetchUserData = async () => {
        setLoading(true);
        setError(""); 
    
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Not authenticated. Please log in.');
                setLoading(false);
                return;
            }
    
            const response = await axios.get('http://localhost:5001/api/profile/view', {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (response.status === 200) {
                console.log("User Data:", response.data); 
                setUserData(response.data);
                setUpdatedUser(response.data);
            } else {
                setError("Unexpected response from server.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
    
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        setError('Unauthorized. Please log in again.');
                        break;
                    case 403:
                        setError('Forbidden access. Contact support.');
                        break;
                    case 500:
                        setError('Server error. Please try again later.');
                        break;
                    default:
                        setError(error.response.data?.message || 'An error occurred.');
                }
            } else {
                setError('Network error. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchUserData();
    }, []);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        console.log("Updated User:", updatedUser);
    
        if (!userData || !userData._id) {
            console.error('User data is not available');
            return;
        }
    
        try {
            const formData = new FormData();
    
            formData.append('name', updatedUser.name);
            formData.append('email', updatedUser.email);
            formData.append('phoneNumber', updatedUser.phoneNumber);
            formData.append('role', updatedUser.role);
    
            if (updatedUser.image) {
                formData.append('image', updatedUser.image);
            }
    
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
    
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token not available');
                return;
            }
    
            const response = await axios.put('http://localhost:5001/api/profile/edit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
    
            console.log('Update Response:', response.data);
            
            setUserData(response.data.user); 
            setUpdatedUser(response.data.user);
            setEditing(false);
            fetchUserData(); 
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Error updating profile. Please try again.');
        }
    };
    

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    const readURL = (input) => {
        if (input.target.files && input.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
                setUpdatedUser({ ...updatedUser, image: input.target.files[0] });
            };
            reader.readAsDataURL(input.target.files[0]);
        }
    };

    const handleCancelClick = () => {
        setEditing(false);
        setUpdatedUser({ ...user });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUser({ ...updatedUser, [name]: value });
    };
    
    
    const handleChangePassword = async (e) => {
        e.preventDefault();
    
        console.log("Change password button clicked");
    
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            console.error("Password too short");
            return;
        }
    
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            console.error("Passwords do not match");
            return;
        }
    
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found in localStorage");
                setError("Unauthorized. Please log in again.");
                return;
            }
    
            console.log("Token retrieved from localStorage:", token);
    
            const response = await axios.put(
                "http://localhost:5001/api/profile/change-password",
                { newPassword, confirmPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            console.log("Password Change Response:", response.data);
            setError(null);
            setNewPassword("");
            setConfirmPassword("");
            alert("Password changed successfully!");
        } catch (error) {
            console.error("Error changing password:", error.response?.data || error);
            setError(error.response?.data?.message || "Error changing password. Please try again.");
        }
    };
    




    
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="row gy-4">
            <div className="col-lg-4">
                <div className="user-grid-card position-relative border radius-16 overflow-hidden h-100" style={{ backgroundColor: 'white' }}>
                    <img
                        src="assets/images/user-grid/user-grid-bg1.png"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-100 object-fit-cover"
                    />
                    <div className="pb-24 ms-16 mb-24 me-16 mt--100">
                        <div className="text-center border border-top-0 border-start-0 border-end-0">
                            <img
                                src={userData?.image || "assets/images/user-grid/user-grid-img14.png"}
                                alt=""
                                className="border br-white border-width-2-px w-200-px h-200-px rounded-circle object-fit-cover"
                            />
                            <h6 className="mb-0 mt-16">Welcome {userData?.role || "Business Owner"}</h6>
                            <span className="text-secondary-light mb-16">{userData?.role || "Business Owner"}</span>
                        </div>
                        <div className="mt-24">
                            <h6 className="text-xl mb-16">Personal Info</h6>
                            <ul>
                                <li className="d-flex align-items-center gap-1 mb-12">
                                    <span className="w-30 text-md fw-semibold text-primary-light">
                                        Username
                                    </span>
                                    <span className="w-70 text-secondary-light fw-medium">
                                        : {userData?.name || "Loading..."}
                                    </span>
                                </li>
                                <li className="d-flex align-items-center gap-1 mb-12">
                                    <span className="w-30 text-md fw-semibold text-primary-light">
                                        Email
                                    </span>
                                    <span className="w-70 text-secondary-light fw-medium">
                                        : {userData?.email || "Loading..."}
                                    </span>
                                </li>
                                <li className="d-flex align-items-center gap-1 mb-12">
                                    <span className="w-30 text-md fw-semibold text-primary-light">
                                        Phone Number
                                    </span>
                                    <span className="w-70 text-secondary-light fw-medium">
                                        : {userData?.phoneNumber || "Loading..."}
                                    </span>
                                </li>
                                <li className="d-flex align-items-center gap-1 mb-12">
                                    <span className="w-30 text-md fw-semibold text-primary-light">
                                        Role
                                    </span>
                                    <span className="w-70 text-secondary-light fw-medium">
                                        : {userData?.role || "Loading..."}
                                    </span>
                                </li>
                                <li className="d-flex align-items-center gap-1 mb-12">
                                     <span className="w-30 text-md fw-semibold text-primary-light">
                                       Status
                                      </span>
                                    <span className="w-70 text-secondary-light fw-medium">
                                        : {userData?.isActive !== undefined ? (
                                        <span className={`ml-2 ${userData?.isActive ? 'text-success' : 'text-danger'}`}>
                                          {userData?.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                                  ) : "Loading..."}
                                         </span>
                                </li>

                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            
            <div className="col-lg-8">
                <div className="card h-100">
                    <div className="card-body p-24">
                        <ul
                            className="nav border-gradient-tab nav-pills mb-20 d-inline-flex"
                            id="pills-tab"
                            role="tablist"
                        >
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link d-flex align-items-center px-24 active"
                                    id="pills-edit-profile-tab"
                                    data-bs-toggle="pill"
                                    data-bs-target="#pills-edit-profile"
                                    type="button"
                                    role="tab"
                                    aria-controls="pills-edit-profile"
                                    aria-selected="true"
                                >
                                    Edit Profile
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link d-flex align-items-center px-24"
                                    id="pills-change-passwork-tab"
                                    data-bs-toggle="pill"
                                    data-bs-target="#pills-change-passwork"
                                    type="button"
                                    role="tab"
                                    aria-controls="pills-change-passwork"
                                    aria-selected="false"
                                    tabIndex={-1}
                                >
                                    Change Password
                                </button>
                            </li>
                        </ul>
                        <div className="tab-content" id="pills-tabContent">
                            <div
                                className="tab-pane fade show active"
                                id="pills-edit-profile"
                                role="tabpanel"
                                aria-labelledby="pills-edit-profile-tab"
                                tabIndex={0}
                            >
                                <h6 className="text-md text-primary-light mb-16">Profile Image</h6>
                                <div className="mb-24 mt-16">
                                    <div className="avatar-upload">
                                        <div className="avatar-edit position-absolute bottom-0 end-0 me-24 mt-16 z-1 cursor-pointer">
                                            <input
                                                type="file"
                                                id="imageUpload"
                                                accept=".png, .jpg, .jpeg"
                                                hidden
                                                onChange={readURL}
                                            />
                                            <label
                                                htmlFor="imageUpload"
                                                className="w-32-px h-32-px d-flex justify-content-center align-items-center bg-primary-50 text-primary-600 border border-primary-600 bg-hover-primary-100 text-lg rounded-circle"
                                            >
                                                <Icon icon="solar:camera-outline" className="icon"></Icon>
                                            </label>
                                        </div>
                                        <div className="avatar-preview">
                                            <div
                                                id="imagePreview"
                                                style={{
                                                    backgroundImage: `url(${imagePreview})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit}>
    <div className="row">


        <div className="col-sm-6">
            <div className="mb-20">
                <label htmlFor="name" className="form-label fw-semibold text-primary-light text-sm mb-8">
                    Full Name <span className="text-danger-600">*</span>
                </label>
                <input
                    type="text"
                    className="form-control radius-8"
                    id="name"
                    name="name"
                    value={updatedUser?.name || ""}
                    onChange={handleInputChange}
                    placeholder="Enter Full Name"
                    required
                />
            </div>
        </div>

        <div className="col-sm-6">
            <div className="mb-20">
                <label htmlFor="email" className="form-label fw-semibold text-primary-light text-sm mb-8">
                    Email <span className="text-danger-600">*</span>
                </label>
                <input
                    type="email"
                    className="form-control radius-8"
                    id="email"
                    name="email"
                    value={updatedUser?.email || ""}
                    onChange={handleInputChange}
                    placeholder="Enter Your Email"
                    required
                />
            </div>
        </div>

        <div className="col-sm-6">
            <div className="mb-20">
                <label htmlFor="phoneNumber" className="form-label fw-semibold text-primary-light text-sm mb-8">
                    Phone Number
                </label>
                <input
                    type="text"
                    className="form-control radius-8"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={updatedUser?.phoneNumber || ""}
                    onChange={handleInputChange}
                    placeholder="Enter Phone Number"
                />
            </div>
        </div>

        <div className="col-sm-6">
            <div className="mb-20">
                <label htmlFor="role" className="form-label fw-semibold text-primary-light text-sm mb-8">
                    Role <span className="text-danger-600">*</span>
                </label>
                <select
                    className="form-control radius-8 form-select"
                    id="role"
                    name="role"
                    value={updatedUser?.role || ""}
                    onChange={handleInputChange}
                    required
                >
                    <option value="" disabled>Select Role Title</option>
                    <option value="Business owner">Business owner</option>
                    <option value="Financial manager">Financial manager</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>
        </div>
    </div>

    <div className="d-flex justify-content-end mt-3">
        <button type="submit" className="btn btn-primary px-3 py-1 text-sm">
            Save Changes
        </button>
    </div>
</form>

                            </div>
                            <div className="tab-pane fade" id="pills-change-passwork" role="tabpanel" aria-labelledby="pills-change-passwork-tab" tabIndex="0">
    <form onSubmit={handleChangePassword}>
        <div className="mb-20">
            <label htmlFor="your-password" className="form-label fw-semibold text-primary-light text-sm mb-8">
                New Password <span className="text-danger-600">*</span>
            </label>
            <div className="position-relative">
                <input
                    type={passwordVisible ? "text" : "password"}
                    className="form-control radius-8"
                    id="your-password"
                    placeholder="Enter New Password*"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <span
                    className={`toggle-password ${passwordVisible ? "ri-eye-off-line" : "ri-eye-line"} cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light`}
                    onClick={togglePasswordVisibility}
                ></span>
            </div>
        </div>

        <div className="mb-20">
            <label htmlFor="confirm-password" className="form-label fw-semibold text-primary-light text-sm mb-8">
                Confirm Password <span className="text-danger-600">*</span>
            </label>
            <div className="position-relative">
                <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    className="form-control radius-8"
                    id="confirm-password"
                    placeholder="Confirm Password*"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span
                    className={`toggle-password ${confirmPasswordVisible ? "ri-eye-off-line" : "ri-eye-line"} cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light`}
                    onClick={toggleConfirmPasswordVisibility}
                ></span>
            </div>
        </div>

        {error && <p className="text-danger">{error}</p>}

        <div className="d-flex align-items-center justify-content-center gap-3">
            <button
                type="button"
                className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-sm px-3 py-1 radius-8"
                onClick={handleCancelClick}
            >
                Cancel
            </button>
            <button
                type="submit"
                className="btn btn-primary border border-primary-600 text-sm px-3 py-1 radius-8"
            >
                Change Password
            </button>
        </div>
    </form>
</div>

                            <div
                                className="tab-pane fade"
                                id="pills-notification"
                                role="tabpanel"
                                aria-labelledby="pills-notification-tab"
                                tabIndex={0}
                            >
                                <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                  
                                    <div className="d-flex align-items-center gap-3 justify-content-between">
                                   
                                    </div>
                                </div>
                                <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                
                                    <div className="d-flex align-items-center gap-3 justify-content-between">
                                       
                                      
                                    </div>
                                </div>
                                <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                   
                                    <div className="d-flex align-items-center gap-3 justify-content-between">
                                 
                                    </div>
                                </div>
                                <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                 
                                    <div className="d-flex align-items-center gap-3 justify-content-between">
                                     
                                   
                                    </div>
                                </div>
                                <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                  
                                    <div className="d-flex align-items-center gap-3 justify-content-between">
                                  
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ViewProfileLayer;
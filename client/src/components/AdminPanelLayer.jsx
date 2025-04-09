import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminPanelLayer = () => {
    const [users, setUsers] = useState([]);
    const [hoveredUserId, setHoveredUserId] = useState(null);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:5001/api/users");
            console.log("Utilisateurs récupérés:", response.data);
            setUsers(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = (userId) => {
        const userToDelete = users.find(user => user._id === userId);
        console.log("Utilisateur à supprimer:", userToDelete);
        console.log("ID envoyé pour suppression:", userId);

        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete!",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                if (!token) {
                    Swal.fire("Error", "You must be logged in as an admin", "error");
                    return;
                }

                axios
                    .delete(`http://localhost:5001/api/users/delete/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then(() => {
                        setUsers(users.filter((user) => user._id !== userId));
                        Swal.fire("Deleted!", "The user has been removed.", "success");
                        fetchUsers(); // Rafraîchir les données après suppression
                    })
                    .catch((error) => {
                        console.error("Erreur détaillée:", error.response);
                        const errorMessage = error.response?.data?.message || "Error during deletion";
                        Swal.fire("Error", errorMessage, "error");
                    });
            }
        });
    };

    const containerStyle = {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4f8, #e0e7ff)",
        padding: "60px 30px",
        fontFamily: "'Montserrat', sans-serif",
        position: "relative",
        overflow: "hidden",
    };

    const titleStyle = {
        fontSize: "3rem",
        color: "#3b82f6",
        textAlign: "center",
        marginBottom: "40px",
        fontWeight: "bold",
        textShadow: "0 2px 10px rgba(59, 130, 246, 0.5)",
        animation: "float 1.5s infinite",
    };

    const gridStyle = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "25px",
        maxWidth: "1300px",
        margin: "0 auto",
    };

    const cardStyle = (isHovered) => ({
        background: "#ffffff",
        borderRadius: "15px",
        padding: "25px",
        boxShadow: isHovered
            ? "0 10px 25px rgba(59, 130, 246, 0.4)"
            : "0 5px 15px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease",
        transform: isHovered ? "translateY(-5px)" : "none",
        border: "1px solid #dbeafe",
        animation: "fadeUp 0.5s ease-out",
    });

    const cardTitleStyle = {
        fontSize: "1.6rem",
        color: "#1e40af",
        marginBottom: "15px",
        fontWeight: "600",
    };

    const cardTextStyle = {
        fontSize: "1rem",
        color: "#4b5563",
        marginBottom: "20px",
        lineHeight: "1.5",
    };

    const statusStyle = (isVerified) => ({
        color: isVerified ? "#10b981" : "#ef4444",
        fontWeight: "bold",
        background: isVerified ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
        padding: "4px 10px",
        borderRadius: "12px",
    });

    const buttonStyle = (isVerified) => ({
        background: isVerified ? "#d1d5db" : "linear-gradient(45deg, #ef4444, #f87171)",
        border: "none",
        padding: "10px 20px",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "1rem",
        fontWeight: "600",
        cursor: isVerified ? "not-allowed" : "pointer",
        transition: "all 0.3s ease",
        boxShadow: isVerified ? "none" : "0 5px 15px rgba(239, 68, 68, 0.4)",
    });

    const buttonHoverStyle = {
        transform: "scale(1.05)",
        boxShadow: "0 8px 20px rgba(239, 68, 68, 0.6)",
    };

    const noUsersStyle = {
        fontSize: "1.5rem",
        color: "#6b7280",
        textAlign: "center",
        padding: "30px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
        margin: "20px auto",
        maxWidth: "400px",
    };

    return (
        <div style={containerStyle}>
            <style>
                {`
                    @keyframes fadeUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                `}
            </style>
            <h2 style={titleStyle}>User Management</h2>
            <div style={gridStyle}>
                {users.length > 0 ? (
                    users.map((user) => (
                        <div
                            key={user._id}
                            style={cardStyle(hoveredUserId === user._id)}
                            onMouseEnter={() => setHoveredUserId(user._id)}
                            onMouseLeave={() => setHoveredUserId(null)}
                        >
                            <h5 style={cardTitleStyle}>{user.name}</h5>
                            <p style={cardTextStyle}>
                                <strong>Email:</strong> {user.email} <br />
                                <strong>Role:</strong> {user.role} <br />
                                <strong>Status:</strong>{" "}
                                <span style={statusStyle(user.isVerified)}>
                                    {user.isVerified ? "Verified" : "Not Verified"}
                                </span>
                            </p>
                            <button
                                style={buttonStyle(user.isVerified)}
                                onClick={() => handleDeleteUser(user._id)}
                                disabled={user.isVerified}
                                onMouseEnter={(e) => !user.isVerified && Object.assign(e.target.style, buttonHoverStyle)}
                                onMouseLeave={(e) => !user.isVerified && Object.assign(e.target.style, buttonStyle(user.isVerified))}
                            >
                                Delete
                            </button>
                        </div>
                    ))
                ) : (
                    <div style={noUsersStyle}>
                        <p>No users found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanelLayer;
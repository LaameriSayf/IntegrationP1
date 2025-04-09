import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import Swal from "sweetalert2";

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const role = params.get("role");

        console.log("AuthCallback - Token reçu:", token);
        console.log("AuthCallback - Rôle reçu:", role);

        if (token && role) {
            // Stocker le token et le rôle dans localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            // Afficher une popup de félicitations avec SweetAlert2
            Swal.fire({
                icon: "success",
                title: "Login Successful!",
                text: "Welcome back!",
                timer: 2000, // Popup visible pendant 2 secondes
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => {
                // Rediriger vers le tableau de bord après la fermeture de la popup
                switch (role) {
                    case 'Admin':
                        navigate("/admin-dashboard");
                        break;
                    case 'Business owner':
                        navigate("/business-owner-dashboard");
                        break;
                    case 'Accountant':
                        navigate("/accountant-dashboard");
                        break;
                    case 'Financial manager':
                        navigate("/Financial-manager-dashboard");
                        break;
                    default:
                        navigate("/");
                }
            });

            // Supprimer le toast précédent car SweetAlert2 le remplace
        } else {
            console.error("Token ou rôle manquant dans AuthCallback");
            toast.error("Erreur lors de la connexion sociale. Veuillez réessayer.", {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            navigate("/sign-in");
        }
    }, [navigate, location]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            <h4>Connexion en cours...</h4>
        </div>
    );
};

export default AuthCallback;
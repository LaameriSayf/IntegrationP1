import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = new URLSearchParams(location.search).get("email");
    const verificationToken = new URLSearchParams(location.search).get("token");
    const [countdown, setCountdown] = useState(20); // Changement de 10 à 20 secondes

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate("/sign-in");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const handleVerifyClick = () => {
        window.location.href = `http://localhost:5001/api/users/verify/${verificationToken}`;
    };

    const containerStyle = {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Poppins', sans-serif",
    };

    const cardStyle = {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: "20px",
        padding: "40px",
        maxWidth: "500px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 0 20px rgba(0, 212, 255, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        animation: "fadeIn 1s ease-out",
    };

    const titleStyle = {
        fontSize: "2.5rem",
        color: "#00d4ff",
        marginBottom: "20px",
        textTransform: "uppercase",
        letterSpacing: "2px",
        textShadow: "0 0 10px #00d4ff",
        animation: "pulse 2s infinite",
    };

    const messageStyle = {
        fontSize: "1.2rem",
        color: "#e0e0e0",
        marginBottom: "30px",
    };

    const emailHighlightStyle = {
        color: "#ff007a",
        fontWeight: "bold",
        textShadow: "0 0 5px #ff007a",
    };

    const instructionStyle = {
        fontSize: "1rem",
        color: "#e0e0e0",
        marginBottom: "15px",
    };

    const buttonStyle = {
        background: "linear-gradient(45deg, #00d4ff, #ff007a)",
        border: "none",
        padding: "12px 30px",
        borderRadius: "50px",
        color: "white",
        fontSize: "1.1rem",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "transform 0.3s, box-shadow 0.3s",
        boxShadow: "0 0 15px #00d4ff",
        textDecoration: "none",
        display: "inline-block",
    };

    const buttonHoverStyle = {
        transform: "scale(1.05)",
        boxShadow: "0 0 25px #00d4ff",
    };

    const countdownStyle = {
        fontSize: "1.1rem",
        color: "#e0e0e0",
        marginTop: "20px",
    };

    const countdownNumberStyle = {
        fontSize: "1.5rem",
        color: "#00d4ff",
        fontWeight: "bold",
    };

    const progressBarStyle = {
        width: "100%",
        height: "10px",
        background: "#333",
        borderRadius: "5px",
        marginTop: "10px",
        overflow: "hidden",
    };

    const progressFillStyle = {
        height: "100%",
        background: "linear-gradient(90deg, #00d4ff, #ff007a)",
        width: `${(countdown / 20) * 100}%`, // Ajusté pour 20 secondes
        transition: "width 1s linear",
    };

    return (
        <div style={containerStyle}>
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes pulse {
                        0% { text-shadow: 0 0 10px #00d4ff; }
                        50% { text-shadow: 0 0 20px #00d4ff, 0 0 30px #ff007a; }
                        100% { text-shadow: 0 0 10px #00d4ff; }
                    }
                `}
            </style>
            <div style={cardStyle}>
                <h1 style={titleStyle}>Vérification email</h1>
                <p style={messageStyle}>
                    Un email a été envoyé à <span style={emailHighlightStyle}>{email || "votre adresse email"}</span>.
                </p>
                <div>
                    <p style={instructionStyle}>
                        Cliquez ci-dessous pour vérifier votre compte et déverrouiller l'expérience complète :
                    </p>
                    <button
                        style={buttonStyle}
                        onClick={handleVerifyClick}
                        onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
                        onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
                    >
                        Vérifier Maintenant
                    </button>
                </div>
                <div style={countdownStyle}>
                    <p>
                        Redirection automatique dans{" "}
                        <span style={countdownNumberStyle}>{countdown}</span> secondes...
                    </p>
                    <div style={progressBarStyle}>
                        <div style={progressFillStyle}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
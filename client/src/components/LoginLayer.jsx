import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5001/api/users/sign-in", { email, password });
            console.log(response.data);
            alert("Veuillez vérifier votre email pour compléter la connexion.");
            navigate("/verify-email");
        } catch (error) {
            alert(error.response?.data?.message || "Erreur lors de la connexion");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Connexion</h2>
            <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label>Mot de passe</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Se connecter</button>
            </form>
            <div className="mt-3">
                <a href="/auth/google">Connexion avec Google</a> | <a href="/auth/facebook">Connexion avec Facebook</a>
            </div>
        </div>
    );
};

export default Login;


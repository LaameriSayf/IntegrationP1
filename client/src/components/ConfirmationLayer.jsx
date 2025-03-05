import React from "react";
import { useSearchParams } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion"; // Import de Framer Motion

const Confirmation = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {/* Icône animée */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }} // Départ invisible et petit
        animate={{ scale: 1.2, opacity: 1 }} // Grossit légèrement puis revient
        transition={{ type: "spring", stiffness: 200, damping: 10, duration: 0.5 }}
      >
        <FaCheckCircle style={{ color: "green", fontSize: "60px", marginBottom: "10px" }} />
      </motion.div>

      <h2>Congratulations!</h2>
      <p>Your registration was successful.</p>
      <p>A password has been sent to <strong>{email}</strong>. Please check your inbox.</p>
      
      {/* Bouton animé */}
      <motion.a 
        href="/sign-in"
        whileHover={{ scale: 1.1 }} // Effet de zoom au survol
        whileTap={{ scale: 0.9 }} // Effet d'appui
        style={{
          display: "inline-block",
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          color: "white",
          backgroundColor: "#007BFF",
          borderRadius: "5px",
          textDecoration: "none",
          fontWeight: "bold"
        }}
      >
        Back to login
      </motion.a>
    </div>
  );
};

export default Confirmation;

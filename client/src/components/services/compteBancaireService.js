import axios from "axios";

const API_URL = "http://localhost:5001/compteBancaire"; // Remplace par ton URL backend

export const getComptesByUserId = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des comptes bancaires :", error);
    throw error;
  }
};

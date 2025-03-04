// src/services/cryptoService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000';  // Replace with your backend API URL


export const getAllCryptoPrices = async (currency) => {
  try {
    const response = await axios.get(`http://localhost:5000/all-crypto-prices/${currency}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cryptocurrency prices:', error);
    throw error;
  }
};


export const addFavoriteCrypto = async (userId, crypto) => {
  try {
    const response = await axios.post(`${API_URL}/add-favorite-crypto`, { userId, crypto });
    return response.data;
  } catch (error) {
    console.error('Error adding favorite crypto:', error);
    throw error;
  }
};

export const removeFavoriteCrypto = async (userId, crypto) => {
  try {
    const response = await axios.post(`${API_URL}/remove-favorite-crypto`, { userId, crypto });
    return response.data;
  } catch (error) {
    console.error('Error removing favorite crypto:', error);
    throw error;
  }
};

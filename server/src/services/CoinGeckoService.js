// services/CoinGeckoService.js
const axios = require('axios');
const User = require('../models/User'); // Assurez-vous que le chemin est correct

class CoinGeckoService {
    static async getCryptoDetails(crypto, currency) {
      const API_URL = 'https://api.coingecko.com/api/v3';
      try {
        const response = await axios.get(`${API_URL}/coins/${crypto}?localization=false`);
        const data = response.data.market_data;
        
        return {  
          price: data.current_price[currency],
          change24h: data.price_change_percentage_24h,
          market_cap: data.market_cap[currency],
          volume: data.total_volumes[currency]
        };
      } catch (error) {
        console.error("Erreur lors de l'appel à l'API CoinGecko : ", error.message);
        return 
      }
    }
  
    static async getAllPrices(currency) {
      const coins = ['bitcoin', 'ethereum', 'litecoin', 'dogecoin' , 'bnb']; // Liste de cryptos à suivre
      const API_URL = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${coins.join(',')}`;
      try {
        const response = await axios.get(API_URL);
        if (response.data) {
          return response.data.map(coin => ({
            name: coin.name,
            symbol: coin.symbol,
            price: coin.current_price,
            change24h: coin.price_change_percentage_24h,
            market_cap: coin.market_cap,
            volume: coin.total_volume,
            logo: coin.image // Ajout de l'URL du logo

          }));
        } else {
          throw new Error('Impossible de récupérer les données pour les cryptomonnaies');
        }
      } catch (error) {
        console.error("Erreur lors de l'appel à l'API CoinGecko : ", error.message);
        throw new Error("Impossible de récupérer les données");
      }
    }

     // Ajouter une crypto à la liste des cryptos préférées
  static async addFavoriteCrypto(userId, crypto) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("Utilisateur non trouvé.");
      }

      if (!user.favoriteCryptos.includes(crypto)) {
        user.favoriteCryptos.push(crypto);
        await user.save();
        return `Crypto ${crypto} ajoutée aux préférées.`;
      } else {
        return `Crypto ${crypto} est déjà dans les préférées.`;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Supprimer une crypto de la liste des cryptos préférées
  static async removeFavoriteCrypto(userId, crypto) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("Utilisateur non trouvé.");
      }

      const index = user.favoriteCryptos.indexOf(crypto);
      if (index > -1) {
        user.favoriteCryptos.splice(index, 1);
        await user.save();
        return `Crypto ${crypto} retirée des préférées.`;
      } else {
        return `Crypto ${crypto} n'est pas dans les préférées.`;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Obtenir la liste des cryptos préférées d'un utilisateur
  static async getFavoriteCryptos(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("Utilisateur non trouvé.");
      }

      return user.favoriteCryptos;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  }
  

module.exports = CoinGeckoService;

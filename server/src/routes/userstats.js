const express = require('express');
const { User } = require('../models/user');
const { Activity } = require('../models/activity');
const router = express.Router();
const moment = require('moment');

router.get('/total-accounts', async (req, res) => {
    try {
        const { timeFrame } = req.query;
        let daysCount = 30; // Par défaut, 30 jours

        // Déterminer le nombre de jours en fonction du timeFrame
        if (timeFrame === 'Monthly') {
            daysCount = 30; // Derniers 30 jours
        } else if (timeFrame === 'Weekly') {
            daysCount = 7; // Derniers 7 jours
        } else if (timeFrame === 'Today') {
            daysCount = 1; // Aujourd'hui seulement
        }

        const lastDays = [...Array(daysCount).keys()].map(i => moment().subtract(i, 'days').format('YYYY-MM-DD'));

        const totalAccountsPerDay = await Promise.all(
            lastDays.map(async (day) => {
                const count = await User.countDocuments({
                    createdAt: { $lte: new Date(`${day}T23:59:59.999Z`) }
                });
                return { date: day, count };
            })
        );

        console.log("Total accounts per day:", totalAccountsPerDay); // Log pour débogage
        res.json({ totalAccountsPerDay: totalAccountsPerDay.reverse() });
    } catch (error) {
        console.error("Error fetching total accounts:", error);
        res.status(500).json({ message: 'Error fetching total accounts' });
    }
});

router.get('/user-stats', async (req, res) => {
    try {
        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();

        const users = await User.find({}, 'name email lastLogin estActif');
        const userStats = await Promise.all(
            users.map(async (user) => {
                const dailyLoginCount = await Activity.countDocuments({
                    userId: user._id,
                    action: 'Connexion',
                    date: { $gte: todayStart, $lte: todayEnd }
                });
                return {
                    name: user.name,
                    email: user.email,
                    lastLogin: user.lastLogin || null,
                    dailyLoginCount,
                    estActif: user.estActif
                };
            })
        );

        console.log("User stats:", userStats); // Log pour débogage
        res.json({ userStats });
    } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({ message: 'Error fetching user stats' });
    }
});

router.get('/login-stats', async (req, res) => {
    try {
        const last7Days = [...Array(7).keys()].map(i => moment().subtract(i, 'days').format('YYYY-MM-DD'));

        const loginPerDay = await Promise.all(
            last7Days.map(async (day) => {
                const count = await Activity.countDocuments({
                    action: 'Connexion',
                    date: { $gte: new Date(`${day}T00:00:00.000Z`), $lt: new Date(`${day}T23:59:59.999Z`) }
                });
                return { date: day, count };
            })
        );

        console.log("Login stats per day:", loginPerDay); // Log pour débogage
        res.json({ loginPerDay });
    } catch (error) {
        console.error("Error fetching login stats:", error);
        res.status(500).json({ message: 'Error fetching login stats' });
    }
});

router.get('/user-overview', async (req, res) => {
    try {
        // Nombre total d'utilisateurs
        const totalUsers = await User.countDocuments();

        // Récupérer les IDs des utilisateurs qui ont déjà fait une connexion
        const activeUserIds = await Activity.distinct("userId", { action: "Connexion" });
        const activeUsersCount = activeUserIds.length;

        // Calculer les utilisateurs qui n'ont jamais fait de connexion
        const neverUsedUsersCount = totalUsers - activeUsersCount;

        // Afficher le nombre total d'utilisateurs
        console.log("Total Users:", totalUsers);
        
        res.json({
            totalUsers,
            activeUsers: activeUsersCount,
            neverUsedUsers: neverUsedUsersCount
        });
    } catch (error) {
        console.error("Error fetching user overview:", error);
        res.status(500).json({ message: 'Error fetching user overview' });
    }
});

module.exports = router;

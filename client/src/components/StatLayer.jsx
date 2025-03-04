import React, { useEffect, useState, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const StatPage = () => {
    const [totalAccounts, setTotalAccounts] = useState([]);
    const [userStats, setUserStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Total accounts
                const totalRes = await fetch('http://localhost:5001/api/userstats/total-accounts');
                const totalData = await totalRes.json();
                console.log("Total accounts data:", totalData);
                setTotalAccounts(totalData.totalAccountsPerDay || []);

                // User stats
                const userRes = await fetch('http://localhost:5001/api/userstats/user-stats');
                const userData = await userRes.json();
                console.log("User stats data:", userData);
                setUserStats(userData.userStats || []);

            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load statistics. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (chartRef.current && totalAccounts.length > 0 && !loading) {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            chartInstanceRef.current = new Chart(chartRef.current, {
                type: "line",
                data: {
                    labels: totalAccounts.map(entry => entry.date),
                    datasets: [{
                        label: "Total Accounts",
                        data: totalAccounts.map(entry => entry.count),
                        borderColor: "#3b82f6",
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                        fill: true,
                        tension: 0.4,
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: "Date", color: "#3b82f6" } },
                        y: { title: { display: true, text: "Number of Accounts", color: "#3b82f6" } }
                    }
                }
            });
        }
    }, [totalAccounts, loading]);

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

    const sectionStyle = {
        background: "#ffffff",
        borderRadius: "15px",
        padding: "30px",
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
        marginBottom: "40px",
        maxWidth: "1200px",
        margin: "0 auto",
    };

    const chartContainerStyle = {
        marginBottom: "30px",
    };

    const tableStyle = {
        width: "100%",
        borderCollapse: "collapse",
    };

    const thStyle = {
        background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
        color: "#fff",
        padding: "15px",
        textAlign: "left",
        fontSize: "1.1rem",
        fontWeight: "600",
        borderBottom: "2px solid #dbeafe",
    };

    const tdStyle = {
        padding: "15px",
        color: "#4b5563",
        fontSize: "1rem",
        borderBottom: "1px solid #dbeafe",
    };

    const statusStyle = (isActive) => ({
        color: isActive ? "#10b981" : "#ef4444",
        fontWeight: "bold",
        background: isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
        padding: "4px 10px",
        borderRadius: "12px",
    });

    const loadingStyle = {
        textAlign: "center",
        fontSize: "1.5rem",
        color: "#3b82f6",
        padding: "20px",
    };

    const errorStyle = {
        textAlign: "center",
        fontSize: "1.5rem",
        color: "#ef4444",
        padding: "20px",
    };

    return (
        <div style={containerStyle}>
            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                    @keyframes fadeUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
            <h2 style={titleStyle}>User Statistics Dashboard</h2>
            {loading ? (
                <div style={loadingStyle}>Loading statistics...</div>
            ) : error ? (
                <div style={errorStyle}>{error}</div>
            ) : (
                <>
                    <div style={sectionStyle}>
                        <h3 style={{ fontSize: "1.8rem", color: "#1e40af", marginBottom: "20px" }}>
                            Total Accounts Over Time
                        </h3>
                        <div style={chartContainerStyle}>
                            {totalAccounts.length > 0 ? (
                                <canvas ref={chartRef} />
                            ) : (
                                <p style={{ textAlign: "center", color: "#6b7280" }}>No data available for total accounts.</p>
                            )}
                        </div>
                    </div>
                    <div style={sectionStyle}>
                        <h3 style={{ fontSize: "1.8rem", color: "#1e40af", marginBottom: "20px" }}>
                            User Activity
                        </h3>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Name</th>
                                    <th style={thStyle}>Email</th>
                                    <th style={thStyle}>Last Login</th>
                                    <th style={thStyle}>Daily Logins</th>
                                    <th style={thStyle}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userStats.length > 0 ? (
                                    userStats.map((user) => (
                                        <tr key={user.email} style={{ animation: "fadeUp 0.5s ease-out" }}>
                                            <td style={tdStyle}>{user.name}</td>
                                            <td style={tdStyle}>{user.email}</td>
                                            <td style={tdStyle}>
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
                                            </td>
                                            <td style={tdStyle}>{user.dailyLoginCount}</td>
                                            <td style={tdStyle}>
                                                <span style={statusStyle(user.estActif)}>
                                                    {user.estActif ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ ...tdStyle, textAlign: "center" }}>
                                            No user data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default StatPage;
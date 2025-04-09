import React, { useEffect, useState, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { Icon } from '@iconify/react/dist/iconify.js';

const SalesStatisticOne = () => {
    const [totalAccounts, setTotalAccounts] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [dailyIncrease, setDailyIncrease] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeFrame, setTimeFrame] = useState('Yearly');
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`http://localhost:5001/api/userstats/total-accounts?timeFrame=${timeFrame}`);
                const data = await response.json();
                const accounts = data.totalAccountsPerDay || [];

                setTotalAccounts(accounts);

                let totalUsersCount = accounts.reduce((sum, entry) => sum + entry.count, 0);
                setTotalUsers(totalUsersCount);

                if (accounts.length >= 2) { 
                    const todayCount = accounts[accounts.length - 1].count;
                    const yesterdayCount = accounts[accounts.length - 2].count;

                    let percentage = yesterdayCount > 0 
                        ? (((todayCount - yesterdayCount) / yesterdayCount) * 100).toFixed(2) 
                        : 100; 
                    
                    setDailyIncrease(percentage);
                } else {
                    setDailyIncrease(0); 
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load statistics. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeFrame]);

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

    const handleTimeFrameChange = (e) => {
        setTimeFrame(e.target.value);
    };

    return (
        <div className="col-xxl-6 col-xl-12">
            <div className="card h-100">
                <div className="card-body">
                    <div className="d-flex flex-wrap align-items-center justify-content-between">
                        <h6 className="text-lg mb-0">User Statistics</h6>
                        <select className="form-select bg-base form-select-sm w-auto" value={timeFrame} onChange={handleTimeFrameChange}>
                            <option value="Yearly">Yearly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Today">Today</option>
                        </select>
                    </div>

                  
                    <div className="d-flex flex-wrap align-items-center gap-2 mt-8">
                        <h6 className="mb-0">{totalUsers} Users</h6>
                        <span className={`text-sm fw-semibold rounded-pill px-8 py-4 line-height-1 d-flex align-items-center gap-1
                            ${dailyIncrease >= 0 ? "bg-success-focus text-success-main br-success" : "bg-danger-focus text-danger-main br-danger"}`}>
                            {dailyIncrease >= 0 ? `+${dailyIncrease}% ` : `${dailyIncrease}% `}
                            <Icon icon={dailyIncrease >= 0 ? "bxs:up-arrow" : "bxs:down-arrow"} className="text-xs" />
                        </span>
                        <span className="text-xs fw-medium">+ {dailyIncrease}% Per Day</span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: "center", color: "#3b82f6", padding: "20px" }}>Loading statistics...</div>
                    ) : error ? (
                        <div style={{ textAlign: "center", color: "#ef4444", padding: "20px" }}>{error}</div>
                    ) : (
                        <div style={{ marginBottom: "30px" }}>
                            {totalAccounts.length > 0 ? (
                                <canvas ref={chartRef} />
                            ) : (
                                <p style={{ textAlign: "center", color: "#6b7280" }}>No data available for total accounts.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesStatisticOne;

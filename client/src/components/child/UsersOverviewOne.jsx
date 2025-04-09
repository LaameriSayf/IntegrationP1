import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const UsersOverviewOne = () => {
    const [userData, setUserData] = useState({ totalUsers: 0, activeUsers: 0, neverUsedUsers: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/userstats/user-overview`);
                const data = await response.json();

                console.log("Received Data:", data); // Debug: Afficher les données reçues

                setUserData({
                    totalUsers: data.totalUsers || 0,
                    activeUsers: data.activeUsers || 0,
                    neverUsedUsers: data.neverUsedUsers || 0
                });
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchData();
    }, []);

    const donutChartSeries = [userData.totalUsers, userData.activeUsers, userData.neverUsedUsers];
    const donutChartOptions = {
        chart: { type: 'donut' },
        labels: ["Total Users", "Active Users", "Never Used"],
        colors: ["#4f46e5", "#3b82f6", "#f59e0b"],
        legend: { position: 'bottom' },
        dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` },
    };

    return (
        <div className="col-xxl-3 col-xl-6">
            <div className="card h-100 radius-8 border-0 overflow-hidden">
                <div className="card-body p-24">
                    <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                        <h6 className="mb-2 fw-bold text-lg">Users Overview</h6>
                    </div>

                    <ReactApexChart options={donutChartOptions} series={donutChartSeries} type="donut" height={264} />

                    <ul className="d-flex flex-wrap align-items-center justify-content-between mt-3 gap-3">
                        <li>
                            <span className="text-secondary-light text-sm fw-normal">
                                Total Users:
                                <span className="text-primary-light fw-semibold"> {userData.totalUsers}</span>
                            </span>
                        </li>
                        <li>
                            <span className="text-secondary-light text-sm fw-normal">
                                Active Users:
                                <span className="text-primary-light fw-semibold"> {userData.activeUsers}</span>
                            </span>
                        </li>
                        <li>
                            <span className="text-secondary-light text-sm fw-normal">
                                Never Used:
                                <span className="text-primary-light fw-semibold"> {userData.neverUsedUsers}</span>
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UsersOverviewOne;

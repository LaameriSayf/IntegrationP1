import React from 'react'
import SalesStatisticOne from './child/SalesStatisticOne';
import TotalSubscriberOne from './child/TotalSubscriberOne';
import UsersOverviewOne from './child/UsersOverviewOne';
import LatestRegisteredOne from './child/LatestRegisteredOne';
import TopPerformerOne from './child/TopPerformerOne';

import UnitCountOne from './child/UnitCountOne';

const AdminDashboard = () => {

    return (
        <>
            {/* UnitCountOne */}
            <UnitCountOne />

            <section className="row gy-4 mt-1">

                {/* SalesStatisticOne */}
                <SalesStatisticOne />

                {/* TotalSubscriberOne */}
                <TotalSubscriberOne />

                {/* UsersOverviewOne */}
                <UsersOverviewOne />

                {/* LatestRegisteredOne */}
                <LatestRegisteredOne />

                {/* TopPerformerOne */}
                <TopPerformerOne />

               
            </section>
        </>


    )
}

export default AdminDashboard
import React from 'react'
import SalesStatisticOne from './child/SalesStatisticOne';
import TotalSubscriberOne from './child/TotalSubscriberOne';
import UsersOverviewOne from './child/UsersOverviewOne';
import LatestRegisteredOne from './child/LatestRegisteredOne';
import TopPerformerOne from './child/TopPerformerOne';
import UnitCountOne from './child/UnitCountOne';
import StatStatisticOne from './child/StatStatisticOne';


const AdminDashboard = () => {

    return (
        <>
            {/* UnitCountOne */}
            <UnitCountOne />

            <section className="row gy-4 mt-1">

                {/* SalesStatisticOne */}
                <SalesStatisticOne />

                {/* UsersOverviewOne */}
                <UsersOverviewOne />
                

                <StatStatisticOne />

               
                {/* TotalSubscriberOne */}
                 <TotalSubscriberOne />
                {/* LatestRegisteredOne */}
                <LatestRegisteredOne />

                {/* TopPerformerOne */}
                <TopPerformerOne />

               
            </section>
        </>


    )
}

export default AdminDashboard

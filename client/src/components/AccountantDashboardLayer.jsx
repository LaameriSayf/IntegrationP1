import React from 'react'
import CampaignStaticAcc from './child/CampaignStaticAcc'
import LastTransactionAcc from './child/LastTransactionAcc'
import UnitCountAcc from './child/UnitCountAcc'
const AccountantDashboardLayer = () => {
  return (
    <section className="row gy-4">

      {/* UnitCountAcc */}
      <UnitCountAcc />

      {/* CampaignStaticAcc */}
      <CampaignStaticAcc />

      {/* LastTransactionAcc */}
      <LastTransactionAcc />
    </section>

  )
}

export default AccountantDashboardLayer


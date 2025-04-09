import React from 'react';
import useReactApexChart from '../../hook/useReactApexChart';
import ReactApexChart from 'react-apexcharts';
import DebitCreditChartWidget from '../widgets/DebitCreditChartWidget'; 

const CampaignStaticAcc = () => {
    let { donutChartSeriesTwo, donutChartOptionsTwo } = useReactApexChart();

    return (
        <div className="col-xxl-4">
            <div className="row gy-4">
                

                {/* Intégration du widget Debit/Credit */}
                <div className="col-xxl-12 col-sm-6">
                    <DebitCreditChartWidget />
                </div>
            </div>
        </div>
    );
};

export default CampaignStaticAcc;
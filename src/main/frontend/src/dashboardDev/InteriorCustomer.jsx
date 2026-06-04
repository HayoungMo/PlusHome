import React, { useEffect, useState } from 'react';
import userService from '../service/userService';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { Bar, Doughnut } from 'react-chartjs-2';
import DevDashboard from '../css/DevDashboard.css'
import PeopleIcon from '@mui/icons-material/People';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Loading from '../components/Loading';




const InteriorCustomer = ({refreshKey }) => {

    const [loading,setLoading] = useState(false)

    const [customerStats,setCustomerStats] = useState({})
    const getInteriorCustomerStats = async()=>{

        try {

            setLoading(true)
            const result = await userService.getInteriorCustomerStats({})
       
        console.log("고객 스탯",result)

        if(result.success){
            setCustomerStats(result.list)
        }
        } catch (error) {
            console.log(error)
        }finally{
            setLoading(false)
        }

        
    }

    useEffect(()=>{
        getInteriorCustomerStats()
    },[refreshKey])

    const noneGenderCount = (customerStats.totalCustomerCount || 0)
                            -(customerStats.maleCount || 0)
                            -(customerStats.femaleCount || 0)
       
    

    const cards = [
    {
        title: "전체 상담 고객",
        value: customerStats.totalCustomerCount || 0,
        icon: <PeopleIcon />,
        colorClass: "total",
    },
    {
        title: "계약 고객",
        value: customerStats.contractCustomerCount || 0,
        icon: <AssignmentTurnedInIcon />,
        colorClass: "contract",
    },
    {
        title: "남성 고객",
        value: customerStats.maleCount || 0,
        icon: <MaleIcon />,
        colorClass: "male",
    },
    {
        title: "여성 고객",
        value: customerStats.femaleCount || 0,
        icon: <FemaleIcon />,
        colorClass: "female",
    },
    {
        title: "성별 미선택 고객",
        value: noneGenderCount || 0,
        icon: <HelpOutlineIcon />,
        colorClass: "none",
    },
];

    const topCards = cards.slice(0, 2);
    const bottomCards = cards.slice(2);

    const genderChartData={
        labels:["남성","여성","알 수 없음"],

        datasets:[
            {
                data:[
                    customerStats.maleCount || 0,
                    customerStats.femaleCount || 0,
                    noneGenderCount,
                ],
                backgroundColor:[
                    "#2cddce",
                    "#fa5f05",
                    "#8f8c8e",
                ],

                borderWidth:0,
            }
        ]
    }

    const ageChartData ={
        
        labels:[
            "10대",
            "20대",
            "30대",
            "40대",
            "50대",
            "60대 이상",
        ],
        datasets:[
            {
                label:"상담 고객 수",
                data:[
                    customerStats.age10 || 0,
                    customerStats.age20 || 0,
                    customerStats.age30 || 0,
                    customerStats.age40 || 0,
                    customerStats.age50 || 0,
                    customerStats.ageOver60 || 0,
                ],
                 backgroundColor:[
                    "#f59e0b",
                    "#f59e0b",
                    "#f59e0b",
                    "#f59e0b",
                    "#f59e0b",
                    "#f59e0b",
        ],
            }
        ]
    }

    const ageChartOptions = {
        indexAxis:"y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            }
        }
    }

    const genderChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "58%",
    plugins: {
        legend: {
            position: "top",
            labels: {
                boxWidth: 36,
                boxHeight: 10,
                padding: 14,
                font: {
                    size: 12,
                },
            },
        },
    },
};

if (loading) {
    return <Loading variant="kpi" count={5} />;
}

   return (
    <div className="interior-customer-page">
        <div className="customer-summary-section">
            <div className="customer-summary-row top">
                {cards.slice(0, 2).map((card) => (
                    <Card className="summary-card" key={card.title}>
                        <CardContent className="summary-card-content">
                            <div className={`summary-icon ${card.colorClass}`}>
                                {card.icon}
                            </div>

                            <div className="summary-text">
                                <Typography component="div" className="summary-title">
                                    {card.title}
                                </Typography>

                                <Typography component="div" className="summary-value">
                                    {card.value}
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="customer-summary-row bottom">
                {cards.slice(2).map((card) => (
                    <Card className="summary-card" key={card.title}>
                        <CardContent className="summary-card-content">
                            <div className={`summary-icon ${card.colorClass}`}>
                                {card.icon}
                            </div>

                            <div className="summary-text">
                                <Typography className="summary-title">
                                    {card.title}
                                </Typography>

                                <Typography className="summary-value">
                                    {card.value}
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

        <div className="customer-chart-grid">
            <Card className="dashboard-chart-card">
                <CardContent className="dashboard-chart-content">
                    <Typography component="h3"          className="dashboard-chart-title">
                        성별 비율
                    </Typography>

                    <div className="dashboard-chart-box">
                        <Doughnut data={genderChartData} options={genderChartOptions} />
                    </div>
                </CardContent>
            </Card>

            <Card className="dashboard-chart-card">
                <CardContent className="dashboard-chart-content">
                    <Typography className="dashboard-chart-title">
                        연령대 분포
                    </Typography>

                    <div className="dashboard-chart-box">
                        <Bar data={ageChartData} options={ageChartOptions} />
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);
};

export default InteriorCustomer;
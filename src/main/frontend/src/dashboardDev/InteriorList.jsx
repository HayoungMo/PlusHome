import React, { useEffect, useState } from 'react';
import userService from '../service/userService';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';

const InteriorList = () => {

    const [summary,setSummary] = useState({})

    const getSummary = async() =>{
        const result = await userService.getSummary()

        setSummary(result)
    }

    useEffect(()=>{
        getSummary()
    },[])

    const chartData = {
        labels:["진행중","완료","취소"],
        datasets:[
            {
                data:[
                    summary.progressCount || 0,
                    summary.doneCount || 0,
                    summary.cancelCount || 0,
                ],
                backgroundColor:[
                    "#2563eb",
                    "#10b981",
                    "#ef4444",
                ],
                borderWidth:0,
            }
        ]
    }

    const chartOptions ={
        responsive: true,
        maintainAspectRatio: false,
        plugins:{
            legend:{
                position: "bottom",
            },
        },
    }

    const cards = [
        {
            title:"전체 상담",
            value:summary.bookingCount || 0,
        },
        {
            title:"오늘 상담 신청",
            value:summary.todayBookingCount || 0,
        },
        {
            title:"진행중 상담",
            value:summary.progressCount  || 0,
        },
        {
            title:"완료 상담",
            value:summary.doneCount  || 0,
        },
        {
            title:"취소 상담",
            value:summary.cancelCount  || 0,
        },
    ]



    return (
        <div>
            <h2>상담 통계</h2>

             <Grid container spacing={3}>
                {cards.map((card) => (
                    <Grid item xs={12} sm={6} md={3} key={card.title}>
                        <Card
                            sx={{
                                textAlign: "center",
                                boxShadow: 3,
                                borderRadius: 3,
                            }}
                        >

                            
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                >
                                    {card.title}
                                </Typography>

                                <Typography
                                    variant="h4"
                                    fontWeight="bold"
                                >
                                    {card.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Card
                sx={{
                    mt: 4,
                    p: 3,
                    borderRadius: 3,
                    boxShadow: 3,
                }}
            >
                <Typography
                    variant="h6"
                    gutterBottom
                >
                    상담 상태 비율
                </Typography>

                <div
                    style={{
                        height: "400px",
                    }}
                >
                    <Doughnut
                        data={chartData}
                        options={chartOptions}
                    />
                </div>
            </Card>
        </div>
    );
};
export default InteriorList;
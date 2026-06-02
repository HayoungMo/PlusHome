import React, { useEffect, useState } from 'react';
import userService from '../service/userService';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { Bar, Doughnut } from 'react-chartjs-2';




const InteriorCustomer = () => {

    const [customerStats,setCustomerStats] = useState({})
    const getInteriorCustomerStats = async()=>{
        const result = await userService.getInteriorCustomerStats({})
       
        console.log("고객 스탯",result)

        if(result.success){
            setCustomerStats(result.list)
        }
    }

    useEffect(()=>{
        getInteriorCustomerStats()
    },[])

    const noneGenderCount = (customerStats.totalCustomerCount || 0)
                            -(customerStats.maleCount || 0)
                            -(customerStats.femaleCount || 0)
                            

    const cards =[
        {
            title:"전체 상담 고객",
            value:customerStats.totalCustomerCount || 0,
        },
        {
            title:"계약 고객",
            value:customerStats.contractCustomerCount  || 0,
        },
        {
            title:"남성 고객",
            value:customerStats.maleCount  || 0,
        },
        {
            title:"여성 고객",
            value:customerStats.femaleCount  || 0,
        },
        {
            title:"성별 미선택 고객",
            value:noneGenderCount  || 0,
        },
    ]

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
                    "#ff0000",
                    "#33ff00",
                    "#a200ff",
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

   return (
    <div>

        {/* 카드 영역 */}
        <Grid container spacing={3}>
            {cards.map((card) => (
                <Grid item xs={12} sm={6} md={3} key={card.title}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                {card.title}
                            </Typography>

                            <Typography variant="h4">
                                {card.value}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>

        {/* 차트 영역 */}
        <Grid container spacing={3} sx={{ mt: 3 }}>

            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">
                            성별 비율
                        </Typography>

                        <div style={{ height: "300px" }}>
                            <Doughnut data={genderChartData} />
                        </div>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">
                            연령대 분포
                        </Typography>

                        <div style={{ height: "300px" }}>
                            <Bar data={ageChartData}
                                options={ageChartOptions} />
                        </div>
                    </CardContent>
                </Card>
            </Grid>

        </Grid>

    </div>
);
};

export default InteriorCustomer;
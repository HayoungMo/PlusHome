import { Card, CardContent, Grid, Typography, useScrollTrigger } from '@mui/material';
import React, { useEffect, useState } from 'react';
import userService from '../service/userService';
import { Doughnut } from 'react-chartjs-2';

const DashboardDevHome = () => {

    const [summary,setSummary] = useState({
        userCount:"",
        companyCount:"",
        couponCount:"",
        notJoinedUserCount:"",
        notJoinedCompanyCount:"",
    })

    const getSummary = async () =>{
        const res = await userService.getSummary();
        console.log("요약 결과:",res)
        setSummary(res)
    }

    useEffect(()=>{
        getSummary()
    },[])

    const membercards = [

        {
            title: "일반 회원",
            value: summary.userCount || 0,

        },
        {
            title: "기업 회원",
            value: summary.companyCount || 0,

        },
        {
            title: "탈퇴 일반 회원",
            value: summary.notJoinedUserCount  || 0,

        },
        {
            title: "탈퇴 기업 회원",
            value: summary.notJoinedCompanyCount  || 0,

        },
    ]

    const operationCards=[
        {
            title: "쿠폰 발급",
            value: summary.couponCount  || 0,

        },
    ]

    const memberChartData = {
    labels: ["일반회원", "기업회원"],
    datasets: [
        {
            data: [
                summary.userCount || 0,
                summary.companyCount || 0,
            ],
            backgroundColor: [
                "#2563eb",
                "#10b981",
            ],
            borderWidth: 0,
        },
    ],
};

const statusChartData = {
    labels: ["가입회원", "탈퇴회원"],
    datasets: [
        {
            data: [
                (summary.userCount || 0) +
                (summary.companyCount || 0),

                (summary.notJoinedUserCount || 0) +
                (summary.notJoinedCompanyCount || 0),
            ],
            backgroundColor: [
                "#1976d2",
                "#ef4444",
            ],
            borderWidth: 0,
        },
    ],
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "bottom",
        },
    },
};


    return (
    <div>       

        <Typography variant='h5' sx={{mb:2}}>
            회원 현황
        </Typography>

        <Grid container spacing={3}>

            {membercards.map((card) => (

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    key={card.title}
                >

                    <Card
                        sx={{
                            textAlign: "center",
                            borderRadius: 3,
                            boxShadow: 3,
                        }}
                    >

                        <CardContent>

                            <Typography
                                variant="h6"
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

        <Grid container spacing={3} sx={{ mt: 3 }}>

    {/* 차트 영역 */}
<Grid container spacing={3} sx={{ mt: 3 }}>

    <Grid item xs={12} md={6}>
        <Card
            sx={{
                p: 2,
                borderRadius: 3,
                boxShadow: 3,
            }}
        >
            <Typography
                variant="h5"
                gutterBottom
            >
                회원 구성 비율
            </Typography>

            <div style={{ height: "300px" }}>
                <Doughnut
                    data={memberChartData}
                    options={chartOptions}
                />
            </div>

        </Card>
    </Grid>

    <Grid item xs={12} md={6}>
        <Card
            sx={{
                p: 2,
                borderRadius: 3,
                boxShadow: 3,
            }}
        >
            <Typography
                variant="h5"
                gutterBottom
            >
                가입 / 탈퇴 현황
            </Typography>

            <div style={{ height: "300px" }}>
                <Doughnut
                    data={statusChartData}
                    options={chartOptions}
                />
            </div>

        </Card>
    </Grid>

</Grid>

{/* 운영 현황 */}
<Typography
    variant="h5"
    sx={{
        mt: 4,
        mb: 2,
    }}
>
    운영 현황
</Typography>

<Grid container spacing={3}>

    {operationCards.map((card) => (

        <Grid
            item
            xs={12}
            sm={6}
            md={3}
            key={card.title}
        >

            <Card
                sx={{
                    textAlign: "center",
                    borderRadius: 3,
                    boxShadow: 3,
                }}
            >

                <CardContent>

                    <Typography variant="h6">
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


</Grid>



    </div>
);
};

export default DashboardDevHome;
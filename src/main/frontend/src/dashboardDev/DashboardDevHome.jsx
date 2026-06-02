import { Box, Card, CardContent, Grid, Typography, useScrollTrigger } from '@mui/material';
import React, { useEffect, useState } from 'react';
import userService from '../service/userService';
import { Doughnut } from 'react-chartjs-2';
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import BlockIcon from "@mui/icons-material/Block";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";

const KpiCard = ({
    icon,
    label,
    value,
    unit,
    helper,
}) => (
    <Card
    sx={{
        height: 160,
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #eef2f7",
    }}
>
            <CardContent
                sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                    px: 3,
                }}
            >
            <Box
                sx={{
                    width: 86,
                    height: 86,
                    borderRadius: "50%",
                    backgroundColor: "#edf4ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>

            <Box
                sx={{
                    flex: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >

                <Typography
                sx={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#111827",
                    textAlign: "center",
                    
                }}
            >
                {label}
            </Typography>

            <Typography
                sx={{
                    fontSize: "2.4rem",
                    fontWeight: 800,
                    lineHeight: 1,
                    color: "#111827",
                    textAlign: "center",
                    mt: 0.5,
                }}
            >
                {value}
            </Typography>

        </Box>
        </CardContent>
    </Card>
);





const DashboardDevHome = () => {

    const [summary,setSummary] = useState({
        userCount:"",
        companyCount:"",
        couponCount:"",
        notJoinedUserCount:"",
        notJoinedCompanyCount:"",
    })

    const meberKpiCard = [
    {
        key: "user",
        label: "일반 회원",
        value: summary.userCount || 0,
        icon: <PersonIcon
                sx={{
                    fontSize: 42,
                    color: "#2563eb",
                }}
            />,
        tone: "blue",
    },
    {
        key: "company",
        label: "기업 회원",
        value: summary.companyCount || 0,
        icon: <BusinessIcon 
                sx={{
                    fontSize: 42,
                    color: "#10b981",
                }}
            />,
        tone: "green",
    },
    {
        key: "leaveUser",
        label: "탈퇴 일반",
        value: summary.notJoinedUserCount || 0,
        icon: <PersonOffIcon 
                sx={{
                    fontSize: 42,
                    color: "#ef4444",
                }}
            />,
        tone: "red",
    },
    {
        key: "leaveCompany",
        label: "탈퇴 기업",
        value: summary.notJoinedCompanyCount || 0,
        icon: <BlockIcon 
                sx={{
                    fontSize: 42,
                    color: "#ef4444",
                }}
            />,
        tone: "orange",
    },
];

    const getSummary = async () =>{
        const res = await userService.getSummary();
        console.log("요약 결과:",res)
        setSummary(res)
    }

    useEffect(()=>{
        getSummary()
    },[])

    

    const operationCards = [
    {
        title: "쿠폰 발급",
        value: summary.couponCount || 0,
        icon: (
            <ConfirmationNumberIcon
                sx={{
                    fontSize: 40,
                    color: "#f59e0b",
                }}
            />
        ),
    },
];

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

        <Typography
            sx={{
                fontSize: "2rem",
                fontWeight: 800,
                mb: 4,
            }}
        >
            회원 현황
        </Typography>

        <Grid container spacing={3}>

            {meberKpiCard.map((item) => (
    <Grid item xs={12} sm={6} md={3} key={item.key}>
        <KpiCard {...item} />
    </Grid>
))}
</Grid>                

        

    {/* 차트 영역 */}
<Grid container spacing={3} sx={{ mt: 3 }}>

    <Grid item xs={12} md={6}>
        <Card
            sx={{
                height: 420,
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid #eef2f7",
                p: 3,
            }}
        >
           <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                }}
            >

                <Typography
                    sx={{
                        fontSize: "1.8rem",
                        fontWeight: 700,
                        mb: 3,
                    }}
                >
                    회원 구성 비율
                </Typography>
            </Box>

            <div style={{ height: "320px" }}>
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
                height: 420,
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid #eef2f7",
                p: 3,
            }}
        >
            <Typography
                    sx={{
                        fontSize: "1.8rem",
                        fontWeight: 700,
                        mb: 3,
                    }}
                >
                가입 / 탈퇴 현황
            </Typography>

            <div style={{ height: "320px" }}>
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

    <Grid
        container
        alignItems="center"
        spacing={2}
    >

        <Grid item>
            {card.icon}
        </Grid>

        <Grid item>

            <Typography
                variant="h6"
                fontWeight="bold"
            >
                {card.title}
            </Typography>

            <Typography
                variant="h4"
                fontWeight="bold"
            >
                {card.value}
            </Typography>

        </Grid>

    </Grid>

</CardContent>

            </Card>

        </Grid>

    ))}

</Grid>





    </div>
);
};

export default DashboardDevHome;
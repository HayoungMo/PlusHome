import { Box, Card, CardContent, Grid, Typography, useScrollTrigger } from '@mui/material';
import React, { useEffect, useState } from 'react';
import userService from '../service/userService';
import { Doughnut } from 'react-chartjs-2';
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import BlockIcon from "@mui/icons-material/Block";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import { HiOutlineShoppingBag } from 'react-icons/hi2';
import { FaWonSign } from 'react-icons/fa';
import { IoDocument } from "react-icons/io5";
import { red } from '@mui/material/colors';

const KpiCard = ({
    icon,
    label,
    value,
}) => (
    <Card
        sx={{
            height: 155,
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
                gap: 3,
                px: 3,
                py: 0,
                "&:last-child": {
                    pb: 0,
                },
            }}
        >

            {/* 아이콘 영역 */}
            <Box
                sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    backgroundColor: "#edf4ff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>

            {/* 텍스트 영역 */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    mt:-0.5,
                }}
            >
                <Typography
                    sx={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#111827",
                        mb: 1,
                    }}
                >
                    {label}
                </Typography>

                <Typography
                    sx={{
                        fontSize: "2.5rem",
                        fontWeight: 800,
                        lineHeight: 1,
                        color: "#111827",
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
        bookingCount:"",
        totalPrice:"",
        totalCount:"",
        
    })

    const memberKpiCard = [
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
        key: "couponCount",
        label:"쿠폰 발급",
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

    {
        key:"bookingCount",
        label: "예약 건수",
        value: summary.bookingCount || 0,
        icon: (
            <IoDocument
                size={40}
                color='#2563eb'
                
            />
        ),
    },

    {
        key:"totalPrice",
        label: "총 매출액",
        value: Number(summary.totalPrice || 0).toLocaleString(),
        icon: (
            <FaWonSign
                size={40}
                color='#2563eb'
                
            />
        ),
    },

    {
        key:"totalCount",
        label: "총 판매건수",
        value: Number(summary.totalCount || 0).toLocaleString(),
        icon: (
            <HiOutlineShoppingBag
                size={40}
                color='#ee412a'
                
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
            position: "top",
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
                textAlign: "center"
            }}
        >
            회원 현황
        </Typography>

        <Grid container spacing={3}>

            {memberKpiCard.map((item) => (
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
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid #eef2f7",
                p: 3,
            }}
        >
           <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 3,
                }}
            >
                <Typography
                    sx={{
                        fontSize: "1.8rem",
                        fontWeight: 700,
                        textAlign: "center",
                        width: "100%",
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
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 3,
                }}
            >
                <Typography
                    sx={{
                        fontSize: "1.8rem",
                        fontWeight: 700,
                        textAlign: "center",
                        width: "100%",
                    }}
                >
                    가입 / 탈퇴 현황
                </Typography>
            </Box>

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
            sx={{
                fontSize: "2rem",
                fontWeight: 800,
                mt: 6,
                mb: 4,
                textAlign: "center",
            }}
        >
            운영 현황
        </Typography>



    <Grid container spacing={3}>

    {operationCards.map((item) => (
        <Grid
            item
            xs={12}
            sm={6}
            md={3}
            key={item.key}
        >
            <KpiCard
                icon={item.icon}
                label={item.label}
                value={item.value}
            />
        </Grid>
    ))}

</Grid>







    </div>
);
};

export default DashboardDevHome;
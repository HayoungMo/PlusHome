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
import Loading from '../components/Loading';

const KpiCard = ({
    icon,
    label,
    value,
}) => (
    <Card
        sx={{
            height: 155,
            width:"100%",
            borderRadius: "2px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #eef2f7",
        }}
    >
        <CardContent
            sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                gap: 4,
                px: 4,
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
                        whiteSpace: "nowrap",
                        letterSpacing: "-0.02em",
                    }}
                >
    {value}
</Typography>
            </Box>
        </CardContent>
    </Card>
);

const OperationKpiCard = ({ icon, label, value }) => (
    <Card
        sx={{
            height: 155,
            width: "100%",
            borderRadius: "2px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #eef2f7",
        }}
    >
        <CardContent
            sx={{
                height: "100%",
                px: 3,
                py: 0,
                boxSizing: "border-box",
                display: "grid",
                gridTemplateColumns: "64px minmax(0, 1fr)",
                alignItems: "center",
                columnGap: 2.5,
                "&:last-child": {
                    pb: 0,
                },
            }}
        >
            <Box
                sx={{
                    width: 64,
                    height: 64,
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

            <Box sx={{ minWidth: 0 }}>
                <Typography
                    sx={{
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        color: "#111827",
                        mb: 1,
                        whiteSpace: "nowrap",
                    }}
                >
                    {label}
                </Typography>

                <Typography
                    sx={{
                        fontSize: String(value).length >= 8 ? "2rem" : "2.5rem",
                        fontWeight: 900,
                        lineHeight: 1,
                        color: "#020617",
                        whiteSpace: "nowrap",
                        letterSpacing: "-0.03em",
                    }}
                >
                    {value}
                </Typography>
            </Box>
        </CardContent>
    </Card>
);





const DashboardDevHome = () => {

    const [loading, setLoading] = useState(false);

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

    const [reloadKeys,setReloadKeys] = useState(0)

        const reloadFunction = () => {
        setReloadKeys((prev) => prev + 1);
    };

    const getSalesSummary = async () => {
    const result = await userService.getCatagoryStatistics({
        f_catagory1: "y",
    });

    const list = result.list || [];

    let totalCount = 0;
    let totalPrice = 0;

    for (let item of list) {
        totalCount += item.f_count || 0;
        totalPrice += item.f_price || 0;
    }

    return {
        totalCount,
        totalPrice,
    };
};

    const getSummary = async () =>{

        try {
            setLoading(true)
            const res = await userService.getSummary();
            const salesSummary = await getSalesSummary();

            console.log("요약 결과:", res);
            console.log("판매 요약:", salesSummary);

            setSummary({
                ...res,
                totalCount: salesSummary.totalCount,
                totalPrice: salesSummary.totalPrice,
            });
                
            } catch (error) {
                console.log(error)
            }finally{
                setLoading(false)
            }


        
};

    useEffect(()=>{
        getSummary()
    },[reloadKeys])
    

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


if (loading) {
    return <Loading variant="kpi" count={4} />;
}
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

        <Box
            sx={{
                maxWidth: "1100px",
                mx: "auto",
            }}>        

        <Grid container spacing={3}
            justifyContent='center'>

            {memberKpiCard.map((item) => (
    <Grid item xs={12} sm={6} md={3} key={item.key}>
        <KpiCard {...item} />
    </Grid>
))}
</Grid>
</Box>                

        

    {/* 차트 영역 */}
    <Box sx={{maxWidth: "1100px", mx:"auto",}}>
<Grid container spacing={3} sx={{ mt: 3 }}
    justifyContent='center'>

    <Grid item xs={12} md={6}>
        <Card
            sx={{
                height: 420,
                borderRadius: "2px",
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
                borderRadius: "2px",
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
</Box>

        {/* 운영 현황 */}
        <Box
            sx={{
                maxWidth: "1100px",
                mx: "auto",
            }}
        >
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



    <div className="operation-kpi-grid">
    {operationCards.map((item) => (
        <OperationKpiCard
            key={item.key}
            icon={item.icon}
            label={item.label}
            value={item.value}
        />
    ))}
</div>

</Box>





    </div>
);
};

export default DashboardDevHome;
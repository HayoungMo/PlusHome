import React, { useEffect, useState } from 'react';
import userService from '../service/userService';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { TbCalendarCancel } from 'react-icons/tb';
import { AiOutlineFileDone } from "react-icons/ai";
import { GrInProgress } from "react-icons/gr";
import { MdEventNote, MdToday } from "react-icons/md";

const KpiCard = ({
    icon,
    label,
    value,
}) => (
    <Card
        sx={{
            width: "100%",
            height: 145,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #eef2f7",
            minWidth: 0,
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
            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
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

            <Box>
                <Typography
                    sx={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        mb: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {label}
                </Typography>

                <Typography
                    sx={{
                        fontSize: "2.4rem",
                        fontWeight: 800,
                        lineHeight: 1,
                    }}
                >
                    {value}
                </Typography>
            </Box>
        </CardContent>
    </Card>
);

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
        key: "booking",
        label: "전체 상담",
        value: summary.bookingCount || 0,
        icon: (
            <MdEventNote
                    size={42}
                    color= "#2563eb" 
                
            />
        ),
    },

    {
        key: "today",
        label: "오늘 상담",
        value: summary.todayBookingCount || 0,
        icon: (
            <MdToday
                    size={42}
                    color= "#8b5cf6"
                
            />
        ),
    },

    {
        key: "progress",
        label: "진행중",
        value: summary.progressCount || 0,
        icon: (
            <GrInProgress                
                    size={42}
                    color= "#f59e0b"
                
            />
        ),
    },

    {
        key: "done",
        label: "완료",
        value: summary.doneCount || 0,
        icon: (
            <AiOutlineFileDone
               
                    size= {42}
                    color= "#10b981"
    
            />
        ),
    },

    {
        key: "cancel",
        label: "취소",
        value: summary.cancelCount || 0,
        icon: (
            <TbCalendarCancel
               
                    size={42}
                    color= "#ef4444"
        
            />
        ),
    },
];



    return (
        <div>
            <h2>상담 통계</h2>

             <Grid container spacing={3}>
    {cards.map((item) => (
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
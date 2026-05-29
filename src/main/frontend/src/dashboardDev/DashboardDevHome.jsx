import { Card, useScrollTrigger } from '@mui/material';
import React, { useEffect, useState } from 'react';
import userService from '../service/userService';

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


    return (
        <div>
            <Card>
                <h3>일반 회원 수</h3>
                <h1>{summary.userCount}</h1>
            </Card>
            <Card>
                <h3>기업 회원 수</h3>
                <h1>{summary.companyCount}</h1>
            </Card>
            <Card>
                <h3>유저 탈퇴 현황(일반)</h3>
                <h1>{summary.notJoinedUserCount}</h1>
            </Card>
            <Card>
                <h3>유저 탈퇴 현황(기업)</h3>
                <h1>{summary.notJoinedCompanyCount}</h1>
            </Card>
            <Card>
                <h3>쿠폰 전체 발급 현황</h3>
                <h1>{summary.couponCount}</h1>
            </Card>
            
            
        </div>
    );
};

export default DashboardDevHome;
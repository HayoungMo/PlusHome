import React, { useEffect, useState } from 'react';
import Coupon from '../pages/Coupon';
import userService from '../service/userService';
import TableChkMui from '../components/TableChkMui';
import { Button } from '@mui/material';
import CouponDev from '../dashboardDev/CouponDev'

const CouponList = () => {

    const [userList,setUserList] = useState([])
    const [userType,setUserType] = useState("user");
    const [selectedUserKeys,setSelectedUserKeys] = useState([]);
    
    const userColumns = [
    "id",
    "type",
    "code",
    "name",
    "email",
    "tel",
    "gender",
    "addr",
];


    const [couponData,setCouponData] = useState ({
        coupon_code:"",
        discount:"",
        coupon_max:"",
        coupon_info:"",
        coupon_end:"",
        coupon_type:"",
        coupon_catagory:""
    })

 
   

    const getUserList = async() =>{
        
        console.log("회원 조회")      
        

       const res = await userService.userGetAll(userType)
        console.log(res)

        if(res.success){
            
            setUserList(res.list)
            
            console.log("유저조회결과:",res.list)


        }
        
    } 

    useEffect(()=>{
        getUserList();
    },[userType])

    useEffect(()=>{
        console.log(selectedUserKeys)
    },[selectedUserKeys])

    const onClickCouponInsert = async(evt)=>{
        const data = {
            
            ...couponData,
            userIds:selectedUserKeys,

        }
         console.log("보내는 데이터",data)
         console.log(JSON.stringify(data))

        const res = await userService.insertCouponUser(data)
        console.log(res)
        console.log(selectedUserKeys)
    }


    return (
        <div>
            자 이제부터 쿠폰 발급을 시작하지.
            <CouponDev 
                selectedKeys={selectedUserKeys}
                couponData={couponData}
                setCouponData={setCouponData}/>


            <TableChkMui

                    rowData={userList}
                    columns={userColumns}

                    setSelectedKeys={setSelectedUserKeys}
                    selectedKeys={selectedUserKeys}
                />
            
        </div>
    );
};

export default CouponList;
import React, { useEffect, useState } from 'react';
import Coupon from '../pages/Coupon';
import userService from '../service/userService';
import TableChkMui from '../components/TableChkMui';
import { Button } from '@mui/material';
import CouponDev from '../dashboardDev/CouponDev'
import TextFieldMui from '../components/TextFieldMui';
import SelectMui from '../components/SelectMui';
import CouponDownDev from './CouponDownDev';

const CouponList = () => {

    const [userList,setUserList] = useState([])
    const [userType,setUserType] = useState("user");
    const [selectedUserKeys,setSelectedUserKeys] = useState([]);
    const [searchInfo,setSearchInfo] = useState({})
    const [selectedCouponKeys,setSelectedCouponKeys] = useState([])
    const [reloadFunc, setReloadFunc] = useState(null)
    

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

     const onChangeSearchState = (e) => {
            const {name,value} = e.target;
            setSearchInfo({
                ...searchInfo,
                [name]:value
            })
        }

        const userSearchFunction = () => {
            if(!searchInfo || !searchInfo.searchKey){
                return;
            }

            const { searchKey,searchText } = searchInfo

            if(searchText === '' || searchText === null) {
                getUserList();
                return
            }
            const searchUserList = userList.filter((data) => {
            // 데이터가 없거나 속성이 없는 경우를 대비해 안전하게 문자열로 변환
            const targetValue = data[searchKey]?.toString().toLowerCase() || "";
            const searchValue = searchText.trim().toLowerCase();

            // 검색어가 포함되어 있으면 true 반환
            return targetValue.includes(searchValue);
            });

            setUserList(searchUserList)
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
            
            <CouponDev 
                selectedKeys={selectedUserKeys}
                couponData={couponData}
                setCouponData={setCouponData}
                selectedCouponKeys={selectedCouponKeys}
                setSelectedCouponKeys={setSelectedCouponKeys}
                reloadFunc={reloadFunc}
                setReloadFunc={setReloadFunc}
              
                />

         <div style={{
                display: 'flex',
                width: '550px',
                justifyContent: 'space-around',
                margin: '15px',
            }}>
            <SelectMui
            label='검색 조건'
            name='searchKey'
            option={[
                {title:'아이디',value:'id'},
                {title:'이름',value:'name'},
            ]}
            onChange={onChangeSearchState}
            value={searchInfo.searchKey}
            />
            <TextFieldMui
            name='searchText'
            onChange={onChangeSearchState}
            value={searchInfo.searchText}
            />
            <Button variant='contained' color='primary' onClick={userSearchFunction}>
                검색
            </Button>
        </div>
            <CouponDownDev
                selectedUserKeys={selectedUserKeys}
                selectedCouponKeys={selectedCouponKeys}
            />
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
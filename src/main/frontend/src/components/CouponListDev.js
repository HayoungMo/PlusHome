import React, { useEffect, useState } from 'react';
import CouponService from '../service/couponService';
import TableMui from './TableMui';

const CouponListDev = () => {

    const [coupon, setCoupon] = useState();

    useEffect(()=>{
        const fetchCoupon = async()=>{

            const result = await CouponService.selectCouponDev()
            if(!result.success){
                return
            }
            setCoupon(result.data || []);            
        }
        fetchCoupon();
    },[])


    return (
        <div>
            <TableMui rowData={coupon} col = {["coupon_code", "discount", "coupon_end", "coupon_max", "coupon_info"]} />
            
        </div>
    );
};

export default CouponListDev;
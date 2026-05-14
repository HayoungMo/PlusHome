import React, { useEffect, useState } from 'react';
import CouponService from '../service/couponService';

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
            {
                coupon?.map((item)=>(
                    item.coupon_code
                ))
            }
            
        </div>
    );
};

export default CouponListDev;
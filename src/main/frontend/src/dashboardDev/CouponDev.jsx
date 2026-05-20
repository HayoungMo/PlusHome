import React from 'react';
import CouponAddDev from '../components/CouponAddDev';
import CouponListDev from '../components/CouponListDev';

const CouponDev = (data) => {
    const {selectedKeys, couponData, setCouponData} = data
    return (
        <div>
            <CouponAddDev
                selectedKeys={selectedKeys}
                couponData={couponData}
                setCouponData={setCouponData}/>
            <CouponListDev/>
        </div>
    );
};

export default CouponDev;
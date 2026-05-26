import React from 'react';
import CouponAddDev from '../components/CouponAddDev';
import CouponListDeve from './CouponListDeve'


const CouponDev = (data) => {
    const {selectedKeys, couponData, setCouponData,selectedCouponKeys,setSelectedCouponKeys} = data
    return (
        <div>
            <CouponAddDev
                selectedKeys={selectedKeys}
                couponData={couponData}
                setCouponData={setCouponData}
                selectedCouponKeys={selectedCouponKeys}
                 setSelectedCouponKeys={setSelectedCouponKeys}
                />
            <CouponListDeve
                selectedCouponKeys={selectedCouponKeys}
                setSelectedCouponKeys={setSelectedCouponKeys}
            />
        </div>
    );
};

export default CouponDev;
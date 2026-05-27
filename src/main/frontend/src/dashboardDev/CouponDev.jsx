import React from 'react';
import CouponAddDev from '../components/CouponAddDev';
import CouponListDeve from './CouponListDeve'


const CouponDev = (data) => {
    const {selectedKeys, couponData, setCouponData,selectedCouponKeys,setSelectedCouponKeys,reloadFunc,setReloadFunc} = data
    return (
        <div>
            <CouponAddDev
                selectedKeys={selectedKeys}
                couponData={couponData}
                setCouponData={setCouponData}
                selectedCouponKeys={selectedCouponKeys}
                 setSelectedCouponKeys={setSelectedCouponKeys}
                 reloadFunc={reloadFunc}
                 setReloadFunc={setReloadFunc}
                />
            <CouponListDeve
                selectedCouponKeys={selectedCouponKeys}
                setSelectedCouponKeys={setSelectedCouponKeys}
                setReloadFunc={setReloadFunc}
            />
        </div>
    );
};

export default CouponDev;
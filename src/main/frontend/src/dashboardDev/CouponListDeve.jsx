import React, { useEffect, useState } from 'react';
import CouponService from '../service/couponService';
import TableChkMui from '../components/TableChkMui';


const CouponListDeve = (props) => {
  const [coupon, setCoupon] = useState();

  const{selectedCouponKeys,setSelectedCouponKeys,setReloadFunc} = props;

  const fetchCoupon = async () => {

      const result = await CouponService.selectCouponDev();
      if (!result.success) {
        return;
      }

      const couponList = (result.data || []).map((item,index) =>({
        no: index + 1,
        ...item,
      })
    )

      setCoupon(couponList);
    };

  useEffect(() => {  
    fetchCoupon()
    setReloadFunc(()=>fetchCoupon);
  }, []);

  useEffect(()=>{
    console.log("선택된 쿠폰",selectedCouponKeys)
  },[selectedCouponKeys])

  return (
    <div>
        <TableChkMui
          rowData={coupon}
          col={[
            "no",
            "coupon_code",
            "discount",
            "coupon_end",
            "coupon_max",
            "coupon_info",
          ]}

          selectedKeys={selectedCouponKeys}
          setSelectedKeys={setSelectedCouponKeys}
        />
    </div>
  );
};

export default CouponListDeve;
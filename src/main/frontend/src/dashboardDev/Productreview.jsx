import React, { useEffect, useState } from 'react';
import userService from '../service/userService';
import TableMui from '../components/TableMui';

const Productreview = () => {

    const [reviewStats,setReviewStats] = useState([])

    const getReviewStats = async()=>{

    const result = await userService.getProductReviewStats({})

    console.log("상품별 리뷰 데이터가 들어오나유?",result)

    if(result.success){
        setReviewStats(result.list)
    }
}   

    useEffect(()=>{
        getReviewStats()
    },[])

    const reviewTableData = reviewStats.map((item)=>({

        상품명:item.fName,
        리뷰수:item.reviewCount,
        평균별점:item.avgStar,
        최고별점:item.maxStar,
        최저별점:item.minStar,
        구매건수:item.confirmCount,
        리뷰작성률:item.reviewWriteRate,        


    }))



    return (
        <div>
            <TableMui
                rowData={reviewTableData}
                columns={[
                    "fName",
                    "reviewCount",
                    "avgStar",
                    "maxStar",
                    "minStar",
                    "confirmCount",
                    "reviewWriteRate",
                ]}
                
                col={[
                    "상품명",
                    "리뷰수",
                    "평균별점",
                    "최고별점",
                    "최저별점",
                    "구매건수",
                    "리뷰작성률",
                ]}

                />

            
        </div>
    );
};

export default Productreview;
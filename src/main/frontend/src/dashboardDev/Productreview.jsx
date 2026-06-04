import React, { useEffect, useState } from 'react';
import userService from '../service/userService';
import TableMui from '../components/TableMui';
import Loading from '../components/Loading';

const Productreview = () => {

    const [loading, setLoading] = useState(false);

    const [reviewStats,setReviewStats] = useState([])

    const getReviewStats = async()=>{

    const result = await userService.getProductReviewStats({})

    console.log("상품별 리뷰 데이터가 들어오나유?",result)

    try {
        setLoading(true)

        if(result.success){
        setReviewStats(result.list)
    }
        
    } catch (error) {
         console.log(error);
    }finally{
        setLoading(false)
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

            {loading? (<Loading variant='table' count={5}/>
            ):(<TableMui
                rowData={reviewTableData}
                columns={[
                    "상품명",
                    "리뷰수",
                    "평균별점",
                    "최고별점",
                    "최저별점",
                    "구매건수",
                    "리뷰작성률",
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

                />)}
            

            
        </div>
    );
};

export default Productreview;
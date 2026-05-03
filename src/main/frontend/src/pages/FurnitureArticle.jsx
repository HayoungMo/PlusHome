import React,{useEffect,useRef,useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FurnitureService from '../service/furnitureService';

const FurnitureArticle = () => {
    const calledRef= useRef(false)

    const {f_code} = useParams()
    const [furniture, setFurniture] = useState(null)
    const navigate = useNavigate()

    useEffect(()=>{
        if(calledRef.current){
            return
        }
        
        calledRef.current = true
        getArticle()
    },[f_code])

    const getArticle = async () => {
        try{
            const data = await FurnitureService.getFurnitureItem(f_code)
            setFurniture(data)
        }catch (error){
            console.error("가구 상세 조회 실패",error)
            alert('가구 상세 조회에 실패했습니다.')
        }
    }

    const onPayment = () => {
        navigate(`/payment/${f_code}`)
    }

    if(!furniture){
        return <div>로딩 중... </div>
    }

    return (
        <div>
            <h3>{furniture.f_name}</h3>
            <p>조회수: {furniture.f_viewCount}</p>
            <p>상품 코드: {furniture.f_code}</p>
            <p>업체명: {furniture.c_name}</p>
            <p>업체 종류: {furniture.c_kind}</p>
            <p>정가: {furniture.f_price}원</p>
            <p>할인가: {furniture.f_dprice}원</p>
            <p>할인율: {furniture.f_discount}%</p>
            <p>포인트: {furniture.f_point}</p>
            <p>재고: {furniture.f_count}</p>

            <p>카테고리1: {furniture.f_catagory1}</p>
            <p>카테고리2: {furniture.f_catagory2}</p>
            <p>카테고리3: {furniture.f_catagory3}</p>
            <p>카테고리4: {furniture.f_catagory4}</p>
            <p>카테고리5: {furniture.f_catagory5}</p>

            <button type="button" onClick={onPayment}>
                결제하기
            </button>
        </div>
    );
};

export default FurnitureArticle;
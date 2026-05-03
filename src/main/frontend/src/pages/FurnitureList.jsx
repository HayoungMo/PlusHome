import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FurnitureService from "../service/furnitureService";

const FurnitureList = () => {
    const [list, setList] = useState([]);
    const [pageNum, setPageNum] = useState(1);
    const [searchKey, setSearchKey] = useState("f_name");
    const [searchValue, setSearchValue] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        getList();
    }, [pageNum]);

    useEffect(()=>{
        const timer =setTimeout(()=>{
            getListBySearch()
        },300)

        return () => clearTimeout(timer) 
    },[searchKey,searchValue])

    const getListBySearch = async () =>{
        try{
            const data = await FurnitureService.getFurniture({
                pageNum: 1,
                searchKey,
                searchValue
            })

            setPageNum(1)
            setList(data)
        }catch(error){
            console.error("검색 실패:",error)
        }
    }

    const getList = async () => {
        try {
            const data = await FurnitureService.getFurniture({
                pageNum,
                searchKey,
                searchValue
            })

            console.log("가구 리스트:", data);
            setList(data);
        } catch (error) {
            console.error("가구 목록 조회 실패:", error);
            alert("가구 목록 조회에 실패했습니다.");
        }
    };

    const onArticle = (f_code) => {
        navigate(`/furniture/article/${f_code}`);
    };

    const onSearch = async () => {
        try{
            const data = await FurnitureService.getFurniture({
                pageNum,
                searchKey,
                searchValue
            })

            setPageNum(1)
            setList(data)
        }catch(error){
            console.error("검색 실패:", error)
            alert('검색에 실패했습니다.')
        }
    }

    return (
        <div>
            <h3>가구 목록</h3>

            <select value={searchKey} onChange={(evt)=>setSearchKey(evt.target.value)}>
               <option value="f_name">가구명</option> 
               <option value="f_catagory1">카테고리</option>
               <option value="c_name">업체명</option>
            </select>

            <input value={searchValue} 
            onChange={(evt)=> setSearchValue(evt.target.value)}
            placeholder="검색어"/>
            
            <button type="button" onClick={onSearch}>검색</button>
            
            <br/><br/>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "20px"
                }}
            >
                {list.map((item) => (
                    <div
                        key={item.f_code}
                        onClick={() => onArticle(item.f_code)}
                        style={{
                            border: "1px solid #ddd",
                            padding: "15px",
                            cursor: "pointer"
                        }}
                    >
                        <h4>{item.f_name}</h4>
                        <p>가격: {item.f_price}원</p>
                        <p>할인가: {item.f_dprice}원</p>
                        <p>카테고리: {item.f_catagory1}</p>
                    </div>
                ))}
            </div>

          
        </div>
    );
};

export default FurnitureList;

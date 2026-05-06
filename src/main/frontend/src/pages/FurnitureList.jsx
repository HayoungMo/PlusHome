import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FurnitureService from "../service/furnitureService";

const FurnitureList = () => {
    const [list, setList] = useState([]);
    const [pageNum, setPageNum] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    const [searchKey, setSearchKey] = useState("f_name");
    const [searchValue, setSearchValue] = useState("");

    const [startPage, setStartPage] = useState(1)
    const [endPage,setEndPage] = useState(1)
    const [prevPage,setPrevPage] = useState(1)
    const [nextPage,setNextPage] = useState(1)
    const navigate = useNavigate();

    const pageCount = Math.max(0, endPage - startPage + 1);

    useEffect(() => {
        getList(pageNum);
    }, [pageNum]);

    useEffect(()=>{
        const timer =setTimeout(()=>{
            setPageNum(1)
            getList(1)
        },300)

        return () => clearTimeout(timer) 
    },[searchKey,searchValue])

    const getList = async (page=pageNum) => {
        try {
            const data = await FurnitureService.getFurniture({
                pageNum: page,
                searchKey,
                searchValue
            })

            console.log("가구 리스트:", data);

            setList(data.list);
            setTotalPage(data.totalPage);

            setStartPage(data.startPage);
            setEndPage(data.endPage);
            setPrevPage(data.prevPage);
            setNextPage(data.nextPage);


        } catch (error) {
            console.error("가구 목록 조회 실패:", error);
            alert("가구 목록 조회에 실패했습니다.");
        }
    };

    const onArticle = (f_code) => {
        navigate(`/furniture/article/${f_code}`);
    };

    const onSearch = async () => {
        setPageNum(1)
        getList(1)
        
    }
    const onAddPage = async () =>{
        navigate("/furniture/add")
    }

    return (
        <div>
            <h3>가구 목록</h3>

            <button onClick={onAddPage}>가구 추가</button>
            <br/>

            <select value={searchKey} onChange={(evt)=>setSearchKey(evt.target.value)}>
               <option value="f_name">가구명</option> 
               <option value="f_catagory1">카테고리</option>
               <option value="c_name">업체명</option>
            </select>

            <input value={searchValue} 
            onChange={(evt)=> setSearchValue(evt.target.value)}
            placeholder="검색어"/>
            
            <button onClick={onSearch}>검색</button>
            
            <br/><br/>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "20px"
                }}
            >
                {list.map((item) => {
                    const thumbnail = item.imageList?.find(
                        img => img.img_tag === "THUMBNAIL"
                    )

                    const deliveryPrice = 
                        item.f_dprice >= 50000 ? 0 : 4500

                    console.log(item.imageList)
                    console.log(thumbnail)
                    return (
                        <div
                            key={item.f_code}
                            onClick={()=>onArticle(item.f_code)}
                            style={{
                                border: "1px solid #ddd",
                                padding: "15px",
                                cursor: "pointer"
                            }}
                        >
                        
                        <img
                            src={
                                thumbnail
                                ? `http://localhost:8080/api/images/FURNITURE/${thumbnail.img_name}`
                                : "/no-image.png"
                            }
                            alt={item.f_name}
                            style={{
                                width: "100%",
                                height: "220px",
                                objectFit: "cover"
                            }}
                        />

                        <h4>{item.f_name}</h4>

                        <p>정가: {item.f_price.toLocaleString()}원</p>

                        <p>
                            할인가: {" "} {item.f_dprice.toLocaleString()}원
                        </p>

                        <p>
                            배송비: 
                            {" "}
                            {deliveryPrice===0
                            ? "무료배송"
                            : `${deliveryPrice.toLocaleString()}원`
                            }
                        </p>

                        </div>
                    )
                })}
            </div>


        <div style={{ marginTop: "20px", textAlign: "center" }}>


            <a
                href="#"
                onClick={(evt) => {
                    evt.preventDefault();
                    setPageNum(prevPage);
                }}
            >
                ◀ 이전
            </a>

            {pageCount > 0 &&
                Array.from({ length: pageCount }, (_, i) => startPage + i).map((p) => (
                    <a
                        key={p}
                        href="#"
                        onClick={(evt) => {
                            evt.preventDefault();
                            setPageNum(p);
                        }}
                        style={{
                            margin: "0 8px",
                            color: p === pageNum ? "red" : "blue",
                            fontWeight: p === pageNum ? "bold" : "normal"
                        }}
                    >
                        {p}
                    </a>
                ))
            }

            <a
                href="#"
                onClick={(evt) => {
                    evt.preventDefault();
                    setPageNum(nextPage);
                }}
            >
                다음 ▶
            </a>

        </div>
     

        
        </div>
    );
};

export default FurnitureList;

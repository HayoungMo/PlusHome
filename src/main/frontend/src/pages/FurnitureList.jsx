import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FurnitureService from "../service/furnitureService";
import LikeService from "../service/likeService";

const FurnitureList = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const pageNum = Number(
        new URLSearchParams(location.search).get("page")
    ) || 1;

    const [list, setList] = useState([]);
    const [totalPage, setTotalPage] = useState(1);

    const [searchKey, setSearchKey] = useState("f_name");
    const [searchValue, setSearchValue] = useState("");

    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(1);
    const [prevPage, setPrevPage] = useState(1);
    const [nextPage, setNextPage] = useState(1);
    const [likedMap, setLikedMap] = useState({});

    const pageCount = Math.max(0, endPage - startPage + 1);

    const getLoginUser = () => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    };

    const getLoginFurnitureCompany = () => {
        const loginUser = getLoginUser();

        if (!loginUser || loginUser.type !== "company") return null;

        return (
            loginUser.companyList?.find(company => company.c_kind === "shop") ||
            null
        );
    };

    const canManageFurniture = (furnitureItem) => {
        const furnitureCompany = getLoginFurnitureCompany();

        if (!furnitureCompany || !furnitureItem) return false;

        return furnitureItem.c_id === furnitureCompany.c_id;
    };

    useEffect(() => {
        getList(pageNum);
    }, [pageNum, searchKey, searchValue]);

    useEffect(()=>{
        const token = localStorage.getItem("token")

        if(!token || list.length === 0){
            setLikedMap({})
            return
        }

        list.forEach((item)=>{
            LikeService.checkFurnitureLike(item.f_code)
            .then((res)=>{
                setLikedMap((prev)=>({
                    ...prev,
                    [item.f_code]: res.data?.liked || false
                }))
            })
            .catch((error)=>{
                console.error("찜 여부 확인 실패",error)
            })
        })
    },[list])

    const getList = async (page = pageNum) => {
        try {
            const data = await FurnitureService.getFurniture({
                pageNum: page,
                searchKey,
                searchValue
            });

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
        navigate(`/furniture/article/${f_code}?page=${pageNum}`);
    };

    const onSearch = () => {
        navigate(`/furniture/list?page=1`);
    };

    const onAddPage = () => {
        navigate("/furniture/add");
    };

    const onUpdate = (f_code) => {
        navigate(`/furniture/update/${f_code}?page=${pageNum}`)
    }

    const onDelete = async (f_code) => {
        try{
            await FurnitureService.deleteFurniture(f_code)
            alert("삭제 완료")
            getList(pageNum)

        }catch(error){
            console.error(error)
            alert("삭제 실패")
        }
    }

    const onToggleLike = (evt, f_code) => {
        evt.stopPropagation();

        const token = localStorage.getItem("token");

        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        LikeService.toggleFurnitureLike(f_code)
            .then((res) => {
                setLikedMap((prev) => ({
                    ...prev,
                    [f_code]: res.data?.liked || false,
                }));
            })
            .catch((error) => {
                console.error("찜 처리 실패", error);
                alert("찜 처리에 실패했습니다.");
            });
    };


    return (
        <div>
            <h3><a href="/furniture/list">가구 목록</a></h3>

            {getLoginFurnitureCompany() &&
            <button onClick={onAddPage}>가구 추가</button> 
            }

            <br />

            <select
                value={searchKey}
                onChange={(evt) => setSearchKey(evt.target.value)}
            >
                <option value="f_name">가구명</option>
                <option value="f_catagory1">카테고리</option>
                <option value="c_name">업체명</option>
            </select>

            <input
                value={searchValue}
                onChange={(evt) => setSearchValue(evt.target.value)}
                placeholder="검색어"
            />

            <button onClick={onSearch}>검색</button>

            <br /><br />

            {list.length === 0? (
            <div
                style={{
                    padding: "40px",
                    textAlign: "center",
                    border: "1px solid #ddd",
                    marginTop: "20px"
                }}
            >
                가구 목록을 불러올 수 없습니다
            </div>   

            ):(
            <>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "20px"
            }}>
                {list.map((item) => {
                    const thumbnail = item.imageList?.find(
                        img => img.img_tag === "THUMBNAIL"
                    );

                    const productDeliveryPrice = Number(
                        item.f_deliveryPrice ?? item.f_deliveryprice ?? 0
                    );

                    const deliveryPrice =
                        Number(item.f_dprice || 0) >= 50000 ? 0 : productDeliveryPrice;
                        
                    return (
                        <div
                            key={item.f_code}
                            onClick={() => onArticle(item.f_code)}
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

                            <p>할인가: {item.f_dprice.toLocaleString()}원</p>

                            <p>
                                배송비:{" "}
                                {deliveryPrice === 0
                                    ? "무료배송"
                                    : `${deliveryPrice.toLocaleString()}원`}
                            </p>
                            
                            <button
                                type="button"
                                onClick={(evt) => onToggleLike(evt, item.f_code)}
                                style={{
                                    border: "1px solid #ddd",
                                    background: likedMap[item.f_code] ? "#ffdddd" : "white",
                                    color: likedMap[item.f_code] ? "red" : "black",
                                    padding: "8px 12px",
                                    cursor: "pointer",
                                    marginRight: "6px"
                                }}
                            >
                                {likedMap[item.f_code] ? "♥ 찜" : "♡ 찜"}
                            </button>

                        {canManageFurniture(item) && (
                            <>
                            <button
                                onClick={(evt)=> {
                                    evt.stopPropagation()
                                    onUpdate(item.f_code)}}>
                                수정
                            </button>
                            <button
                                onClick={(evt) => {
                                    evt.stopPropagation()
                                    onDelete(item.f_code)
                                }}>
                                삭제
                            </button>
                            </>
                        )}

                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: "20px", textAlign: "center" }}>

                <a
                    href="#"
                    onClick={(evt) => {
                        evt.preventDefault();
                        navigate(`/furniture/list?page=${prevPage}`);
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
                                navigate(`/furniture/list?page=${p}`);
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
                        navigate(`/furniture/list?page=${nextPage}`);
                    }}
                >
                    다음 ▶
                </a>
                    
            </div>
        </>
        )}
        
        </div>

    );
};

export default FurnitureList;
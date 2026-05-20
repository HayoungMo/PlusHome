import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FurnitureService from "../service/furnitureService";
import LikeService from "../service/likeService";
import Loading from "../components/Loading";

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
    
    const [loading , setLoading] = useState(true)

    const [sort, setSort] = useState("latest");
    const pageCount = Math.max(0, endPage - startPage + 1);

    const sortOptions = [
        { value: "latest", label: "신상품순" },
        { value: "discountHigh", label: "할인율순" },
        { value: "reviewHigh", label: "리뷰 많은순" },
        { value: "salesHigh", label: "판매 많은순" },
        { value: "priceLow", label: "낮은 가격순" },
        { value: "priceHigh", label: "높은 가격순" },
    ];

    const getLoginUser = () => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    };

    const getLoginFurnitureCompany = () => {
        const loginUser = getLoginUser();

        if (!loginUser || loginUser.type !== "company") return null;

        return (
            loginUser.companyList?.find((company) => company.c_kind === "shop") ||
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
    }, [pageNum, searchKey, searchValue, sort]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token || list.length === 0) {
            setLikedMap({});
            return;
        }

        list.forEach((item) => {
            LikeService.checkFurnitureLike(item.f_code)
                .then((res) => {
                    setLikedMap((prev) => ({
                        ...prev,
                        [item.f_code]: res.data?.liked || false,
                    }));
                })
                .catch((error) => {
                    console.error("찜 여부 확인 실패", error);
                });
        });
    }, [list]);

    const getList = async (page = pageNum) => {
        try {
            setLoading(true)

            const data = await FurnitureService.getFurniture({
                pageNum: page,
                searchKey,
                searchValue,
                sort,
            });

            setList(data.list);
            setTotalPage(data.totalPage);

            setStartPage(data.startPage);
            setEndPage(data.endPage);
            setPrevPage(data.prevPage);
            setNextPage(data.nextPage);
        } catch (error) {
            console.error("가구 조회 실패:", error);
            alert("가구 조회에 실패했습니다.");
        } finally{
            setLoading(false)
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
        navigate(`/furniture/update/${f_code}?page=${pageNum}`);
    };

    const onDelete = async (f_code) => {
        try {
            await FurnitureService.deleteFurniture(f_code);
            alert("삭제 완료");
            getList(pageNum);
        } catch (error) {
            console.error(error);
            alert("삭제 실패");
        }
    };

    const onToggleLike = (evt, f_code) => {
        evt.preventDefault();
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

    if (loading) {
        return <Loading message="상품 목록을 불러오는 중입니다." />;
    }

    return (
        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "24px" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "18px",
                }}
            >
                <h3 style={{ margin: 0 }}>
                    <a
                        href="/furniture/list"
                        style={{
                            color: "#111",
                            textDecoration: "none",
                        }}
                    >
                        가구
                    </a>
                </h3>

                {getLoginFurnitureCompany() && (
                    <button
                        onClick={onAddPage}
                        style={{
                            border: "1px solid #ddd",
                            background: "white",
                            borderRadius: "4px",
                            padding: "8px 12px",
                            cursor: "pointer",
                        }}
                    >
                        가구 추가
                    </button>
                )}
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    marginBottom: "16px",
                }}
            >
                <select
                    value={searchKey}
                    onChange={(evt) => setSearchKey(evt.target.value)}
                    style={{
                        height: "36px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        padding: "0 8px",
                    }}
                >
                    <option value="f_name">가구명</option>
                    <option value="f_catagory1">카테고리</option>
                    <option value="c_name">업체명</option>
                </select>

                <input
                    value={searchValue}
                    onChange={(evt) => setSearchValue(evt.target.value)}
                    placeholder="검색어"
                    style={{
                        height: "36px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        padding: "0 10px",
                    }}
                />

                <button
                    onClick={onSearch}
                    style={{
                        height: "36px",
                        border: "1px solid #1976d2",
                        background: "#1976d2",
                        color: "white",
                        borderRadius: "4px",
                        padding: "0 14px",
                        cursor: "pointer",
                    }}
                >
                    검색
                </button>
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    borderTop: "1px solid #eee",
                    paddingTop: "14px",
                    marginBottom: "22px",
                    fontSize: "14px",
                }}
            >
                {sortOptions.map((option, index) => {
                    const active = sort === option.value;

                    return (
                        <React.Fragment key={option.value}>
                            {index > 0 && <span style={{ color: "#ddd" }}>·</span>}

                            <button
                                type="button"
                                onClick={() => {
                                    setSort(option.value);
                                    navigate("/furniture/list?page=1");
                                }}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    cursor: "pointer",
                                    color: active ? "#111" : "#666",
                                    fontWeight: active ? 800 : 400,
                                    fontSize: "14px",
                                }}
                            >
                                {option.label}
                            </button>
                        </React.Fragment>
                    );
                })}
            </div>

            {list.length === 0 ? (
                <div
                    style={{
                        padding: "40px",
                        textAlign: "center",
                        border: "1px solid #ddd",
                        marginTop: "20px",
                    }}
                >
                    가구 목록을 불러올 수 없습니다
                </div>
            ) : (
                <>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                            gap: "32px 18px",
                        }}
                    >
                        {list.map((item) => {
                            const thumbnail = item.imageList?.find(
                                (img) => img.img_tag === "THUMBNAIL"
                            );

                            const productDeliveryPrice = Number(
                                item.f_deliveryPrice ?? item.f_deliveryprice ?? 0
                            );

                            const deliveryPrice =
                                Number(item.f_dprice || 0) >= 50000
                                    ? 0
                                    : productDeliveryPrice;

                            const discountRate = Number(item.f_discount || 0);

                            return (

                            <div
                                key={item.f_code}
                                onClick={() => onArticle(item.f_code)}
                                style={{
                                    cursor: "pointer",
                                    minWidth: 0,
                                    textAlign: "left",
                                }}
                            >
                                <div
                                    style={{
                                        position: "relative",
                                        width: "100%",
                                        aspectRatio: "1 / 1.18",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        background: "#f7f7f7",
                                        marginBottom: "10px",
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
            height: "100%",
            objectFit: "contain",
            display: "block",
            padding: "10px",
            boxSizing: "border-box",
        }}
    />

    <span
        role="button"
        tabIndex={0}
        onClick={(evt) => onToggleLike(evt, item.f_code)}
        onKeyDown={(evt) => {
            if (evt.key === "Enter" || evt.key === " ") {
                onToggleLike(evt, item.f_code);
            }
        }}
        style={{
            position: "absolute",
            right: "10px",
            bottom: "8px",
            color: likedMap[item.f_code] ? "#e60023" : "#555",
            cursor: "pointer",
            fontSize: "26px",
            lineHeight: 1,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            WebkitTapHighlightColor: "transparent",
            textShadow: "0 1px 4px rgba(255,255,255,0.9)",
        }}
    >
        {likedMap[item.f_code] ? "♥" : "♡"}
    </span>
</div>

                                <div
                                    style={{
                                        display: "inline-block",
                                        maxWidth: "100%",
                                        border: "1px solid #ddd",
                                        color: "#555",
                                        background: "#fafafa",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        padding: "2px 6px",
                                        marginBottom: "7px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {item.c_name || "업체"}
                                </div>

                                <div
                                    style={{
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        lineHeight: 1.35,
                                        color: "#222",
                                        marginBottom: "6px",
                                        textAlign: "left",
                                    }}
                                >
                                    {item.f_name}
                                </div>

                                {Number(item.f_price || 0) > Number(item.f_dprice || 0) && (
                                    <div
                                        style={{
                                            fontSize: "10px",
                                            color: "#aaa",
                                            textDecoration: "line-through",
                                            marginBottom: "2px",
                                            textAlign: "left",
                                        }}
                                    >
                                        {Number(item.f_price || 0).toLocaleString()}원
                                    </div>
                                )}

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "baseline",
                                        gap: "4px",
                                        marginBottom: "5px",
                                        justifyContent: "flex-start",
                                        textAlign: "left",
                                    }}
                                >
                                    {discountRate > 0 && (
                                        <span
                                            style={{
                                                color: "#e60023",
                                                fontSize: "15px",
                                                fontWeight: 800,
                                            }}
                                        >
                                            {discountRate}%
                                        </span>
                                    )}

                                    <span
                                        style={{
                                            color: "#111",
                                            fontSize: "18px",
                                            fontWeight: 800,
                                            letterSpacing: 0,
                                        }}
                                    >
                                        {Number(item.f_dprice || 0).toLocaleString()}원
                                    </span>
                                </div>

                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#777",
                                        textAlign: "left",
                                    }}
                                >
                                    배송비{" "}
                                    {deliveryPrice === 0
                                        ? "무료"
                                        : `${deliveryPrice.toLocaleString()}원`}
                                </div>

                                {canManageFurniture(item) && (
                                    <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                                        <button
                                            onClick={(evt) => {
                                                evt.stopPropagation();
                                                onUpdate(item.f_code);
                                            }}
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={(evt) => {
                                                evt.stopPropagation();
                                                onDelete(item.f_code);
                                            }}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                        })}
                    </div>

                    <div style={{ marginTop: "28px", textAlign: "center" }}>
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
                            Array.from(
                                { length: pageCount },
                                (_, i) => startPage + i
                            ).map((p) => (
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
                                        fontWeight:
                                            p === pageNum ? "bold" : "normal",
                                    }}
                                >
                                    {p}
                                </a>
                            ))}

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
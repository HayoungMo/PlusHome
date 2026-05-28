import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FurnitureService from "../service/furnitureService";
import LikeService from "../service/likeService";
import Loading from "../components/Loading";
import { Snackbar } from "@mui/material";
import AlertMui from "../components/AlertMui";
import { getFurnitureCategoryCode,getFurnitureCategoryTitle  } from "../components/FurnitureCategorySelect";

const FurnitureList = () => {
    const location = useLocation();
    const navigate = useNavigate();

    //총합검색어 연결을 위한 작업 - 0522 모하영
    const searchParams = new URLSearchParams(location.search);

    const pageNum = Number(searchParams.get("page")) || 1;
    const urlSearchKey = searchParams.get("searchKey") || "f_name";
    const urlSearchValue = searchParams.get("searchValue") || "";
    const urlSort = searchParams.get("sort") || "latest";

    //URL에서 카테고리 값을 읽는다. - 0527 모하영
    const urlCategoryFilters = {
        f_catagory1: searchParams.get("f_catagory1") || "",
        f_catagory2: searchParams.get("f_catagory2") || "",
        f_catagory3: searchParams.get("f_catagory3") || "",
        f_catagory4: searchParams.get("f_catagory4") || "",
        f_catagory5: searchParams.get("f_catagory5") || "",
    };

    const [list, setList] = useState([]);
    const [totalPage, setTotalPage] = useState(1);

    //state 초기값을 수정 - 0522 모하영(sort까지),0527 모하영 추가
    const [searchKey, setSearchKey] = useState(urlSearchKey);
    const [searchValue, setSearchValue] = useState(
        urlSearchValue === "f_catagory1"
            ? getFurnitureCategoryTitle(urlSearchValue)
            : urlSearchValue
    );
    const [categoryFilters, setCategoryFilters] = useState(urlCategoryFilters);

    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(1);
    const [prevPage, setPrevPage] = useState(1);
    const [nextPage, setNextPage] = useState(1);
    const [likedMap, setLikedMap] = useState({});
    
    const [loading , setLoading] = useState(true)

    const [likingMap, setLikingMap] = useState({})
    
    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        title: "",
        text: "",
    })

    const showAlert = ({ severity = "info", title = "", text = "" }) => {
        setAlert({
            open: true,
            severity,
            title,
            text,
        });
        };

    const closeAlert = () => {
        setAlert((prev) => ({
            ...prev,
            open: false,
        }));
        };

    const [sort, setSort] = useState(urlSort);
    const pageCount = Math.max(0, endPage - startPage + 1);

    const sortOptions = [
        { value: "latest", label: "신상품순" },
        { value: "discountHigh", label: "할인율순" },
        { value: "reviewHigh", label: "리뷰 많은순" },
        { value: "salesHigh", label: "판매 많은순" },
        { value: "priceLow", label: "낮은 가격순" },
        { value: "priceHigh", label: "높은 가격순" },
    ];

    //URL이 바뀌면 state 동기화 해줌 - 0522 모하영, 0527 모하영 수정
    useEffect(() => {
    setSearchKey(urlSearchKey);
    setSearchValue(urlSearchValue);
    setSort(urlSort);
    setCategoryFilters(urlCategoryFilters);
    }, [
        urlSearchKey,
        urlSearchValue,
        urlSort,
        urlCategoryFilters.f_catagory1,
        urlCategoryFilters.f_catagory2,
        urlCategoryFilters.f_catagory3,
        urlCategoryFilters.f_catagory4,
        urlCategoryFilters.f_catagory5,
    ]);

    //챗봇 카테고리 검색을 위해 의존성 추가하기 0527 모하영
    useEffect(() => {
    getList(pageNum);
    }, [
        pageNum,
        urlSearchKey,
        urlSearchValue,
        urlSort,
        urlCategoryFilters.f_catagory1,
        urlCategoryFilters.f_catagory2,
        urlCategoryFilters.f_catagory3,
        urlCategoryFilters.f_catagory4,
        urlCategoryFilters.f_catagory5,
    ]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token || list.length === 0) {
            setLikedMap({});
            return;
        }

        LikeService.getMyFurnitureLikes()
            .then((res) => {
            const likedCodes = new Set(
                (res.data || []).map((item) => item.f_code)
            );

            const nextLikedMap = {};

            list.forEach((item) => {
                nextLikedMap[item.f_code] = likedCodes.has(item.f_code);
            });

            setLikedMap(nextLikedMap);
            })
            .catch((error) => {
            console.error("찜 목록 조회 실패", error);
            setLikedMap({});
            });
    }, [list]);

    const getList = async (page = pageNum) => {
        try {
            setLoading(true)

            const data = await FurnitureService.getFurniture({
                pageNum: page,
                searchKey: urlSearchKey,
                searchValue: urlSearchValue,
                sort: urlSort,
                ...urlCategoryFilters,
            });

            setList(data.list);
            setTotalPage(data.totalPage);

            setStartPage(data.startPage);
            setEndPage(data.endPage);
            setPrevPage(data.prevPage);
            setNextPage(data.nextPage);
        } catch (error) {
            console.error("가구 조회 실패:", error);
            showAlert({
                severity: "error",
                title: "조회 실패",
                text: "가구 조회에 실패했습니다.",
            });
        } finally{
            setLoading(false)
        }
    };

    const onArticle = (f_code) => {
        navigate(`/furniture/article/${f_code}?page=${pageNum}`);
    };

    //쇼핑 검색 버튼에도 URL검색값을 실어줌 - 0522 모하영
    const onSearch = (evt) => {
        evt.preventDefault();
        const submitSearchValue =
            searchKey === "f_catagory1"
                ? getFurnitureCategoryCode(searchValue)
                : searchValue;

        navigate(makeListUrl(1, submitSearchValue));
    };

    //근데 그 URL 문자열이 길어서 축약함수 - 0522 모하영, 0527 모하영
    const makeListUrl = (page, nextSearchValue = searchValue) => {
        const params = new URLSearchParams({
            page: String(page),
            searchKey,
            searchValue: nextSearchValue,
            sort,
        });

        Object.keys(categoryFilters).forEach((key) => {
            if (categoryFilters[key]) {
                params.set(key, categoryFilters[key]);
            }
        });

        return `/furniture/list?${params.toString()}`;
    };
    //makeListUrl이 현재 sort를 쓰기 때문에 정렬버튼에 따로 함수를 두면 좋다 - 0522모하영
    const makeListUrlWithSort = (page, nextSort) => {
        const params = new URLSearchParams({
            page: String(page),
            searchKey,
            searchValue,
            sort: nextSort,
        });

        Object.keys(categoryFilters).forEach((key) => {
            if (categoryFilters[key]) {
                params.set(key, categoryFilters[key]);
            }
        });

        return `/furniture/list?${params.toString()}`;
    };

    const feedback = (
        <Snackbar
            open={alert.open}
            autoHideDuration={3000}
            onClose={closeAlert}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
            <div>
            <AlertMui
                severity={alert.severity}
                title={alert.title}
                text={alert.text}
                onClose={closeAlert}
            />
            </div>
        </Snackbar>
    );   

    const onToggleLike = (evt, f_code) => {
        evt.preventDefault();
        evt.stopPropagation();

        if (likingMap[f_code]) return;

        const token = localStorage.getItem("token");

        if (!token) {
            showAlert({
            severity: "warning",
            title: "로그인 필요",
            text: "로그인이 필요합니다.",
            });

            setTimeout(() => {
            navigate("/login");
            }, 500);

            return;
        }

        setLikingMap((prev) => ({
            ...prev,
            [f_code]: true,
        }));

        LikeService.toggleFurnitureLike(f_code)
            .then((res) => {
            setLikedMap((prev) => ({
                ...prev,
                [f_code]: res.data?.liked || false,
            }));
            })
            .catch((error) => {
            console.error("찜 처리 실패", error);
            showAlert({
                severity: "error",
                title: "찜 실패",
                text: "찜 처리에 실패했습니다.",
            });
            })
            .finally(() => {
            setLikingMap((prev) => ({
                ...prev,
                [f_code]: false,
            }));
            });
        };

    if (loading) {
        return(
            <>
                {feedback}
                <Loading message="상품 목록을 불러오는 중입니다." />
            </>
        )
    }

    return (
        <>
        {feedback}
        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "24px" }}>
            <form
                onSubmit={onSearch}
                style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    marginBottom: "16px",
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

            </form>
        
            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    marginBottom: "16px",
                }}
            >
                {/* 기존 검색어가 남지 않게 수정 - 0527 모하영 */}
                <select
                    value={searchKey}
                    onChange={(evt) => {
                            setSearchKey(evt.target.value);
                            setSearchValue("");
                        }}
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
                    type="submit"
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

                            {/* 정렬 버튼도 검색값을 유지해야해서 수정 - 0522 모하영 */}
                            <button
                                type="button"
                                onClick={() => {
                                    setSort(option.value);
                                    navigate(makeListUrlWithSort(1, option.value));
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
                    조건에 맞는 상품이 없습니다.
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
                evt.preventDefault();
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
            opacity: likingMap[item.f_code] ? 0.5 : 1,
            pointerEvents: likingMap[item.f_code] ? "none" : "auto",
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

                            </div>
                        );
                        })}
                    </div>

                    <div style={{ marginTop: "28px", textAlign: "center" }}>
                        <a
                            href="#"
                            onClick={(evt) => {
                                evt.preventDefault();
                                if (pageNum <= 1) return;
                                navigate(makeListUrl(prevPage));
                            }}
                            style={{
                                pointerEvents: pageNum <= 1 ? "none" : "auto",
                                color: pageNum <= 1 ? "#aaa" : "blue",
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
                                        navigate(makeListUrl(p));
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
                                if (pageNum >= totalPage) return;
                                navigate(makeListUrl(nextPage));
                            }}
                            style={{
                                pointerEvents: pageNum >= totalPage ? "none" : "auto",
                                color: pageNum >= totalPage ? "#aaa" : "blue",
                            }}
                            >
                            다음 ▶
                            </a>
                    </div>
                </>
            )}
        </div>
    </>
    );
};

export default FurnitureList;
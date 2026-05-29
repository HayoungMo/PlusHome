import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FurnitureService from '../service/furnitureService';
import InteriorService from '../service/interiorService';
import MultiFilterBar from '../components/MultiFilterBar';

import { 
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Chip,
    Stack,
        } from '@mui/material';
import {
    furnitureCategoryOptions,
    getFurnitureCategoryCode,
    getFurnitureCategoryTitle,
        } from "../components/FurnitureCategorySelect";

const SearchPage = () => {

    // 쿼리스트링을 사용한다. 그 값을 가져올 수 있는 hook으로는 useLacation(현재의 Location 객체 반환), useSearchParams 두개가 있다.
    const [searchParams, setSearchParams] =useSearchParams();

    //사용자가 입력한 검색어, 주소창에서 keyword라는 이름의 값
    const keyword = searchParams.get("keyword") || "";
    const type = searchParams.get("type") || "all";
    const page = Number(searchParams.get("page")|| 1 );
    
    //URL 필터값 읽기
    const category = searchParams.get("category") || "";
    const priceRange = searchParams.get("priceRange") || "";
    const discount = searchParams.get("discount") || "";
    const freeDelivery = searchParams.get("freeDelivery") || "";

    //인테리어 URL 필터값 -> 인테리어 검색은 지역을 기준으로 검색
    const interiorRegion = searchParams.get("interiorRegion") || "";
    const housingType = searchParams.get("housingType") || "";
    const areaSize = searchParams.get("areaSize") || "";
    const purpose = searchParams.get("purpose") || "";
    const spaces = searchParams.get("spaces") || "";
    const budget = searchParams.get("budget") || "";

    //필터 옵션 
    const [filterOptions, setFilterOptions] = useState({
        furnitureCategories: [],
        interiorRegions: [],
    });


    //화면 상태 관리
    const [inputKeyword, setInputKeyword] = useState(keyword);

    const [results, setResults] = useState({
        furniture:[],
        interior:[],
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    
    //페이징 처리
    //const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; //한페이지에 5개씩
    //전체 탭에서 한 번에 보여줄 카드 수
    const carouselPageSize = 5; 

    const [carouselIndex, setCarouselIndex] = useState({
        furniture: 0,
        interior: 0,
    });

    const moveCarousel = (sectionKey, listLength, direction) => {
        setCarouselIndex((prev) => {
            const currentIndex = prev[sectionKey] || 0;

            const nextIndex = 
                direction === "next"
                    ? currentIndex + carouselPageSize
                    : currentIndex - carouselPageSize;
            const maxIndex = Math.max(0, listLength - carouselPageSize);

            return {
                ...prev,
                [sectionKey]: Math.min(Math.max(nextIndex, 0), maxIndex),
            };
        });
    };

    const onClickTab = (nextType) => {
        setSearchParams({
            keyword: keyword.trim(),
            type: nextType,
            page: 1,
        });
    };


    //검색 탭 목록 - 탭으로 쓸지 아니면 다른 방식으로 할지는 고민 , 현재는 객체로 넘겨줌
    const searchTabs = [
        { value: "all", title: "전체"},
        { value: "furniture", title: "쇼핑"},
        { value: "interior", title: "인테리어"},
    ];


    //주소창의 keyword가 바뀔때마다 자동으로 검색 실행...을 굳이? 일단 넣어
    //뒤로가기 해서 주소가 바뀌면 이 useEffect를 실행하고 결과를 복구한다.
    useEffect(()=>{
        setInputKeyword(keyword);
    },[keyword]);
    
    
    //keyword 또는 검색 탭이 바뀌면 DB 검색 실행함(동기화), 쇼핑 카테고리, 가격, 할인, 무료
  

    //검색 실행 의존성 useEffect 입니다. 지우지마
    useEffect(() => {
        getSearchResult();
    }, [keyword, type, category, priceRange, discount, freeDelivery,interiorRegion, housingType, areaSize, purpose, spaces, budget]);

    //검색 조건 바뀔 때 캐러셀 초기화 추가
    useEffect(() => {
        setCarouselIndex({
            furniture: 0,
            interior: 0,
            freeBoard: 0,
        });
    },[keyword, type, category, priceRange, discount, freeDelivery, interiorRegion]);

    const priceOptions = [
        { value: "", title: "전체 가격" },
        { value: "0-10000", title: "1만원 이하" },
        { value: "10000-50000", title: "1만원 ~ 5만원" },
        { value: "50000-100000", title: "5만원 ~ 10만원" },
        { value: "100000-300000", title: "10만원 ~ 30만원" },
        { value: "300000-500000", title: "30만원 ~ 50만원" },
        { value: "500000-", title: "50만원 이상" },
    ];

    
     //ㄱㄴㄷㄹ 순서 처리
    const sortByKorean = (list, getText) => {
        return [...list].sort((a,b) => 
            String(getText(a) || "").localeCompare(String(getText(b) || "" ), "ko")
        );
    };
    //인테리어 검색은 프론트에서 일단 필터링
    const filterByKeyword = (list,fields) => {
        const word = keyword.trim().toLowerCase();

        if(!word) return list;

        return list.filter((item) => 
        fields.some((field) => 
            String(item[field] || "").toLowerCase().includes(word)
            )
        );
    };

    const makeFurnitureCategories = (list) => {
        const categorySet = new Set();

        list.forEach((item) => {

            const categoryCode = getFurnitureCategoryCode(item.f_catagory1);
            if (categoryCode) {
                categorySet.add(categoryCode);
            }
        });

        return Array.from(categorySet).sort((a, b) =>
            String(a).localeCompare(String(b), "ko")
        );
    };

    //인테리어 업체 주소에서 시/도 , 구/군 단위 지역명을 추출하는 함수
    const getInteriorRegion = (addr) => {
        if (!addr) return "";

        const cleanAddr = String(addr).split("__")[0].trim();
        return cleanAddr.split(" ")[0] || "";   
    };

    const makeInteriorRegions = (list) => {
        const regionSet = new Set();

        list.forEach((item) => {
            const region = getInteriorRegion(item.c_addr);
            if (region) {
                regionSet.add(region);
        }
    });

    return Array.from(regionSet).sort((a, b) =>
        String(a).localeCompare(String(b), "ko")
      );
    };

    const interiorRegionOptions = [
        { value: "", title: "전체 지역" },
        ...filterOptions.interiorRegions.map((item) => ({
            value: item,
            title: item,
        })),
    ];

    //mui select 옵션 DB 기반으로 만들어줌. 
    const searchFurnitureCategoryOptions = [
        { value: "", title: "전체 카테고리" },
        ...filterOptions.furnitureCategories.map((item) => ({
            value: item,
            title: getFurnitureCategoryTitle(item),
        })),
    ];

    //검색 필터 정리
    const furnitureFilterGroups = [
        {
            key: "category",
            label: "카테고리",
            options: furnitureCategoryOptions.f_catagory1.map((item) => ({
                value: item.value,
                title: item.title,
            })),
        },
        {
            key: "priceRange",
            label: "가격",
            options: priceOptions.filter((item) => item.value),
        },
        {
            key: "discount",
            label: "혜택",
            options: [{ value: "Y", title: "할인 상품"}],
        },
        {
            key: "freeDelivery",
            label: "배송",
            options: [{ value: "Y", title: "무료배송"}],
        },
    ];

    const interiorFilterGroups = [
        {
            key:"interiorRegion",
            label:"지역",
            options: interiorRegionOptions.filter((item) => item.value),
        },
        {
            key: "housingType",
            label: "주거 유형",
            options: [
                { value: "apt", title:"아파트" },
                { value: "villa", title:"빌라" },
                { value: "house", title:"단독주택" },
                { value: "officetel", title:"오피스텔" },
            ],
        },
        {
            key: "areaSize",
            label: "면적",
            options: [
                { value: "10_20", title: "10~20평" },
                { value: "30", title: "30평대" },
                { value: "40", title: "40평대" },
                { value: "50", title: "50평 이상" },
            ],
        },
        {
            key: "purpose",
            label: "인테리어 이유",
            options: [
                { value: "purchase", title: "집 구매 후" },
                { value: "existing", title: "기존 집 리모델링" },
                { value: "new_house", title: "새 집 입주" },
            ],
        },
        {
            key: "spaces",
            label: "필요한 공간",
            options: [
                { value: "livingroom", title: "거실" },
                { value: "kitchen", title: "주방" },
                { value: "storage", title: "수납" },
                { value: "door", title: "중문/문" },
                { value: "window", title: "창문" },
                { value: "wallpaper", title: "벽지" },
                { value: "lighting", title: "조명" },
                { value: "tile", title: "타일" },
                { value: "floor", title: "마루" },
            ],
        },
        {
            key: "budget",
            label: "예산",
            options: [
                { value: "1000", title: "1000만원 이하" },
                { value: "2000", title: "1000~2000만원" },
                { value: "3000", title: "2000~3000만원" },
                { value: "5000", title: "3000~5000만원" },
                { value: "10000", title: "5000만원 이상" },
            ],
        },
    ];


    const getPriceRange = () => {
        if (!priceRange) {
            return { min: "", max: "" };
        }

        const [min, max] = priceRange.split("-");

        return { min, max };
    };

    //필터 함수 (가구, 인테리어)
    const filterFurnitureByOption = (list) => {
        const { min, max } = getPriceRange();

        return list.filter((item) => {
            const price = Number(item.f_price || 0);
            const deliveryPrice = Number(
                item.f_deliveryPrice ?? item.f_deliveryprice ?? 0
            );

            const matchCategory =
                !category || getFurnitureCategoryCode(item.f_catagory1) === category;


            const matchMinPrice =
                !min || price >= Number(min);

            const matchMaxPrice =
                !max || price <= Number(max);

            const matchDiscount =
                discount !== "Y" || Number(item.f_discount || 0) > 0;

            const matchFreeDelivery =
                freeDelivery !== "Y" || price >= 50000 || deliveryPrice === 0;

            return (
                matchCategory &&
                matchMinPrice &&
                matchMaxPrice &&
                matchDiscount &&
                matchFreeDelivery
            );
        });
    };

    const filterInteriorByOption = (list) => {
        return list.filter((item) => {
            const matchRegion =
                !interiorRegion || getInteriorRegion(item.c_addr) === interiorRegion;

            return matchRegion;
        });
    };


    //검색을 안하고 전체를 눌렀을때 가구의 목록을 ㄱㄴㄷ순으로 보여주는 함수
    const getAllFurniture = async () => {
        const firstResult = await FurnitureService.getFurniture({ pageNum: 1});
        const firstList = firstResult.list || [];
        const totalPage = firstResult.totalPage || 1;

        if (totalPage <= 1) return firstList;

        const restResults = await Promise.all(
            Array.from({ length: totalPage - 1 }, (_,index) => 
                FurnitureService.getFurniture({ pageNum: index + 2})
            )
        );
        return [
            ...firstList,
            ...restResults.flatMap((result) => result.list || []),
        ];
    };

    //가구 검색 페이지 , 기존에 있던 함수와 병합함.
    const getSearchFurniture = async () => {
        const allFurniture = await getAllFurniture();
        const word = keyword.trim().toLowerCase();

            if (!word) return allFurniture;

            return allFurniture.filter((item) => {
               const fields = [
                    item.f_name,
                    item.c_name,
                    item.f_catagory1,
                    getFurnitureCategoryTitle(item.f_catagory1),
                    item.f_catagory2,
                    getFurnitureCategoryTitle(item.f_catagory2),
                    item.f_catagory3,
                    getFurnitureCategoryTitle(item.f_catagory3),
                    item.f_catagory4,
                    getFurnitureCategoryTitle(item.f_catagory4),
                    item.f_catagory5,
                    getFurnitureCategoryTitle(item.f_catagory5),
                ];

            return fields.some((value) =>
                String(value || "").toLowerCase().includes(word)
            );
        });
    };



    //실제로 검색기능을 하는 함수, 전체 검색시 탭에 있는 항목을 다 검색후에 합치는 방식
    const getSearchResult = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const trimmedKeyword = keyword.trim();
            // 디비에서 불러와서 카테고리 만드는것, 검색어가 없어도 필터 검색을 해야해서 return 하면 안된다.
            if (!trimmedKeyword && type !== "all" && type !== "furniture" && type !== "interior") {
                setResults({ furniture: [], interior: [] });
                return;
            }   

            //타입별로 다시 잘 나눠준다, 이전에는 중복으로 가져왔는데 바꿈
            const needFurniture = type === "all" || type === "furniture";
            const needInterior = type === "all" || type === "interior";

            const [furnitureData, interiorData ] = await Promise.all([
                needFurniture 
                    ? trimmedKeyword 
                        ? getSearchFurniture() : getAllFurniture() 
                : Promise.resolve([]),

                needInterior
                    ? InteriorService.fetchList()
                    :Promise.resolve([]),
            ]);

            const sortedFurnitureList = sortByKorean(
                furnitureData || [],
                    (item) => item.f_name
                );
            const rawInteriorList = filterByKeyword(
                Array.isArray(interiorData) ? interiorData : [],
                ["c_name", "c_addr", "c_tel", "c_info", "c_boss"]
            );
            
                setFilterOptions({
                    furnitureCategories: makeFurnitureCategories(sortedFurnitureList),
                    interiorRegions: makeInteriorRegions(rawInteriorList),
                });

            const furnitureList = filterFurnitureByOption(sortedFurnitureList);
            //getSearchResult 안에 이미지 넣기
           

            const interiorList = sortByKorean(
                filterInteriorByOption(rawInteriorList),
                (item) => item.c_name
            );


            setResults({
                furniture: type === "interior" || type === "freeBoard" ? [] : furnitureList,
                interior: type === "furniture" || type === "freeBoard" ? [] : interiorList,

            });
        } catch (error) {
            console.error(" 통합 검색 실패:", error);
            console.log(error);
            setErrorMessage("검색결과를 불러오지 못했습니다.");
            setResults({ furniture: [], interior:[], freeBoard:[]});           
        }finally{
            setLoading(false);
        }
    };


    //검색 버튼과 enter쳐서 검색하는것, 실시간으로 자료를 보여줘도 검색 버튼이나 엔터는 즉시 검색을 위해 냅둠
    const onSearch = (evt) => {
        evt.preventDefault();

        const nextKeyword = inputKeyword.trim();

        setSearchParams({ 
            keyword: nextKeyword,
            type,
            page: 1,
        });
    };

    const selectedList =
        type === "furniture"
        ? results.furniture
        : type === "interior"
        ? results.interior
        : [];
        
    
    //페이징 처리 이제 개별로 나뉜다.
    const totalPages = Math.ceil(selectedList.length / itemsPerPage);
    const currentItems = selectedList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const isEmptyKeywordCategory =
            !keyword.trim() && type !== "all" && type !== "furniture" && type !== "interior";


    //페이지 이동시 필터 값 유지하는 함수
    const movePage = (nextPage) => {
        const params = {
            keyword: keyword.trim(),
            type,
            page: nextPage,
            category,
            priceRange,
            discount,
            freeDelivery,
            interiorRegion,
            housingType,
            areaSize,
            purpose,
            spaces,
            budget,
        };

        Object.keys(params).forEach((key) => {
            if (!params[key]) {
                delete params[key];
            }
        });

            setSearchParams(params);
    };

    //필터 변경 함수 추가 (밑으로 쭉)
    const furnitureFilterValue = {
        category,
        priceRange,
        discount,
        freeDelivery,
    };

    const interiorFilterValue = {
        interiorRegion,
        housingType,
        areaSize,
        purpose,
        spaces,
        budget,
    };

    const updateFilter = (nextFilter) => {
        const params = {
            keyword: keyword.trim(),
            type,
            page: 1,
            category,
            priceRange,
            discount,
            freeDelivery,
            interiorRegion,
            housingType,
            areaSize,
            purpose,
            spaces,
            budget,
            ...nextFilter,
        };

        Object.keys(params).forEach((key) => {
            if (!params[key]) {
                delete params[key];
            }
        });

        setSearchParams(params);
    };

    //검색시 카드에 적힌 정보와 쇼핑리스트와 같아보이게 
    const renderFurnitureItem = (item) => {
        const thumbnail =
            item.imageList?.find((img) => img.img_tag === "THUMBNAIL") ||
            item.imageList?.[0];

        const thumbnailSrc = thumbnail
            ? `/api/images/FURNITURE/${thumbnail.img_name}`
            : "/no-image.png";
        const productDeliveryPrice = Number(
            item.f_deliveryPrice ?? item.f_deliveryprice ?? 0
        );

        const deliveryPrice =
            Number(item.f_dprice || 0) >= 50000
                ? 0
                : productDeliveryPrice;

        const discountRate = Number(item.f_discount || 0);

        const hasDiscount =
            Number(item.f_price || 0) > Number(item.f_dprice || 0);
    return(
        <Card
            key={item.f_code}
            variant="outlined"
            sx={{ 
                width: 180,
                height: "100%" 
            }}
        >
            <CardActionArea
                component={Link}
                to={`/furniture/article/${item.f_code}`}
                sx={{ height: "100%" }}
            >
                <CardMedia
                    component="img"
                    height="110"
                    image={thumbnailSrc}
                    alt={item.f_name}
                    sx={{ objectFit: "cover" }}
                />

                <CardContent sx={{ p: 1}}>
                    <p style={{ margin: "0 0 6px", color: "#666", fontSize: "12px" }}>
                        {item.c_name || "업체"}
                    </p>

                    <h3 style={{ margin: "0 0 6px", fontSize: "14px" }}>
                        {item.f_name}
                    </h3>


                    {hasDiscount && (
                        <p  
                            style={{
                                margin: "0 0 2px",
                                fontSize: "15px",
                                color: "#aaa",
                                textDecoration: "line-through",
                            }}
                        >
                            {Number(item.f_price || 0).toLocaleString()}원
                        </p>
                    )}

                    <div style={{ display: "flex", gap: "4px", alignItems: "baseline"}}>
                        
                        <strong>
                            {Number(item.f_dprice || 0).toLocaleString()}원
                        </strong>
                    </div>

                    <Stack direction="row" spacing={1} mt={1}>
                        {deliveryPrice === 0 ? (
                            <Chip
                                size="small"
                                color="primary"
                                variant="outlined"
                                label="무료배송"
                            />
                        ) : (
                            <Chip
                                size="small"
                                variant="outlined"
                                label={`배송비 ${deliveryPrice.toLocaleString()}원`}
                            />
                        )}

                        {discountRate > 0 && (
                            <Chip
                                size="small"
                                color="error"
                                label={`할인 ${discountRate}%`}
                            />
                        )}
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};
    const renderInteriorItem = (item) => {
        const region = getInteriorRegion(item.c_addr);

        return (
            <Card
                key={`${item.c_id}-${item.c_kind}-${item.c_name}`}
                variant="outlined"
                sx={{
                    width: 180,
                    height: "100%",
                }}
            >
                <CardActionArea
                    component={Link}
                    to="/interior/article"
                    state={{ company: item }}
                    sx={{ height: "100%" }}
                >
                    <div
                        style={{
                            height: "86px",
                            backgroundColor: "#f3efe7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#2f5f53",
                            fontWeight: 800,
                            fontSize: "18px",
                        }}
                    >
                        {item.c_name?.slice(0, 2) || "업체"}
                    </div>

                    <CardContent sx={{ p: 1 }}>
                        <p style={{ margin: "0 0 6px", color: "#666", fontSize: "12px" }}>
                            {item.c_kind === "interior" ? "인테리어" : item.c_kind}
                        </p>

                        <h3
                            style={{
                                margin: "0 0 8px",
                                fontSize: "14px",
                                lineHeight: 1.35,
                                minHeight: "38px",
                            }}
                        >
                            {item.c_name}
                        </h3>

                        <Stack direction="row" spacing={1} mb={1}>
                            {region && (
                                <Chip
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    label={region}
                                />
                            )}
                        </Stack>

                        <p
                            style={{
                                margin: "0 0 6px",
                                fontSize: "12px",
                                color: "#555",
                                lineHeight: 1.35,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {item.c_addr || "주소 정보 없음"}
                        </p>

                        <p style={{ margin: 0, fontSize: "12px", color: "#777" }}>
                            {item.c_tel || "전화번호 미등록"}
                        </p>
                    </CardContent>
                </CardActionArea>
            </Card>
        );
    };

    const SearchSection = ({sectionKey, title, list, renderItem}) => {
        const startIndex = carouselIndex[sectionKey] || 0;
        const visibleList = list.slice(startIndex, startIndex + carouselPageSize);

        const isFirst = startIndex === 0;
        const isLast = startIndex + carouselPageSize >= list.length;
        
        return(
            <section>
                <h3>{title}</h3>

                {list.length > 0 ? (
                    <div
                        style={{
                            position: "relative",
                            width: "fit-content",
                            maxWidth: "100%",
                            margin: "0 auto",
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${carouselPageSize}, 180px)`,
                                gap: "16px",
                            }}
                        >
                            {visibleList.map(renderItem)}
                        </div>

                        {!isFirst && (
                            <Button
                                type="button"
                                variant="contained"
                                onClick={() => moveCarousel(sectionKey, list.length, "prev")}
                                sx={{
                                    position: "absolute",
                                    left: "-22px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    minWidth: "44px",
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "50%",
                                    backgroundColor: "#fff",
                                    color: "#333",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                                    "&:hover": {
                                        backgroundColor: "#f5f5f5",
                                    },
                                }}
                            >
                                {"<"}
                            </Button>
                        )}
                        {!isLast && (
                            <Button
                                type="button"
                                variant="contained"
                                onClick={() => moveCarousel(sectionKey, list.length, "next")}
                                sx={{
                                    position: "absolute",
                                    right: "-22px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    minWidth: "44px",
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "50%",
                                    backgroundColor: "#fff",
                                    color: "#333",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                                    "&:hover": {
                                        backgroundColor: "#f5f5f5",
                                    },
                                }}
                            >
                                {">"}
                            </Button>
                        )}
                    </div>
                ) : (
                    <p>검색 결과가 없습니다.</p>
                )}
            </section>
        );
    };
    return (
        <div>
            {/* 상단 검색창 + 탭*/}
            <section>

                {/* 검색 카테고리 탭 */}
                <div style={{marginTop: "10px"}}>
                    <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mt: 2, borderBottom: "1px solid #eee" }}
                    >
                    {searchTabs.map((tab) => {
                        const active = type === tab.value;

                        return (
                            <Button
                                key={tab.value}
                                type="button"
                                variant="text"
                                onClick={() => onClickTab(tab.value)}
                                sx={{
                                    borderRadius: 0,
                                    borderBottom: active ? "2px solid #1976d2" : "2px solid transparent",
                                    color: active ? "#1976d2" : "#333",
                                    fontWeight: active ? 800 : 500,
                                }}
                            >
                                {tab.title}
                            </Button>
                        );
                    })}
                </Stack>
                </div>
                    {/* 가구 필터 UI */}
                    {type === "furniture" && (
                        <div style={{ marginTop: "12px" }}>
                            <MultiFilterBar
                                groups={furnitureFilterGroups}
                                selectedValues={furnitureFilterValue}
                                onChange={updateFilter}
                                onReset={() =>
                                    updateFilter({
                                        category: "",
                                        priceRange: "",
                                        discount: "",
                                        freeDelivery: "",
                                    })
                                }
                            />
                        </div>
                    )}

                    {type === "interior" && (
                        <div style={{ marginTop: "12px" }}>
                            <MultiFilterBar
                                groups={interiorFilterGroups}
                                selectedValues={interiorFilterValue}
                                onChange={updateFilter}
                                onReset={() =>
                                    updateFilter({
                                        interiorRegion: "",
                                        housingType: "",
                                        areaSize: "",
                                        purpose: "",
                                        spaces: "",
                                        budget: "",
                                    })
                                }
                            />
                        </div>
                    )}

            </section>
            
            <section>
                {/* 상태 메세지 */}
                {loading && <p>검색 중입니다...</p>}
                {errorMessage && <p>{errorMessage}</p>}

                {isEmptyKeywordCategory && !loading && (
                    <p>검색 결과가 없습니다</p>
                )}
                {/* 개별 탭 렌더 조건 */}
                {!loading && !isEmptyKeywordCategory && type === "all" && (
                    <>
                        <SearchSection
                            sectionKey="furniture"
                            title={keyword ? `'${keyword}'이 포함된 쇼핑 결과` : "쇼핑 결과 '가나다' 순"}
                            list={results.furniture}
                            renderItem={renderFurnitureItem}
                        />
                        <SearchSection
                            sectionKey="interior"
                            title={keyword ? `'${keyword}'이 포함된 인테리어 결과` : "인테리어 결과 '가나다' 순"}
                            list={results.interior}
                            renderItem={renderInteriorItem}
                        />
                    </>
                )}
                {!loading && !isEmptyKeywordCategory && type !== "all" && (
                    <>
                        {currentItems.length === 0 ? (
                            <p>검색 결과가 없습니다</p>
                        ) : (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, 180px)",
                                    justifyContent: "start",
                                    gap: "16px",
                                }}
                            >
                                {type === "furniture" && currentItems.map(renderFurnitureItem)}
                                {type === "interior" && currentItems.map(renderInteriorItem)}
                                
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* 검색 결과 목록, 페이징 처리 페이징 버튼 추가*/}
            {type !== "all" && !isEmptyKeywordCategory && totalPages > 1 && (
                <section style={{ marginTop: "24px", textAlign: "center"}}>
                    <Button
                        type="button"
                        variant="contained"
                        onClick={() => movePage(Math.max(1, page - 1))}
                        disabled={page === 1}
                    >
                        이전
                    </Button>

                    <span style={{margin: "0 12px", fontWeight: 600}}>
                        {page} /{totalPages}
                    </span>

                    <Button
                        type="button"
                        variant="contained"
                        onClick={() => movePage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                    >
                        다음
                    </Button>
            </section>
        )}
    </div>
    );
};

export default SearchPage;
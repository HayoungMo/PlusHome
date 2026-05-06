import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FurnitureService from '../service/furnitureService';

const SearchPage = () => {

    // 쿼리스트링을 사용한다. 그 값을 가져올 수 있는 hook으로는 useLacation(현재의 Location 객체 반환), useSearchParams 두개가 있다.
    const [searchParams, setSearchParams] =useSearchParams();

    //사용자가 입력한 검색어, 주소창에서 keyword라는 이름의 값
    const keyword = searchParams.get("keyword") || "";

    //화면 상태 관리
    const [inputKeyword, setInputKeyword] = useState(keyword);
    const [searchType, setSearchType] = useState("all");
    const [furnitureList, setFurnitureList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    //페이징 처리
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; //한페이지에 6개씩

    //검색 탭 목록 - 탭으로 쓸지 아니면 다른 방식으로 할지는 고민
    const searchTabs = [
        { value: "all", title: "전체"},
        { value: "f_name", title: "가구명"},
        { value: "f_catagory1", title: "카테고리"},
        { value: "c_name", title: "업체명"},
    ];

    //주소창의 keyword가 바뀔때마다 자동으로 검색 실행...을 굳이? 일단 넣어
    //뒤로가기 해서 주소가 바뀌면 이 useEffect를 실행하고 결과를 복구한다.
    useEffect(()=>{
        setInputKeyword(keyword);
        setCurrentPage(1);
    },[keyword]);
    
    //실시간으로 검색한걸 보여주는 업데이트 창
    useEffect(()=>{
        
        if(inputKeyword === keyword) return;

        const timer = setTimeout(() => {
            setSearchParams({keyword: inputKeyword});
        }, 300); //300ms 후에 주소창 한 번 업데이트     

        return () => clearTimeout(timer);
    },[inputKeyword, setSearchParams, keyword]);

    //keyword 또는 검색 탭이 바뀌면 DB 검색 실행함
    useEffect(()=>{
        if(!keyword){
            setFurnitureList([]);
            setCurrentPage(1);
            return;
        }

        getSearchResult();
    },[keyword,searchType]);

    //실제로 검색기능을 하는 함수, 전체 검색시 탭에 있는 항목을 다 검색후에 합치는 방식
    const getSearchResult = async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            setCurrentPage(1);

            //전체 검색 파트
            if(searchType === "all") {
                const [nameResult, categoryResult, companyResult] = await Promise.all([
                    FurnitureService.getFurniture({
                        pageNum: 1,
                        searchKey: "f_name",
                        searchValue: keyword
                    }),
                    FurnitureService.getFurniture({
                        pageNum: 1,
                        searchKey: "f_catagory1",
                        searchValue: keyword
                    }),
                    FurnitureService.getFurniture({
                        pageNum: 1,
                        searchKey: "c_name",
                        searchValue: keyword
                    }),
                ]);
                //API 응답 객체 안의 list만 꺼내준다
                const nameList = nameResult.list || [];
                const categoryList = categoryResult.list || [];
                const companyList = companyResult.list || [];

                //같은 가구가 여러 검색 조건에 걸릴 수 있기 때문에 f_code 기준으로 중복을 제거해줌
                const resultMap = new Map();

                [...nameResult, ...categoryResult,...companyResult].forEach((item)=>{
                    resultMap.set(item.f_code, item);
                });

                setFurnitureList(Array.from(resultMap.values()));
            }else{
                //탭 검색: searchKey 기준으로 검색
                const result = await FurnitureService.getFurniture({
                    pageNum: 1,
                    searchKey: searchType,
                    searchValue: keyword
                });
                setFurnitureList(result.list || []);
            }
        } catch (error) {
            console.error("검색 실패:", error);
            console.log(error);
            setErrorMessage("검색결과를 불러오지 못했습니다.");
            setFurnitureList([]);           
        }finally{
            setLoading(false);
        }
    };


    //검색 버튼과 enter쳐서 검색하는것, 실시간으로 자료를 보여줘도 검색 버튼이나 엔터는 즉시 검색을 위해 냅둠
    const onSearch = (evt) => {
        evt.preventDefault();

        const nextKeyword = inputKeyword.trim();

        if(!nextKeyword){
            alert("검색어를 입력해주세요");
            return;
        }
        
        setSearchParams({ keyword: nextKeyword });
    };

    //페이징 처리 , furnitureList가 준비 된후에 작업을 실시한다.
    const totalPages = Math.ceil(furnitureList.length / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = furnitureList.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div>
            {/* 상단 */}
            <Link to="/">로고</Link>
            <h2>통합 검색</h2>
            
            {/* 검색창 */}
            <form onSubmit={onSearch}>
                <input
                    placeholder="검색어를 입력하세요"
                    value={inputKeyword}
                    onChange={(evt) => setInputKeyword(evt.target.value)}
                />
                <button type="submit">검색</button>
            </form>

            {/* 검색 결과 출력 화면 */}
            {keyword && (
                <h3>"{keyword}" 검색 결과</h3>
            )}

            {/* 검색 카테고리 탭 */}
            <div>
                {searchTabs.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => setSearchType(tab.value)}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>

            <hr/>

            {/* 상태 메세지 */}
            {loading && <p>검색 중입니다...</p>}

            {errorMessage && <p>{errorMessage}</p>}

            {!loading && keyword && furnitureList.length === 0 && (
                <p>검색 결과가 없습니다</p>
            )}

            {/* 검색 결과 목록, 페이징 처리해서 6개씩 */}
            <div>
                {currentItems.map((item) => (
                    <Link
                        to={`/furniture/article/${item.f_code}`}
                        key={item.f_code}
                    >
                        <div>
                            <p>{item.c_name}</p>
                            <h3>{item.f_name}</h3>
                            <p>카테고리: {item.f_catagory1}</p>
                            <p>
                                {item.f_discount > 0 && (
                                    <span>할인 {item.f_discount}% </span>
                                )}
                                {item.f_dprice.toLocaleString()}원
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* 페이징 버튼 추가~ */}
            {totalPages > 1 && (
                <div>
                    <button
                        type="button"
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        disabled={currentPage === 1}
                    >
                        이전
                    </button>

                    {Array.from({ length: totalPages }, (_,index) => index + 1).map((page)=>(
                        <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            style={{
                                fontWeight: currentPage === page ? "bold" : "normal"
                            }}
                            >
                                {page}
                            </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                        disabled={currentPage === totalPages}
                    >
                        다음
                    </button>

                </div>
            )}
        </div>
    );
};

export default SearchPage;
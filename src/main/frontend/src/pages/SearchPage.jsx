import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FurnitureService from '../service/furnitureService';
import InteriorService from '../service/interiorService';
import FreeBoardService from '../service/freeBoardService';

const SearchPage = () => {

    // 쿼리스트링을 사용한다. 그 값을 가져올 수 있는 hook으로는 useLacation(현재의 Location 객체 반환), useSearchParams 두개가 있다.
    const [searchParams, setSearchParams] =useSearchParams();

    //사용자가 입력한 검색어, 주소창에서 keyword라는 이름의 값
    const keyword = searchParams.get("keyword") || "";
    const type = searchParams.get("type") || "all";
    const page = Number(searchParams.get("page")|| 1 );
    
    //화면 상태 관리
    const [inputKeyword, setInputKeyword] = useState(keyword);

    const [results, setResults] = useState({
        furniture:[],
        interior:[],
        freeBoard:[],
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    
    //페이징 처리
    //const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; //한페이지에 9개씩
    const previewCount = 3;

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
        { value: "freeBoard", title: "자유게시판"},
    ];

    //주소창의 keyword가 바뀔때마다 자동으로 검색 실행...을 굳이? 일단 넣어
    //뒤로가기 해서 주소가 바뀌면 이 useEffect를 실행하고 결과를 복구한다.
    useEffect(()=>{
        setInputKeyword(keyword);
    },[keyword]);
    
    //실시간으로 검색한걸 보여주는 업데이트 창
    useEffect(()=>{
        
        if(inputKeyword === keyword) return;

        const timer = setTimeout(() => {
            const nextKeyword = inputKeyword.trim();

            if(!nextKeyword){
                setSearchParams({});
                return;
            }
            setSearchParams({keyword: inputKeyword});
        }, 300); //300ms 후에 주소창 한 번 업데이트     

        return () => clearTimeout(timer);
    },[inputKeyword, setSearchParams, keyword]);

    //keyword 또는 검색 탭이 바뀌면 DB 검색 실행함
    useEffect(()=>{
        getSearchResult();
    },[keyword,type]);


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

    //가구 검색 페이지
    const getSearchFurniture = async () => {
        if (!keyword.trim()) return[];

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
            //같은 가구가 여러 검색 조건에 걸릴 수 있기 때문에 f_code 기준으로 중복을 제거해줌
            const resultMap = new Map();

            [
                //API 응답 객체 안의 list만 꺼내준다
                ...(nameResult.list || []),
                ...(categoryResult.list || []),
                ...(companyResult.list || []),
            ].forEach((item)=>{
                resultMap.set(item.f_code, item);
            });

            return Array.from(resultMap.values());
    };
    //자유게시판은 기존의 서비스를 사용함
    const getFreeBoardList = async () => {
        const data = await FreeBoardService.getLists({
            pageNum: 1,
            searchKey: "title",
            searchValue: keyword.trim(),
            category:"",
        });
        return data.lists || [];
    };

    //실제로 검색기능을 하는 함수, 전체 검색시 탭에 있는 항목을 다 검색후에 합치는 방식
    const getSearchResult = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const trimmedKeyword = keyword.trim();

            if (!trimmedKeyword && type !== "all"){
                setResults({ furniture: [], interior:[], freeBoard:[]});
                return;
            }

            const [furnitureData, interiorData, freeBoardData] = await Promise.all([
                trimmedKeyword ? getSearchFurniture() : getAllFurniture(),
                InteriorService.fetchList(),
                type === "interior" && !trimmedKeyword
                    ? Promise.resolve([])
                    : getFreeBoardList(),
            ]);

            const furnitureList = sortByKorean(furnitureData || [], (item)=> item.f_name);

            const interiorList = sortByKorean(
                filterByKeyword(Array.isArray(interiorData) ? interiorData : [], [
                    "c_name",
                    "c_addr",
                    "c_tel",
                ]),
                (item) => item.c_name
            )

            const freeBoardList = sortByKorean(freeBoardData || [], (item) => item.title);

            setResults({
                furniture: type === "interior" || type === "freeBoard" ? [] : furnitureList,
                interior: type === "furniture" || type === "freeBoard" ? [] : furnitureList,
                freeBoard: type === "furniture" || type === "interior" ? [] : furnitureList,
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

        if(!nextKeyword){
            alert("검색어를 입력해주세요");
            return;
        }

        setSearchParams({ 
            keyword: inputKeyword.trim(),
            type,
            page: 1,
        });
    };

    //페이징 처리 이제 개별로 나뉜다.
    const selectedList = useState(() => {
        if (type === "furniture") return results.furniture;
        if (type === "interior") return results.interior;
        if (type === "freeboard") return results.freeBoard;
        return [];
    }, [type, results]);


    const totalPages = Math.ceil(selectedList.length / itemsPerPage);
    const currentItems = selectedList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const isEmptyKeywordCategory = !keyword.trim() && type !== "all";

    const movePage = (nextPage) => {
        setSearchParams({
            keyword: keyword.trim(),
            type,
            page: nextPage,
        });
    };

    const renderFurnitureItem = (item) => (
        <Link 
            to={`/furniture/article/${item.f_code}`}
            key={item.f_code}
        >
            <div>
                <p>{item.c_name}</p>
                <h3>{item.f_name}</h3>
                <p>카테고리: {item.f_catagory1}</p>
                <p>{Number(item.f_dprice || 0).toLocaleString}원</p>
            </div>
        </Link>
    );
    const renderInteriorItem = (item) => (
        <Link 
            to="/interior/article"
            state={{company: item}}
            key={`${item.f_code}-${item.c_name}-${item.c_kind}`}
        >
            <div>
                <p>{item.c_kind}</p>
                <h3>{item.c_name}</h3>
                <p>{item.c_addr}</p>
                <p>{item.c_tel}</p>
            </div>
        </Link>
    );
    const renderFreeBoardItem = (item) => (
        <Link 
            to={`/freeBoard/article/${item.boardId}`} 
            key={item.boardId}
        >
            <div>
                <p>{item.category || "자유"}</p>
                <h3>{item.title}</h3>
                <p>{item.userName || "방문자"}</p>
            </div>
        </Link>
    );

    const SearchSection = ({title, list, renderItem}) => (
        <section>
            <h3>{title}</h3>

            {list.length > 0 ? (
                <div>
                    {list.slice(0,previewCount).map(renderItem)}
                </div>
            ) : (
                <p>검색 결과가 없습니다.</p>
            )}
        </section>
    )

    return (
        <div>
            {/* 상단 검색창 + 탭*/}
            <section>
                <h2>통합 검색</h2>
                
                {/* 검색창 */}
                <form onSubmit={onSearch}>
                    <input
                        placeholder="검색어를 입력해주세요"
                        value={inputKeyword}
                        onChange={(evt) => setInputKeyword(evt.target.value)}
                    />
                    <button type="submit">검색</button>
                </form>

                {/* 검색 카테고리 탭 */}
                <div>
                    {searchTabs.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => onClickTab(tab.value)}
                            style={{fontWeight: type === tab.value ? "bold" : "normal" ,}}
                        >
                            {tab.title}
                        </button>
                    ))}
                </div>
            </section>
            
            <section>
                {/* 상태 메세지 */}
                {loading && <p>검색 중입니다...</p>}
                {errorMessage && <p>{errorMessage}</p>}

                {isEmptyKeywordCategory && !loading && (
                    <p>검색 결과가 없습니다</p>
                )}
                {!loading && !isEmptyKeywordCategory && type === "all" && (
                    <>
                        <SearchSection
                            title={keyword ? `'${keyword}'이 포함된 쇼핑 결과` : "쇼핑 결과 ㄱㄴㄷ 순"}
                            list={results.furniture}
                            renderItem={renderFurnitureItem}
                        />
                        <SearchSection
                            title={keyword ? `'${keyword}'이 포함된 인테리어 결과` : "인테리어 결과 ㄱㄴㄷ 순"}
                            list={results.interior}
                            renderItem={renderInteriorItem}
                        />
                        <SearchSection
                            title={keyword ? `'${keyword}'이 포함된 자유게시판 결과` : "자유게시판 결과 ㄱㄴㄷ 순"}
                            list={results.freeBoard}
                            renderItem={renderFreeBoardItem}
                        />
                    </>
                )}
                {!loading && !isEmptyKeywordCategory && type === "all" && (
                    <>
                        {currentItems.length === 0 ? (
                            <p>검색 결과가 없습니다</p>
                        ) : (
                            <div>
                                {type === "furniture" && currentItems.map(renderFurnitureItem)}
                                {type === "interior" && currentItems.map(renderInteriorItem)}
                                {type === "freeBoard" && currentItems.map(renderFreeBoardItem)}
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* 검색 결과 목록, 페이징 처리 페이징 버튼 추가*/}
            {type !== "all" && !isEmptyKeywordCategory && totalPages > 1 && (
                <section>
                    <button
                        type="button"
                        onClick={() => movePage(Math.max(1, page - 1))}
                        disabled={page === 1}
                    >
                        이전
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                        key={pageNumber}
                        type="button"
                        onClick={() => movePage(pageNumber)}
                        style={{
                            fontWeight: page === pageNumber ? "bold" : "normal",
                        }}
                    >
                        {pageNumber}
                    </button>
                ))}

                    <button
                        type="button"
                        onClick={() => movePage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                    >
                        다음
                    </button>
            </section>
        )}
    </div>
    );
};

export default SearchPage;
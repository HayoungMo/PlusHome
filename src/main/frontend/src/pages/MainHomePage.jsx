import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import BedIcon from "@mui/icons-material/Bed";
import WeekendIcon from "@mui/icons-material/Weekend";
import DeskIcon from "@mui/icons-material/Desk";
import ChairIcon from "@mui/icons-material/Chair";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import InteriorService from '../service/interiorService';
import CheckboxMui from '../components/CheckboxMui';
import SnackbarAlert from '../components/SnackbarAlert';
import EventPopup from './EventPopup';
import DialogMui from "../components/DialogMui";
import MainEventBanner from '../components/MainEventBanner';
import { Category } from '@mui/icons-material';

const MainHomePage = ({ loginUser }) => {

    // 가구 리스트 상태 , 처음에는 빈배열
    const [furniture, setFurniture] = useState([]);
    const [interiorCompanies, setInteriorCompanies] = useState([]);    

    //로그인 알고릐즘에 대해서
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");

    //이렇게 하면 loginUser가 문자열과 상관없이 localStorage의 user객체를 사용한다.
    const currentUser = 
        loginUser && typeof loginUser === "object"
            ? loginUser
            : savedUser; 
    //메인화면 아이콘 넣기
    const categoryMenus = [
    { title: "침대", icon: <BedIcon /> },
    { title: "소파", icon: <WeekendIcon /> },
    { title: "책상", icon: <DeskIcon /> },
    { title: "의자", icon: <ChairIcon /> },
    { title: "수납", icon: <Inventory2Icon /> },
    { title: "조명", icon: <LightbulbIcon /> },
];

    const [hideMode, setHideMode] = useState(false);
    const [hiddenFurnitureCodes, setHiddenFurnitureCodes] = useState([]);
    //숨김 직전 관련해서 준비해둠
    const [pendingHiddenFurnitureCodes, setPendingHiddenFurnitureCodes] = useState([]);

    //snackbar 사용
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info",
    });
    //다이얼로그
    const [hideConfirmOpen, setHideConfirmOpen] = useState(false);

    const showSnackbar = (message, severity = "info") => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({
            ...prev,
            open: false,
        }));
    };

    //백엔드 호출 (가구, 인테리어 업체) , 0519 백엔드 수정한것으로 새롭게 연결
    const getBestFurniture = () => {
        axios.get("http://localhost:8080/api/main/best", {
            params: {
                id: currentUser?.id || "",
            },
        })
        .then((res) => {
            setFurniture(Array.isArray(res.data) ? res.data : []);
        })
        .catch((err) => {
            console.error("추천 가구 조회 실패:", err);
        });
    };
    
    useEffect(() => {
        getBestFurniture();
    },[currentUser?.id]);
    
    useEffect(() => {
        InteriorService.fetchList()
            .then((data) => {
                setInteriorCompanies(Array.isArray(data) ? data.slice(0,4) : []);
            })
            .catch((err) => {
                console.error("인테리어 업체 조회 실패:", err);
            });
    },[]);

    //숨김 목록 관련 동작
    useEffect(() => {
        if(!currentUser?.id) return;
        
        axios.get("http://localhost:8080/api/main/recommend/hidden", {
            params: {
                id: currentUser?.id ,
            },
        })
        .then((res) => {
            const hiddenList = Array.isArray(res.data) ? res.data : [];
            setHiddenFurnitureCodes(hiddenList);
            setPendingHiddenFurnitureCodes(hiddenList);
        })
        .catch((err) => {
            console.error("숨김 목록 조회 실패:",err);
        });

    },[currentUser?.id]);
    
    //숨김 목록 관련 함수
    const togglePendingHiddenFurniture = (f_code) => {
        if (!currentUser?.id) {
            showSnackbar("로그인 후 이용할 수 있습니다.");
            return;
        }

        setPendingHiddenFurnitureCodes((prev) =>
            prev.includes(f_code)
                ? prev.filter((code) => code !== f_code)
                : [...prev, f_code]
        );
    };

    //아무것도 선택하지 않고 숨겼을때~
    const isSameHiddenList = (listA, listB) => {
        if (listA.length !== listB.length) return false;    

        return listA.every((code) => listB.includes(code));
    };

    //토글버튼 대신 일반 버튼으로 변경
    //추천 숨김 관리 on
    const onHideStart = () => {
        setPendingHiddenFurnitureCodes(hiddenFurnitureCodes);
        setHideMode(true);
    };

    //숨김 취소를 버튼으로 바꿈: 사용자가 체크했던 변경사항을 버리고, 원래 저장된 숨김 목록으로 되돌리는 역할
    const onHideCancel = () => {
        setPendingHiddenFurnitureCodes(hiddenFurnitureCodes);
        setHideMode(false);
        showSnackbar("추천 숨김 관리를 취소했습니다.", "info")
    };

    //완료 버튼 클릭 시 확인 dialog 열기
    const onHideComplete = () => {
        if(isSameHiddenList(pendingHiddenFurnitureCodes, hiddenFurnitureCodes)){
            showSnackbar("변경된 숨김 설정이 없습니다.","info");
            return;
        }
        setHideConfirmOpen(true);
    };

    //실제로 저장되는 함수는 따로 뺐다. 다이얼로그를 써야해서!@!!!!
    const saveHiddenFurniture = () => {

        axios.post("http://localhost:8080/api/main/recommend/hide", {
            id: currentUser?.id,
            f_codes: pendingHiddenFurnitureCodes,
        })
        .then(() => {
            setHiddenFurnitureCodes(pendingHiddenFurnitureCodes);
            setHideMode(false);
            showSnackbar("추천 숨김 설정이 저장되었습니다.", "success");
            getBestFurniture();
        })
        .catch((err) => {
            console.error("추천 숨김 저장에 실패했습니다:", err);
            showSnackbar("숨김 처리에 실패했습니다.", "error");
        });
    };

    //알고리즘에 의한 추천을 사용자가 숨김함 그리고 그걸 제외한 목록을 보여줌
    const visibleFurniture = furniture.filter(
        (item) => !hiddenFurnitureCodes.includes(item.f_code)
    );

    

    return (
        <div>
            <EventPopup/>
            <SnackbarAlert
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={closeSnackbar}
            />
            <DialogMui
                open={hideConfirmOpen}
                onClose={() => setHideConfirmOpen(false)}
                title="추천 숨김 처리"
                text="선택한 가구를 추천 목록에서 숨김 처리하시겠습니까?"
                buttons={[
                    {
                        title: "취소",
                        color: "inherit",
                        variant: "text",
                        onClick: () => {
                            setHideConfirmOpen(false);
                            showSnackbar("숨김 처리를 취소했습니다.","info");
                        },
                    },
                    {
                        title: "확인",
                        color: "primary",
                        variant: "contained",
                        onClick: saveHiddenFurniture,
                    },
                ]}
                />
            {/* 메인 상단 영역 */}
                <section
                    style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 2.2fr) minmax(280px, 0.8fr)",
                        gap: "20px",
                        alignItems: "stretch",
                    }}
                >
                    <div
                        style={{
                            height: "360px",
                            overflow: "hidden",
                            borderRadius: "8px",
                            backgroundColor: "#f5f5f5",
                        }}
                    >
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            controls
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                            }}
                        >
                            <source src="/videos/main_video.mp4" type="video/mp4" />
                            사용 중인 브라우저에서 영상을 지원하지 않습니다.
                        </video>
                    </div>

                    <MainEventBanner/>
                </section>

            <section style={{ marginTop: "24px" }}>
                <div
                    style={{
                        display: "flex",
                        gap: "73px",
                        flexWrap: "wrap",
                        justifyContent: "center",
                    }}
                >
                    {categoryMenus.map((category) => (
                         <Link
                            key={category.title}
                            to={`/furniture/list?page=1&searchKey=f_catagory1&searchValue=${encodeURIComponent(category.title)}&sort=latest`}
                            style={{
                                width: "86px",
                                textAlign: "center",
                                textDecoration: "none",
                                color: "#222",
                            }}
                        >
                            <div
                                style={{
                                    width: "62px",
                                    height: "62px",
                                    margin: "0 auto 8px",
                                    borderRadius: "18px",
                                    backgroundColor: "#f5f1ea",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "rgba(0, 140, 255, 0.92)",
                                }}
                            >
                                {React.cloneElement(category.icon, { fontSize: "large" })}
                            </div>

                            <span style={{ fontSize: "14px", fontWeight: 600 }}>
                                {category.title}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        
            {/* 백에서 받아온 메세지 뿌리기 */}
            {/* 오늘의 추천 가구 목록 */}
            <section style={{ marginTop: "36px" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px"
                    }}
                >
                    <h2 style={{margin:0}}>
                        {currentUser ? "맞춤 추천 가구" : "오늘의 추천 가구"}
                    </h2>
                   <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        {currentUser?.id && !hideMode && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={onHideStart}
                            >
                                추천 숨김
                            </Button>
                        )}

                        {currentUser?.id && hideMode && (
                            <>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    size="small"
                                    onClick={onHideCancel}
                                >
                                    취소
                                </Button>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={onHideComplete}
                                >
                                    완료
                                </Button>
                            </>
                        )}

                        <Link to="/furniture/list">전체보기</Link>
                    </div>
                </div>
                
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                        gap: "16px"
                    }}
                >
                    {visibleFurniture.map((item) => {
                        const thumbnail = item.imageList?.find(
                            (img) => img.img_tag === "THUMBNAIL"
                        );
                        //추천가구 숨기기에서 링크 처리
                        const furnitureCard = (
                            <div
                                style={{
                                    minHeight: "150px",
                                    backgroundColor: "white",
                                    border: "1px solid #e5e1da",
                                    borderRadius: "8px",
                                    padding: "16px",
                                    boxSizing: "border-box"
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
                                        height: "160px",
                                        objectFit: "cover",
                                        marginBottom: "12px"
                                    }}
                                />
                                {hideMode && (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: "8px",
                                            fontSize: "14px",
                                        }}
                                        onClick={(evt) => {
                                            evt.stopPropagation();
                                        }}
                                    >
                                        <CheckboxMui
                                            name={`hide-${item.f_code}`}
                                            checked={pendingHiddenFurnitureCodes.includes(item.f_code)}
                                            onChange={(evt) => {
                                                evt.stopPropagation();
                                                togglePendingHiddenFurniture(item.f_code);
                                            }}
                                            width="40px"
                                        />
                                        <span>추천에서 숨기기</span>
                                    </div>
                                )}
                            <p style={{ margin: "0 0 8px", color: "#666" }}>
                                    {item.c_name}
                            </p>

                            <h3 style={{ margin: "0 0 12px" }}>
                                {item.f_name}
                            </h3>

                            <p style={{ margin: "0 0 8px" }}>
                                가격: {Number(item.f_dprice || item.f_dprice ||0).toLocaleString()}원
                            </p>

                            <p style={{ margin: 0 }}>
                                {item.f_discount > 0 && (
                                    <span>할인 {item.f_discount}% </span>
                                )}
                                배송비 {Number(item.f_deliveryPrice || 0).toLocaleString()}원
                            </p>
                            </div>
                        );
                        return hideMode ? (
                            <div 
                                key={item.f_code}
                                style={{
                                    color: "inherit",
                                    textDecoration: "none"
                                }}
                            >
                                {furnitureCard}
                            </div>
                        ) : (   
                            <Link 
                                to={`/furniture/article/${item.f_code}`} 
                                key={item.f_code}
                                style={{
                                    color: "inherit",
                                    textDecoration: "none"
                                }}
                            >
                                {furnitureCard}
                        </Link>
                        );
                    })}
                </div>
            </section>

            {/* 추천 상품/ 업체 추천/ 할인 -> 알고리즘용 */}
            <section style={{ marginTop: "36px" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px"
                    }}
                >
                    <h2 style={{ margin: 0 }}>추천 인테리어 업체</h2>
                    <Link to="/interior/list">전체보기</Link>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                        gap: "16px"
                    }}
                >
                    {interiorCompanies.map((company) => (
                        <Link
                            key={`${company.c_id}-${company.c_kind}-${company.c_name}`}
                            to="/interior/article"
                            state={{ company }}
                            style={{
                                color: "inherit",
                                textDecoration: "none"
                            }}
                        >
                            <div
                                style={{
                                    minHeight: "120px",
                                    backgroundColor: "white",
                                    border: "1px solid #e5e1da",
                                    borderRadius: "8px",
                                    padding: "16px",
                                    boxSizing: "border-box"
                                }}
                            >
                                <h3>{company.c_name}</h3>
                                <p>{company.c_kind}</p>
                                <p>{company.c_addr}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                
            </section>

            

            {/* 기존 footer 제거: 공통 Footer가 담당 */}
        </div>
    );
};





export default MainHomePage;
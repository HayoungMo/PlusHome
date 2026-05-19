import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChatbotModal from '../components/ChatbotModal';
import { Button } from '@mui/material';
import FloatingActionButtonMui from "../components/FloatingActionButtonMui";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import InteriorService from '../service/interiorService';
import CheckboxMui from '../components/CheckboxMui';
import SwitchMui from '../components/SwitchMui';

const MainHomePage = ({ loginUser }) => {

    // 가구 리스트 상태 , 처음에는 빈배열
    const [furniture, setFurniture] = useState([]);
    const [chatOpen, setChatOpen] = useState(false);
    const [interiorCompanies, setInteriorCompanies] = useState([]);

    //로그인 알고릐즘에 대해서
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentUser = loginUser || savedUser;

    const [hideMode, setHideMode] = useState(false);
    const [hiddenFurnitureCodes, setHiddenFurnitureCodes] = useState([]);
    //숨김 직전 관련해서 준비해둠
    const [pendingHiddenFurnitureCodes, setPendingHiddenFurnitureCodes] = useState([]);

    //백엔드 호출 (가구, 인테리어 업체)
    useEffect(() => {
        axios.get("http://localhost:8080/api/main/best")
             .then((res) =>{
                setFurniture(Array.isArray(res.data) ? res.data : []);
             })
            .catch((err) => {
                console.error("추천 가구 조회 실패했습니다:",err);
            });
        },[]);
    
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
        
        const savedHidden = JSON.parse(
            localStorage.getItem(`hiddenFurniture_${currentUser.id}`) || "[]"
        );

        setHiddenFurnitureCodes(savedHidden);
        setPendingHiddenFurnitureCodes(savedHidden);
    },[currentUser?.id]);
    
    //숨김 목록 관련 함수
    const togglePendingHiddenFurniture = (f_code) => {
        if (!currentUser?.id) {
            alert("로그인 후 이용할 수 있습니다.");
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

    const onHideModeChange = (evt) => {
        const checked = evt.target.checked;

        //토글 ON
        if (checked) {
            setPendingHiddenFurnitureCodes(hiddenFurnitureCodes);
            setHideMode(true);
            return;
        }

        //토글 OFF인데 아무것도 선택하지 않았을 때
        if (isSameHiddenList(pendingHiddenFurnitureCodes, hiddenFurnitureCodes)) {
            setHideMode(false);
            return;
        }
        //토글 OFF
        const isConfirm = window.confirm("선택한 가구를 추천 목록에서 숨김 처리하시겠습니까?");

            if (!isConfirm) {
                return;
            }

        setHiddenFurnitureCodes(pendingHiddenFurnitureCodes);

        localStorage.setItem(
            `hiddenFurniture_${currentUser.id}`,
            JSON.stringify(pendingHiddenFurnitureCodes)
        );

        setHideMode(false);
    };

    //알고리즘에 의한 추천을 사용자가 숨김함 그리고 그걸 제외한 목록을 보여줌
    const visibleFurniture = hideMode
        ? furniture
        : furniture.filter((item) => !hiddenFurnitureCodes.includes(item.f_code));

    return (
        <div>
            
            {/* 메인 영상 */}
            <section>
                <video 
                    autoPlay
                    muted
                    // loop -> 영상 무한재생 이후 가구 영상 올리면 재개
                    playsInline
                    controls
                    style={{
                      width: "100%",
                      height: "360px",
                      objectFit: "cover",
                      display: "block"  
                    }}
                    >
                        <source src="/videos/main_video.mp4" type="video/mp4" />
                        사용 중인 브라우저에서 영상을 지원하지 않습니다.
                </video>
            </section>

            <section style={{ marginTop: "24px" }}>
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        justifyContent: "center",
                    }}
                >
                    {["침대", "소파", "책상", "의자", "수납", "조명"].map((category) => (
                        <Link
                            key={category}
                            to={`/search?keyword=${encodeURIComponent(category)}&type=furniture&page=1`}
                            style={{
                                padding: "10px 18px",
                                border: "1px solid #ddd",
                                borderRadius: "20px",
                                textDecoration: "none",
                                color: "#333",
                                backgroundColor: "white",
                            }}
                        >
                            {category}
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
                    <div style={{display: "flex", gap: "8px", alignItems: "center"}}>
                        {currentUser && (
                            <SwitchMui
                                checked={hideMode}
                                onChange={onHideModeChange}
                                label={hideMode ? "숨김 관리 중" : "추천 숨김 관리"}
                                name="hideMode"
                                width="180px"
                            />
                        )}
                        <Link to ="/furniture/list">전체보기</Link>
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
                                가격: {Number(item.f_price || 0).toLocaleString()}원
                            </p>

                            <p style={{ margin: 0 }}>
                                {item.f_discount > 0 && (
                                    <span>할인 {item.f_discount}% </span>
                                )}
                                배송비 {Number(item.f_deliveryprice || 0).toLocaleString()}원
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

            <FloatingActionButtonMui
                color="primary"
                size="large"
                icon={<SmartToyIcon />}
                onClick={() => setChatOpen(true)}
            />

            {chatOpen && <ChatbotModal onClose={() => setChatOpen(false)} />}

            {/* 기존 footer 제거: 공통 Footer가 담당 */}
        </div>
    );
};





export default MainHomePage;
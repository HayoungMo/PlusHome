import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChatbotModal from '../components/ChatbotModal';
import { Button } from '@mui/material';
import FloatingActionButtonMui from "../components/FloatingActionButtonMui";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const MainHomePage = () => {

    // 가구 리스트 상태 , 처음에는 빈배열
    const [furniture, setFurniture] = useState([]);
    const [chatOpen, setChatOpen] = useState(false);

    //백엔드 호출
    useEffect(() => {
        axios.get("http://localhost:8080/api/main/best")
             .then((res) =>{
                setFurniture(Array.isArray(res.data) ? res.data : []);
             })
            .catch((err) => {
                console.error("추천 가구 조회 실패했습니다:",err);
            });
        },[]);

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
                    <h2 style={{ margin: 0}}>오늘의 추천 가구</h2>
                    <Link to="/furniture/list">전체보기</Link>
                </div>
                
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                        gap: "16px"
                    }}
                >
                    {furniture.map((item) => (
                        <Link 
                            to={`/furniture/article/${item.f_code}`} 
                            key={item.f_code}
                            style={{
                                color: "inherit",
                                textDecoration: "none"
                            }}
                        >
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
                                배송비 {Number(item.f_dprice || 0).toLocaleString()}원
                            </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 추천 상품/ 업체 추천/ 할인 -> 알고리즘용 */}
            <section
                style={{
                    marginTop: "36px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px"
                }}
            >
                <Link
                    to="/interior/list/company"
                    style={{ textDecoration: "none", color: "inherit" }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            border: "1px solid #e5e1da",
                            borderRadius: "8px",
                            padding: "20px"
                        }}
                    >
                        <h3>인테리어 업체 찾기</h3>
                        <p>우리 집에 어울리는 인테리어 업체를 둘러보세요.</p>
                    </div>
                </Link>

                <Link
                    to="/interior/question"
                    style={{ textDecoration: "none", color: "inherit" }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            border: "1px solid #e5e1da",
                            borderRadius: "8px",
                            padding: "20px"
                        }}
                    >
                        <h3>인테리어 상담 신청</h3>
                        <p>간단한 질문에 답하고 맞춤 업체를 추천받아보세요.</p>
                    </div>
                </Link>
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
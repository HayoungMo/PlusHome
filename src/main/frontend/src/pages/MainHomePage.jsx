import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ChatbotModal from '../components/ChatbotModal';
import { Button } from '@mui/material';

const MainHomePage = () => {

    // 가구 리스트 상태 , 처음에는 빈배열
    const [furniture, setFurniture] = useState([]);
    const [chatOpen, setChatOpen] = useState(false);

    //백엔드 호출
    useEffect(() => {
        axios.get("http://localhost:8080/api/main/best")
            .then(res => {
                console.log("받아온 데이터:", res.data);
                setFurniture(res.data);
            })
            .catch(err => {
                console.error("에러:",err);
            });
        },[]);
   

    return (
        <div>
            {/* header */}
            <header>
                <Link to="/">로고</Link>

                <div>
                    <input placeholder="검색" />
                </div>
                
                <Link to="/login">로그인</Link>

            </header>

            {/* 메인 영상 */}
            <section>
                <video autoPlay muted loop playsInline>
                    <source src="" type="video/mp4"/>
                </video>
            </section>
            
            {/* 상위 카테고리 (쇼핑/인테리어 상담/자유게시판 등) */}
            <nav>
                {/* 쇼핑 */}
                <Link to="/furniture/list">| 가구 | </Link>
                {/* 인테리어 회사 및 예시*/}
                <Link to="/interior/list">인테리어 예시 | </Link>
                {/* 인테리어 상담 신청 */}
                <Link to="/interior/question">인테리어 상담 신청 | </Link>
                {/* 자유게시판 */}
            </nav>

            {/* 백에서 받아온 메세지 뿌리기 */}
            {/* 오늘의 추천 가구 목록 */}
            <section>
                <h2>오늘 강력 추천 가구</h2>
                <div>
                    {furniture.map((item) => (
                        <Link to={`/furniture/article/${item.f_code}`} key={item.f_code}>
                            <div>
                                <p>{item.c_name}</p>
                                <h3>{item.f_name}</h3>
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
            </section>

            {/* 이벤트 영역 */}
            <main>
                {/* 추천 상품/ 업체 추천/ 할인 -> 알고리즘용 */}
            </main>
            <Button onClick={() => setChatOpen(true)}>
                AI 챗봇
            </Button>
            {
                chatOpen && (<ChatbotModal onClose={() => setChatOpen(false)} />)
            }
            {/* footer */}
            <Link to="/component">MUI 예시</Link>
            <footer>
                {/* plushome */}
            </footer>
        </div>
    );
};





export default MainHomePage;
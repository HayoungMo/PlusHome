import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChatbotModal from '../components/ChatbotModal';
import { Button } from '@mui/material';
import FloatingActionButtonMui from "../components/FloatingActionButtonMui";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const MainHomePage = ({loginUser,setLoginUser,setLoginInfo}) => {

    const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);

    // 가구 리스트 상태 , 처음에는 빈배열
    const [furniture, setFurniture] = useState([]);
    const [chatOpen, setChatOpen] = useState(false);

    //메인 검색창에서 검색하면 /search?keyword=검색어 << 이렇게 보내는 역할
    const navigate = useNavigate();
    const [searchKeyword, setSearchKeyword] = useState("");

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
    
    const onSearch = (evt) => {
        evt.preventDefault();

        const keyword = searchKeyword.trim();

        if(!keyword){
            alert("검색어를 입력해주세요");
            return;
        }

        navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    };

     //로그아웃
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setLoginUser(null);
        setLoginInfo(null);

        navigate("/login")
        
    }
   

    return (
        <div>
            {/* header */}
            <header>
                <Link to="/">로고</Link><br/>
                <Link to="/component">MUI 예시</Link>
                <form onSubmit={onSearch}>
                    <input
                        placeholder="검색어를 입력해주세요"
                        value={searchKeyword}
                        onChange={(evt) => setSearchKeyword(evt.target.value)}
                    />
                    <button type="submit">검색</button>
                </form>
                {userData ? (
                    <>
                        <span>{userData.id}님 </span>
                        <button onClick={logout}>로그아웃</button>
                        </>
                ) : (
                   
                <Link to="/login">로그인</Link>
                )}

            </header>

            {/* 메인 영상 */}
            <section>
                <video 
                    autoPlay
                    muted
                    loop
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
                            <hr/>
                                <p>회사: {item.c_name}</p>
                                <h3>가구:{item.f_name}</h3>
                                <p>원가: {item.f_price}</p>
                                <p>
                                    {item.f_discount > 0 && (
                                        <span>할인가 {item.f_discount}% : </span>
                                    )}
                                    {item.f_dprice.toLocaleString()}(원)
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
            <FloatingActionButtonMui 
                color="primary"
                size="large"
                icon={<SmartToyIcon/>}
                onClick={() => setChatOpen(true)}
                
            />
            {
                chatOpen && (<ChatbotModal onClose={() => setChatOpen(false)} />)
            }
            {/* footer */}
            
            <footer>
                {/* plushome */}
            </footer>
        </div>
    );
};





export default MainHomePage;
import React from 'react';

const MainHomePage = () => {



    return (
        <div>
            {/* header */}
            <header>
                <div>로고</div>
                <div>{/*검색바*/}</div>
                <div>{/*로그인 회원가입 마이페이지*/}</div>
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
                {/* 인테리어 상담 */}
                {/* 자유게시판 */}
            </nav>

            {/* 이벤트 영역 */}
            <main>
                {/* 추천 상품/ 업체 추천/ 할인 -> 알고리즘용 */}
            </main>

            {/* footer */}
            <footer>
                {/* plushome */}
            </footer>
        </div>
    );
};





export default MainHomePage;
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FurnitureService from '../service/furnitureService';

const FurnitureArticle = () => {
    const calledRef = useRef(false);

    const { f_code } = useParams();
    const [furniture, setFurniture] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (calledRef.current) return;

        calledRef.current = true;
        getArticle();
    }, [f_code]);

    
    useEffect(() => {
        if (furniture?.imageList?.length > 0) {
            const thumb = furniture.imageList.find(
                img => img.img_tag === "THUMBNAIL"
            );

            setMainImage(thumb || furniture.imageList[0]);
        }
    }, [furniture]);

    const getArticle = async () => {
        try {
            const data = await FurnitureService.getFurnitureItem(f_code);
            setFurniture(data);
        } catch (error) {
            console.error("가구 상세 조회 실패", error);
            alert("가구 상세 조회에 실패했습니다.");
        }
    };

    const onPayment = () => {
        navigate(`/payment/${f_code}`);
    };

    const onBack = () => {
        navigate(-1);
    };

    if (!furniture) {
        return <div>로딩 중...</div>;
    }

    const imageList = furniture.imageList || [];

    const infoImages = imageList.filter(img => img.img_tag === "INFO");
    const othersImages = imageList.filter(img => img.img_tag === "OTHERS");

    return (
        <div style={{ padding: "20px" }}>

            <Link to="/">로고</Link><br />
            <button onClick={onBack}>돌아가기</button>

            
            <div style={{ display: "flex", gap: "40px", marginTop: "20px" }}>

                
                <div>

                    <div style={{ display: "flex", gap: "15px" }}>

                        {/* 썸네일 + info */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {imageList.filter(image=> image.img_tag === "THUMBNAIL" || image.img_tag === "INFO")
                            .map((image, index) => (
                                <img
                                    key={index}
                                    src={`http://localhost:8080/api/images/FURNITURE/${image.img_name}`}
                                    style={{
                                        width: "70px",
                                        height: "70px",
                                        objectFit: "cover",
                                        cursor: "pointer",
                                        border: mainImage?.img_name === image.img_name
                                            ? "2px solid black"
                                            : "1px solid #ddd"
                                    }}
                                    onClick={() => setMainImage(image)}
                                />
                            ))}
                        </div>

                        {/* main */}
                        <img
                            src={
                                mainImage?.img_name
                                    ? `http://localhost:8080/api/images/FURNITURE/${mainImage.img_name}`
                                    : "/no-image.png"
                            }
                            style={{
                                width: "450px",
                                height: "450px",
                                objectFit: "cover"
                            }}
                        />

                    </div>

                </div>

                <div style={{ flex: 1 }}>

                    <h2>{furniture.f_name}</h2>

                    <p>업체명: {furniture.c_name}</p>
                    <p>조회수: {furniture.f_viewCount}</p>

                    <hr />

                    <h3>가격 정보</h3>
                    <p>정가: {furniture.f_price.toLocaleString()}원</p>
                    <p>할인가: {furniture.f_dprice.toLocaleString()}원</p>
                    <p>할인율: {furniture.f_discount}%</p>
                    <p>포인트: {furniture.f_point}</p>

                    <hr />

                    <h3>배송 정보</h3>
                    <p>
                        배송비:{" "}
                        {furniture.f_dprice >= 50000
                            ? "무료배송"
                            : "3,000원"}
                    </p>
                    <p>배송기간: 2~3일</p>


                    <hr />

                    <button
                        onClick={onPayment}
                        style={{
                            width: "100%",
                            padding: "15px",
                            background: "black",
                            color: "white",
                            fontSize: "16px",
                            cursor: "pointer"
                        }}
                    >
                        구매하기
                    </button>

                </div>

            </div>

            
            <hr/>
            
            <h3 style={{ marginTop: "50px" }}>상세 설명</h3>

            <div>
                {othersImages.map((img, idx) => (
                    <img
                        key={idx}
                        src={`http://localhost:8080/api/images/FURNITURE/${img.img_name}`}
                        style={{
                            width: "100%",
                            marginBottom: "20px"
                        }}
                    />
                ))}
            </div>

        </div>
    );
};

export default FurnitureArticle;
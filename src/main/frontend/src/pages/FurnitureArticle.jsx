import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import FurnitureService from '../service/furnitureService';
import LikeService from '../service/likeService';
import OptionsService from '../service/optionService';

const FurnitureArticle = () => {

    const called = useRef(false)

    const { f_code } = useParams();
    const [furniture, setFurniture] = useState(null)
    const [mainImage, setMainImage] = useState(null)
    const [tab, setTab] = useState("detail")
    const [liked, setLiked] = useState(false)
    const [options, setOptions] = useState([]);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState("");
    const [quantity, setQuantity] = useState(1);

    const location = useLocation()
    const navigate = useNavigate()

    const query = new URLSearchParams(location.search)
    const page = query.get("page")

    useEffect(() => {
        if(!f_code) return;
        if(called.current) return;

        called.current=true;
        
        getArticle();
        FurnitureService.increaseView(f_code);
    }, [f_code]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token || !f_code) {
            setLiked(false);
            return;
        }

        LikeService.checkFurnitureLike(f_code)
            .then((res) => {
                setLiked(res.data?.liked || false);
            })
            .catch((error) => {
                console.error("찜 여부 확인 실패", error);
                setLiked(false);
            });
    }, [f_code]);

    useEffect(() => {
        if (furniture?.imageList?.length > 0) {
            const thumb = furniture.imageList.find(
                img => img.img_tag === "THUMBNAIL"
            );

            setMainImage(thumb || furniture.imageList[0]);
        }
    }, [furniture]);

    useEffect(() => {
        if (!f_code) return;

        OptionsService.getFurnitureOptions(f_code)
            .then((res) => {
                setOptions(res.data || []);
            })
            .catch((error) => {
                console.error("옵션 조회 실패", error);
                setOptions([]);
            });
    }, [f_code]);


    const getArticle = async () => {
        try {
            const data = await FurnitureService.getFurnitureItem(f_code);
            setFurniture(data);
        } catch (error) {
            console.error("가구 상세 조회 실패", error);
            alert("가구 상세 조회에 실패했습니다.");
        }
    };

    const onToggleLike = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        LikeService.toggleFurnitureLike(f_code)
            .then((res) => {
                setLiked(res.data?.liked || false);
            })
            .catch((error) => {
                console.error("찜 처리 실패", error);
                alert("찜 처리에 실패했습니다.");
            });
    };

    const onPayment = () => {
        if(options.length > 0 && selectedOptionIndex === ""){
            alert("옵션을 선택해주세요.")
            return
        }
        const selectedOption = 
            selectedOptionIndex !== ""
            ? options[Number(selectedOptionIndex)]
            : null

        navigate(`/payment/${f_code}`,{
            state:{
                option: selectedOption,
                quantity
            }
        });
    };

    const onBack = () => {
        navigate(`/furniture/list?page=${page}`);
    };

    if (!furniture) {
        return <div>로딩 중...</div>;
    }

    const imageList = furniture.imageList || [];

    const orderedThumbInfo = [
    ...imageList.filter(img => img.img_tag === "THUMBNAIL"),
    ...imageList.filter(img => img.img_tag === "INFO")
    ]

    const infoImages = imageList.filter(img => img.img_tag === "INFO");
    const othersImages = imageList.filter(img => img.img_tag === "OTHERS");

    const onUpdate = () => {
        navigate(`/furniture/update/${f_code}?page=${page}`)
    }

    const onReview = () => {
      navigate(`/furniture/review/${f_code}`);
    };

    const onDelete = async (f_code) => {
        try{
            await FurnitureService.deleteFurniture(f_code)
            alert("삭제 완료")
            navigate(`/furniture/list?page=${page}`);
            
        }catch(error){
            console.error(error)
            alert("삭제 실패")
        }
    }

    return (
        <div style={{ padding: "20px" }}>

            <button onClick={()=> onUpdate(f_code)}>수정</button>
            <button onClick={()=> onDelete(f_code)}>삭제</button>
            <button onClick={()=> onReview(f_code)}>리뷰등록</button>
            <button onClick={onBack}>list로 돌아가기</button>

            
            <div style={{ display: "flex", gap: "40px", marginTop: "20px" }}>

                
                <div>

                    <div style={{ display: "flex", gap: "15px" }}>

                        {/* 썸네일 + info */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {orderedThumbInfo.map((image, index) => (
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

                <hr/>
                    <button
                        type="button"
                        onClick={onToggleLike}
                        style={{
                            width: "100%",
                            padding: "15px",
                            background: liked ? "#ffdddd" : "white",
                            color: liked ? "red" : "black",
                            border: "1px solid #ddd",
                            fontSize: "16px",
                            cursor: "pointer",
                            marginBottom: "10px"
                        }}
                    >
                        {liked ? "♥ 찜 해제" : "♡ 찜하기"}
                    </button>
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



            <h3>옵션 선택</h3>

            {options.length === 0 ? (
                <p>선택 가능한 옵션이 없습니다.</p>
            ) : (
                <select
                    value={selectedOptionIndex}
                    onChange={(evt) => setSelectedOptionIndex(evt.target.value)}
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "10px"
                    }}
                >
                    <option value="">옵션을 선택하세요</option>

                    {options.map((option, index) => (
                        <option
                            key={option.o_code || index}
                            value={index}
                            disabled={option.o_count <= 0}
                        >
                            {option.o_select} - {option.o_text}
                            {option.o_price > 0
                                ? ` (+${option.o_price.toLocaleString()}원)`
                                : ""}
                            {Number(option.o_count)===1 ? " 마지막 한 개":""}
                            {Number(option.o_count) <= 0 ? " 품절" : ""}
                        </option>
                    ))}
                </select>
            )}

            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                    -
                </button>

                <span>{quantity}</span>

                <button
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                >
                    +
                </button>
            </div>


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

            <div
                style={{
                    display: "flex",
                    marginTop: "10px",
                    gap: "10px"
                        }}
            >

            <button
                onClick={() => setTab("detail")}
                style={{
                    flex: 1,
                    padding: "15px",
                    background: tab === "detail" ? "black" : "#eee",
                    color: tab === "detail" ? "white" : "black",
                    border: "none",
                    cursor: "pointer"
                }}
            >
                상세보기
            </button>

            <button
                onClick={() => setTab("review")}
                style={{
                    flex: 1,
                    padding: "15px",
                    background: tab === "review" ? "black" : "#eee",
                    color: tab === "review" ? "white" : "black",
                    border: "none",
                    cursor: "pointer"
                }}
            >
                리뷰
            </button>

            <button
                onClick={() => setTab("qna")}
                style={{
                    flex: 1,
                    padding: "15px",
                    background: tab === "qna" ? "black" : "#eee",
                    color: tab === "qna" ? "white" : "black",
                    border: "none",
                    cursor: "pointer"
                }}
            >
                문의
            </button>
        </div>           
        
        <div style={{ marginTop: "50px" }}>

    {tab === "detail" && (
        <div>
            <h3>상세 설명</h3>

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
    )}

    {tab === "review" && (
        <div>
            <h3>리뷰</h3>

            <div
                style={{
                    padding: "30px",
                    border: "1px solid #ddd"
                }}
            >
                아직 등록된 리뷰가 없습니다.
            </div>
        </div>
    )}

    {tab === "qna" && (
        <div>
            <h3>문의</h3>

            <div
                style={{
                    padding: "30px",
                    border: "1px solid #ddd"
                }}
            >
                등록된 문의가 없습니다.
            </div>
        </div>
    )}

</div>

        </div>
    );
};

export default FurnitureArticle;
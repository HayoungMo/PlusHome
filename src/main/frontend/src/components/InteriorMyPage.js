import React, { useEffect, useState } from "react";
import UserBookingLists from "./UserBookingLists";
import InteriorMyReview from "./InteriorMyReview";
import { useNavigate } from "react-router-dom";
import { Tabs, Tab, Box, Button } from "@mui/material";
import LikeService from "../service/likeService";
import GetImgDir from "../resources/function/GetImgDir";
import "../css/InteriorMyPage.css";

const InteriorMyPage = ({ user }) => {
  const navigate = useNavigate();
  const [likes, setLikes] = useState([]);
  const localUserData = localStorage.getItem("user");
  const userData = JSON.parse(localUserData);
  const {
    addr,
    birth,
    code,
    email,
    gender,
    id,
    name,
    tel,
    type,
    companyList = [],
  } = userData;

  const handleNext = (data) => {
    navigate("/interior/article", {
      state: { company: data },
    });
  };

  const onToggleLike = (company) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    LikeService.toggleInteriorLike(
      company.c_id + "_" + company.c_name + "_" + company.c_kind,
    )
      .then((res) => {
        setLikes(res.data?.liked || false);
      })
      .catch((error) => {
        console.error("찜 처리 실패", error);
        alert("찜 처리에 실패했습니다.");
      });
  };

  const likesAllDelete = async() =>{
    await likes.map((item)=>{
      onToggleLike(item);
    })
  }

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await LikeService.getMyInteriorLikes();
        const data = Array.isArray(res.data) ? res.data : [];

        const listWithImages = await Promise.all(
          data.map(async (item) => {
            const logo = await GetImgDir({
              kind: "LOGO",
              returnType: "list",
              a: item.c_id,
              b: item.c_kind,
              c: item.c_name,
              d: "Logo",
              view: false,
            });

            return {
              ...item,
              logo: logo?.result?.length ? logo : null,
            };
          }),
        );

        setLikes(listWithImages);
      } catch (error) {
        console.error(error);

        if (error.response?.status === 401) {
          alert("권한 없음");
          return;
        }

        alert("찜목록을 불러오지 못했습니다.");
      }
    };

    fetchLikes();
  }, [user, navigate]);

  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };
  return (
    <Box className="interior-my-page">
      <Tabs className="interior-my-tabs" value={tab} onChange={handleChange}>
        <Tab label="예약 내역" />
        <Tab label="리뷰" />
        <Tab label="찜 목록" />
      </Tabs>

      <Box className="interior-my-content">
        {tab === 0 && <UserBookingLists id={id} />}

        {tab === 1 && <InteriorMyReview id={id} />}

        {tab === 2 && (
          <div className="interior-wishlist-panel">
            {Array.isArray(likes) && likes.length > 0 ? (
              <div className="interior-wishlist-grid">
                <Button
                  className="interior-wishlist-delete-all"
                  onClick={() => likesAllDelete()}
                >
                  찜목록 모두 삭제
                </Button>
                {likes.map((item, idx) => {
                  const profileImage = item?.logo?.result?.find(
                    (image) => image.img_tag === "LOGO",
                  )?.img_name;

                  return (
                    <button
                      className="interior-wishlist-card"
                      key={`${item.c_id}-${item.c_kind}-${item.c_name}-${idx}`}
                      type="button"
                      onClick={() => handleNext(item)}
                    >
                      <div className="interior-wishlist-thumb">
                        {profileImage ? (
                          <img src={profileImage} alt={`${item.c_name} 로고`} />
                        ) : (
                          <span>이미지 없음</span>
                        )}
                      </div>

                      <div className="interior-wishlist-info">
                        <strong>{item.c_name}</strong>
                        <span>{item.c_kind}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <>
                <p className="interior-wishlist-empty">
                  찜 목록에 업체가 없습니다
                </p>
              </>
            )}
          </div>
        )}
      </Box>
    </Box>
  );
};

export default InteriorMyPage;

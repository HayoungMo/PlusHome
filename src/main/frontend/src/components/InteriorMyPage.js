import React, { useEffect, useState } from "react";
import UserBookingLists from "./UserBookingLists";
import InteriorMyReview from "./InteriorMyReview";
import { useNavigate } from "react-router-dom";
import { Tabs, Tab, Box } from "@mui/material";

const InteriorMyPage = ({ user }) => {
  const navigate = useNavigate();
  const id = user?.id || localStorage.getItem("id")

  const handleNext = (data) => {
    navigate("/interior/article", {
      state: { company: data },
    });
  };

  const getWishList = () => {
    return JSON.parse(localStorage.getItem(`wishList_${id}`)) || [];
  };

  const [like, setLike] = useState(getWishList());

  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };
  return (
    <Box>
      <Tabs value={tab} onChange={handleChange}>
        <Tab label="예약 내역" />
        <Tab label="리뷰" />
        <Tab label="찜 목록" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tab === 0 && <UserBookingLists id={id} />}

        {tab === 1 && <InteriorMyReview id={id} />}

        {tab === 2 && (
          <div className="interior-wishlist-panel">
            {Array.isArray(like) && like.length > 0 ? (
              <div className="interior-wishlist-grid">
                {like.map((item, idx) => {
                  const profileImage = item?.logo?.result?.find(
                    (image) => image.img_tag === "PROFILE",
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
              <p className="interior-wishlist-empty">
                찜 목록에 업체가 없습니다
              </p>
            )}
          </div>
        )}
      </Box>
    </Box>
  );
};

export default InteriorMyPage;

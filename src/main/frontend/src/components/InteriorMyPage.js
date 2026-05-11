import React, { useEffect, useState } from "react";
import UserBookingLists from "./UserBookingLists";
import InteriorMyReview from "./InteriorMyReview";
import { useNavigate } from "react-router-dom";
import { Tabs, Tab, Box } from "@mui/material";

const InteriorMyPage = () => {
  const navigate = useNavigate();
  const id = localStorage.getItem("id");
  const user = localStorage.getItem("user");

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

        {tab === 1 && <InteriorMyReview />}

        {tab === 2 && (
          <>
            <p>찜 목록</p>

            {Array.isArray(like) && like.length > 0 ? (
              like.map((item, idx) => (
                <div key={idx} onClick={() => handleNext(item)}>
                  {item.c_name}
                </div>
              ))
            ) : (
              <p>찜 목록에 업체가 없습니다</p>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default InteriorMyPage;

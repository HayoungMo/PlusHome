import React, { useEffect, useState } from "react";
import UserBookingLists from "./UserBookingLists";
import InteriorMyReview from "./InteriorMyReview";
import { useNavigate } from "react-router-dom";

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
     return JSON.parse(localStorage.getItem("wishList")) || [];
   };

   const [like, setLike] = useState(getWishList());

  return (
    <div>
      <UserBookingLists id={id} />
      <InteriorMyReview />
      <p>찜 목록</p>
      {Array.isArray(like) && like.length > 0 ? (
      like.map((item) => {
        return <div onClick={()=>handleNext(item)}>{item.c_name}</div>;
      })):(
        <p> 찜 목록에 업체가 없습니다</p>
      )}
    </div>
  );
};

export default InteriorMyPage;

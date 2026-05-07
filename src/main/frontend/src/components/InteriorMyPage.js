import React, { useEffect, useState } from "react";
import InteriorUserService from "../service/interiorUserService";
import TableMuiCollapse from "./TableMuiCollapse";
import UserBookingLists from "./UserBookingLists";
import { useNavigate } from "react-router-dom";
import InteriorMyInvoice from "./InteriorMyInvoice";

const InteriorMyPage = () => {
  const id = localStorage.getItem("id");
  const user = localStorage.getItem("user");

  return (
    <div>
      <UserBookingLists id={id} />

    </div>
  );
};

export default InteriorMyPage;

import React, { useState } from "react";
import DialogMui from "../components/DialogMui";
import { Button } from "@mui/material";
import UserPageService from "../service/userPageService";
import { useNavigate } from "react-router-dom";

const UserDeletePage = ({ user,setLoginInfo,setLoginUser }) => {
    const navigate = useNavigate();
  const [open1, setOpen1] = useState(false);

  const handleOpen1 = () => {
    setOpen1(true);
  };

  const handleClose1 = () => {
    setOpen1(false);
  };

  const handleDelete = async() => {
    await UserPageService.deleteUser(user.id);
    		localStorage.removeItem("token");
        localStorage.removeItem("user");

        setLoginUser?.(null);
        setLoginInfo?.(null);

        navigate("/login");
  };

  return (
    <div>
      <p>"정말 탈퇴하시겠습니까?"</p>
      <Button onClick={handleOpen1}>회원 탈퇴</Button>
      <DialogMui
        open={open1}
        onClose={handleClose1}
        title="탈퇴 확인"
        text="정말 탈퇴하시겠습니까?"
        buttons={[
          {
            title: "취소",
            color: "inherit",
            onClick: handleClose1,
          },
          {
            title: "회원 탈퇴",
            color: "error",
            variant: "contained",
            onClick: (e) => {
              console.log("회원 탈퇴 실행");
              handleDelete(e);
              handleClose1();
            },
          },
        ]}
      />
    </div>
  );
};

export default UserDeletePage;

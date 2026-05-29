import React, { useState } from "react";
import DialogMui from "../components/DialogMui";
import { Button, Dialog } from "@mui/material";
import UserPageService from "../service/userPageService";
import { useNavigate } from "react-router-dom";

const UserDeletePage = ({ 
  open,
  onClose,
  user,
  setLoginInfo,
  setLoginUser
}) => {

    const navigate = useNavigate();
    const [agreed, setAgreed] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);
    //const [open1, setOpen1] = useState(false);

  // const handleOpen1 = () => {
  //   setOpen1(true);
  // };

  // const handleClose1 = () => {
  //   setOpen1(false);
  // };

  const handleDelete = async() => {
    if(!agreed){
      setDeleteError("회원탈퇴 안내에 동의해주세요.")
      return
    }

    try{   
      setDeleting(true)

      await UserPageService.deleteUser(user.id);

    	localStorage.removeItem("token");
      localStorage.removeItem("user");

      setLoginUser?.(null);
      setLoginInfo?.(null);

      navigate("/login");  
    } catch(error){
      console.error("회원 탈퇴 실패", error);
      setDeleteError("회원 탈퇴 처리 중 오류가 발생했습니다.")
    
    } finally{
      setDeleting(false)
    }
  };

  const handleClose= () =>{
    setAgreed(false)
    setDeleteError("")
    onClose?.()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
    <div className="user-delete-dialog-card">
      <h3>회원 탈퇴</h3>

      <div className="user-delete-guide">
        <p>
          개인정보와 서비스 이용 기록은 개인정보 처리방침에 따라 일정 기간 보관된 뒤 삭제됩니다.
        </p>
        <p>
          보유 중인 포인트와 쿠폰은 탈퇴 즉시 만료됩니다.
        </p>
        <p>
          지갑 충전 금액은 탈퇴 전 고객센터를 통해 환불 신청할 수 있습니다.
        </p>
        <p>
          탈퇴 후에는 플러스 홈 서비스를 이용할 수 없습니다.
        </p>
      </div>

      <label className="user-delete-agree">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(evt) => {
            setAgreed(evt.target.checked);
            setDeleteError("");
          }}
        />
        위 내용을 확인했으며 회원 탈퇴에 동의합니다.
      </label>

      {deleteError && <p className="user-delete-error">{deleteError}</p>}

      <div className="user-delete-actions">
        <button
          type="button"
          className="danger"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? "처리 중" : "회원 탈퇴"}
        </button>

        <button type="button" onClick={handleClose}>
          취소
        </button>
      </div>
    </div>
  </Dialog>
  );
  

  // return (
  //   <div>
  //     <p>"정말 탈퇴하시겠습니까?"</p>
  //     <Button onClick={handleOpen1}>회원 탈퇴</Button>
  //     <DialogMui
  //       open={open1}
  //       onClose={handleClose1}
  //       title="탈퇴 확인"
  //       text="정말 탈퇴하시겠습니까?"
  //       buttons={[
  //         {
  //           title: "취소",
  //           color: "inherit",
  //           onClick: handleClose1,
  //         },
  //         {
  //           title: "회원 탈퇴",
  //           color: "error",
  //           variant: "contained",
  //           onClick: (e) => {
  //             console.log("회원 탈퇴 실행");
  //             handleDelete(e);
  //             handleClose1();
  //           },
  //         },
  //       ]}
  //     />
  //   </div>
  // );
};

export default UserDeletePage;

import React from "react";
import { FaWallet } from "react-icons/fa";
import { RiCoupon3Fill } from "react-icons/ri";
import { getImgDirSimple } from "../resources/function/GetImgDir";

const UserProfileCard = ({
  user,
  wallet,
  point,
  profileImage,
  fileInputRef,
  onClickProfileImage,
  onChangeProfileImage,
  changeMenu,
}) => {
  return (
      <div className="user-profile-card">
        <h2>프로필</h2>

        <div className="user-profile-image-box" onClick={onClickProfileImage}>
          {profileImage?.img_name ? (
            <img
              src={getImgDirSimple({
                kind: profileImage.img_kind,
                name: profileImage.img_name,
              })}
              alt="프로필"
              className="user-profile-image"
            />
          ) : (
            <div className="user-profile-placeholder">사진 추가</div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={onChangeProfileImage}
        />

        <div className="user-profile-info">
          <div className="user-profile-name">{user?.name}</div>
          <div className="user-profile-id">{user?.id}</div>
        </div>

        <div className="user-profile-assets">
          <div className="user-profile-asset-row">
            <span>지갑 잔액</span>
            <strong>{Number(wallet?.money || 0).toLocaleString()}원</strong>
          </div>

          <div className="user-profile-asset-row">
            <span>보유 포인트</span>
            <strong>{Number(point || 0).toLocaleString()}P</strong>
          </div>
        </div>

        <div className="user-profile-quick-menu">
          <button type="button" onClick={() => changeMenu("wallet")}>
            <FaWallet />
            <span>지갑 충전</span>
          </button>

          <button type="button" onClick={() => changeMenu("coupon")}>
            <RiCoupon3Fill />
            <span>내 쿠폰</span>
          </button>
        </div>
      </div>

  );
};

export default UserProfileCard;
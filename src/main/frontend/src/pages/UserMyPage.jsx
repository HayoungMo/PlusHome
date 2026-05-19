import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {getImgDirSimple} from "../resources/function/GetImgDir"

import UserPageService from "../service/userPageService";
import CartService from '../service/cartService';

import  Loading  from "./Loading"

import UserProfilePage from './UserProfilePage';
import UserWishListPage from './UserWishListPage';
import UserOrderPage from './UserOrderPage';
import UserQuestionPage from './UserQuestionPage';
import UserReviewPage from './UserReviewPage';
import UserDeletePage from './UserDeletePage';
import WalletService from '../service/walletService';
import UserCouponPage from './UserCouponPage';
import WalletChargeMui from '../components/WalletChargeMui';

const UserMyPage = ({loginUser, setLoginUser, loginInfo, setLoginInfo}) => {
    const navigate = useNavigate()
    const location = useLocation();
    const queryMenu = new URLSearchParams(location.search).get("menu");

    const fileInputRef = useRef(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeMenu, setActiveMenu] = useState(queryMenu || "edit");
    const [profileImage, setProfileImage] = useState(null);
    const [wallet, setWallet] = useState(null)
    const [point, setPoint] = useState(0)
    
    const loadPoint = async () => {
        try{
            const res = await CartService.getAvailablePoint()
            setPoint(Number(res.data?.point || 0))
        }catch (error) {
            console.error("포인트 조회 실패", error)
            setPoint(0)
        }
    }

    const loadWallet = async (id = user?.id) => {
        if(!id) return
        try {
            const walletData = await WalletService.getMyWallet(id);
            setWallet(walletData);
        } catch (error) {
            console.error("지갑 조회 실패", error);
        }
    }

    useEffect(()=>{
        if(queryMenu){
            setActiveMenu(queryMenu)
        }
    },[queryMenu])
 
    const changeMenu = (menu) => {
        setActiveMenu(menu)
        navigate(`/userpage?menu=${menu}`)
    }

    useEffect(()=>{
        const token = localStorage.getItem("token")

        if(!token){
            alert("로그인이 필요합니다.")
            navigate("/login")
            return
        }

        UserPageService.getMyPageUser()
        .then((res)=> {
            // setUser(res.data)
            // setLoginUser?.(res.data.id)
            // localStorage.setItem("user", JSON.stringify(res.data))

            //회사계정으로 들어왔을때 마이페이지에서 문의 볼수 있게 하기 위한것. 혹시 몰라서 기존 코드는 주석처리.
            const savedUser = JSON.parse(localStorage.getItem("user") || "null");

            const mergedUser = {
                ...savedUser,
                ...res.data,
                companyList: savedUser?.companyList || res.data.companyList,
            };

            setUser(mergedUser);
            setLoginUser?.(mergedUser.id);
            localStorage.setItem("user", JSON.stringify(mergedUser));
            //여기까지

            CartService.getAvailablePoint()
            .then((res) => {
                setPoint(Number(res.data?.point || 0));
            })
            .catch((error) => {
                console.error("포인트 조회 실패", error);
                setPoint(0);
            });

            return WalletService.getMyWallet(res.data.id)
        })
        .then((walletData) => {
            setWallet(walletData)
        })
        .catch((error)=> {
            console.error(error)

            const savedUser = localStorage.getItem("user");

            if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setLoginUser?.(parsedUser.id);
            }else{
                alert("사용자 정보를 불러오지 못했습니다.")
                navigate("/login")
            }
        })
        .finally(()=>{
            setLoading(false)
        })

        UserPageService.getProfileImage()
        .then((res)=>{
            setProfileImage(res.data)
        })
        .catch(()=>{
            setProfileImage(null)
        })

    },[navigate, setLoginUser])

    const onClickProfileImage = () => {
        if(profileImage) {
            const ok = window.confirm("프로필 이미지 수정?")
            if (!ok) return
        }

        fileInputRef.current.click()
    }

    const onChangeProfileImage = async (evt) => {
        const file = evt.target.files[0];

        if (!file) {
            return;
        }

        try {
            const savedImage = await UserPageService.updateProfileImage(file);
            setProfileImage(savedImage);
            alert("프로필 이미지가 저장되었습니다.");
        } catch (error) {
            console.error(error);
            alert("프로필 이미지 저장에 실패했습니다.");
        } finally {
            evt.target.value = "";
        }
    };

    if(loading) 
        return <Loading/>

    return (
      <div className="user-mypage">
        <aside className="user-mypage-menu">
          <div>
            <h2>프로필</h2>
            <div
              className="user-profile-image-box"
              onClick={onClickProfileImage}
            >
              {profileImage?.img_name ? (
                <img
                    src={getImgDirSimple({
                    kind: profileImage.img_kind,
                    name: profileImage.img_name,
                    })}
                    alt="프로필"
                    style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    cursor: "pointer",
                    }}
                />
                ) : (
                <div
                    style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    border: "1px solid #ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    }}
                >
                    사진 추가
                </div>
                )}

            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={onChangeProfileImage}
            />

            <p>
              <strong>id: </strong>
              <span>{user?.id}</span>
            </p>
            <p>
              <strong>이름: </strong>
              <span>{user?.name}</span>
            </p>
            <p>
              <strong>지갑 잔액: </strong>
              <span>{Number(wallet?.money || 0).toLocaleString()}원</span>
            </p>
            <p>
                <strong>포인트: </strong>
                <span>{Number(point || 0).toLocaleString()}P</span>
            </p>    
          </div>
        </aside>

                <button onClick={()=> changeMenu("edit")}>회원 정보</button>
                <button onClick={()=> changeMenu("orders")}>배송 정보 확인</button>
                <button onClick={() => changeMenu("wishlist")}>찜목록</button>
                <button onClick={() => changeMenu("inquiries")}>문의 확인</button>
                <button onClick={() => changeMenu("reviews")}>리뷰 확인</button>
                <button onClick={() => changeMenu("wallet")}>지갑 충전</button>
                <button onClick={() => changeMenu("coupon")}>쿠폰 등록/조회</button>
                <button onClick={() => changeMenu("delete")}>회원 탈퇴</button>
             
        <main className="user-mypage-content">
          {activeMenu === "edit" && (
            <UserProfilePage
              user={user}
              setUser={setUser}
              setLoginUser={setLoginUser}
            />
          )}

          {activeMenu === "orders" && <UserOrderPage user={user} loadPoint={loadPoint} loadWallet={loadWallet}/>}
          {activeMenu === "wishlist" && <UserWishListPage user={user} />}
          {activeMenu === "inquiries" && <UserQuestionPage user={user} />}
          {activeMenu === "reviews" && <UserReviewPage user={user} />}
          {activeMenu === "wallet" && (
            <WalletChargeMui
                user={user}
                onCharged={setWallet}
                open={activeMenu === "wallet"}
                onClose={() => changeMenu("edit")}
            />
            )}
          {activeMenu === "coupon" && <UserCouponPage user={user} />}
          {activeMenu === "delete" && (
            <UserDeletePage
              user={user}
              setLoginUser={setLoginUser}
              setLoginInfo={setLoginInfo}
            />
          )}
        </main>
      </div>
    );
};

export default UserMyPage;
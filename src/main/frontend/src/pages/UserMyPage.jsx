import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import '../css/UserMypage.css';

import UserPageService from "../service/userPageService";
import CartService from '../service/cartService';

import Loading from '../components/Loading';

import UserProfilePage from './UserProfilePage';
import UserWishListPage from './UserWishListPage';
import UserOrderPage from './UserOrderPage';
import UserQuestionPage from './UserQuestionPage';
import UserReviewPage from './UserReviewPage';
import UserDeletePage from './UserDeletePage';
import WalletService from '../service/walletService';
import UserCouponPage from './UserCouponPage';

import WalletChargeMui from '../components/WalletChargeMui';
import InteriorMyPage from '../components/InteriorMyPage';
import UserProfileCard from '../components/UserProfileCard';

const UserMyPage = ({loginUser, setLoginUser, loginInfo, setLoginInfo}) => {
    const navigate = useNavigate()
    const location = useLocation();
    const queryMenu = new URLSearchParams(location.search).get("menu");

    const fileInputRef = useRef(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeMenu, setActiveMenu] = useState(queryMenu || "info");
    const [profileImage, setProfileImage] = useState(null);
    const [wallet, setWallet] = useState(null)
    const [point, setPoint] = useState(0)
    
    const getSectionByMenu = (menu) => {
        if (["orders", "wishlist", "reviews", "inquiries"].includes(menu)) {
            return "shopping";
        }

        if (menu === "interior") {
            return "interior";
        }

        return "info";
    };

    const [activeSection, setActiveSection] = useState(
        getSectionByMenu(queryMenu || "info")
    );

    const sectionMenus= {
        info: [
            {key: "info", label: "회원 정보"},
        ],
        shopping: [
            {key: "orders", label: "주문 내역 조회"},
            {key: "reviews", label: "리뷰"},
            {key: "wishlist", label: "찜목록"},
            {key: "inquiries", label: "문의"},
        ],
        interior: [
            {key: "interior", label: ""},
        ]

    }

    const changeSection = (section) => {
        setActiveSection(section);

        const firstMenu = sectionMenus[section]?.[0]?.key;
        if (firstMenu) {
            changeMenu(firstMenu);
        }
    };  
    
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
            setActiveSection(getSectionByMenu(queryMenu))
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
        return <Loading message='마이페이지 정보를 불러오는 중입니다.'/>

    return (
        <div className={`user-mypage ${activeSection !== "info" ? "wide" : ""}`}>
        {activeSection === "info" && (
            <aside className="user-mypage-menu">
            <UserProfileCard
            user={user}
            wallet={wallet}
            point={point}
            profileImage={profileImage}
            fileInputRef={fileInputRef}
            onClickProfileImage={onClickProfileImage}
            onChangeProfileImage={onChangeProfileImage}
            changeMenu={changeMenu}
            />
            </aside>
        )}

        <main className="user-mypage-main">
        <div className="user-section-tabs">
            <button
            className={activeSection === "info" ? "active" : ""}
            onClick={() => changeSection("info")}
            >
            프로필
            </button>
            <button
            className={activeSection === "shopping" ? "active" : ""}
            onClick={() => changeSection("shopping")}
            >
            쇼핑
            </button>
            <button
            className={activeSection === "interior" ? "active" : ""}
            onClick={() => changeSection("interior")}
            >
            인테리어
            </button>
        </div>

            {sectionMenus[activeSection].length > 1 && (
            <div className="user-sub-tabs">
                {sectionMenus[activeSection].map((menu) => (
                <button
                    key={menu.key}
                    className={activeMenu === menu.key ? "active" : ""}
                    onClick={() => changeMenu(menu.key)}
                >
                    {menu.label}
                </button>
                ))}
            </div>
            )}

            <section
                className={`user-mypage-content ${
                    activeSection !== "info" ? "wide-content" : ""
                }`}
            >

                {activeMenu === "info" && (
                <UserProfilePage
                    user={user}
                    setUser={setUser}
                    setLoginUser={setLoginUser}
                    onDeleteClick={() => changeMenu("delete")}
                />
                )}

                {activeMenu === "orders" && (
                <UserOrderPage
                    user={user}
                    loadPoint={loadPoint}
                    loadWallet={loadWallet}
                />
                )}

                {activeMenu === "wishlist" && <UserWishListPage user={user} />}
                {activeMenu === "inquiries" && <UserQuestionPage user={user} />}
                {activeMenu === "reviews" && <UserReviewPage user={user} />}

                {activeMenu === "wallet" && (
                <WalletChargeMui
                    user={user}
                    onCharged={setWallet}
                    open={activeMenu === "wallet"}
                    onClose={() => changeMenu("info")}
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

                {activeMenu === "interior" && <InteriorMyPage user={user} />}
            </section>
            </main>
        </div>
        );
};

export default UserMyPage;
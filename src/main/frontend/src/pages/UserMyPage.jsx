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
import { Snackbar, Tab, Tabs } from "@mui/material";
import AlertMui from "../components/AlertMui";
import DialogMui from "../components/DialogMui";

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
    const [profileImageDialogOpen, setProfileImageDialogOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [questionCount, setQuestionCount] = useState(0)

    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        title: "",
        text: "",
    })

    const showAlert = ({ severity = "info", title = "", text = "" }) => {
        setAlert({
            open: true,
            severity,
            title,
            text,
        })
    }

    const closeAlert = () => {
        setAlert((prev) => ({
            ...prev,
            open: false,
        }))
    }
    
    const getSectionByMenu = (menu) => {
        if (["orders", "wishlist", "reviews", "inquiries"].includes(menu)) {
            return "shopping";
        }

        if (menu === "interior") {
            return "interior";
        }

        return "info";
    };

    const isCompanyUser =
        user?.type === "company" || (user?.companyList || []).length > 0

    const isAdminUser =
        user?.type === "admin";

    const goCompanyDashboard = () => {
        navigate("/CompanyDashboard")
    }

    const geAdminDashboard = () => {
        navigate("/DevDashboard")
    }

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

    const changeSection = (event, section) => {
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

    const changeSubMenu = (event, menu) => {
        changeMenu(menu);
    };  

    useEffect(()=>{
        const token = localStorage.getItem("token")

        if(!token){
            setLoading(false)
            showAlert({
                severity: "warning",
                title: "로그인 필요",
                text: "로그인이 필요합니다.",
            })
            setTimeout(() => {
                navigate("/login")
            }, 800)
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
                showAlert({
                    severity: "error",
                    title: "조회 실패",
                    text: "사용자 정보를 불러오지 못했습니다.",
                })
                setTimeout(() => {
                    navigate("/login")
                }, 800)
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
            setProfileImageDialogOpen(true)
            return
        }

        fileInputRef.current.click()
    }

    const onConfirmProfileImageChange = () => {
        setProfileImageDialogOpen(false)
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
            showAlert({
                severity: "success",
                title: "저장 완료",
                text: "프로필 이미지가 저장되었습니다.",
            })
        } catch (error) {
            console.error(error);
            showAlert({
                severity: "error",
                title: "저장 실패",
                text: "프로필 이미지 저장에 실패했습니다.",
            })
        } finally {
            evt.target.value = "";
        }
    };

    if(loading) 
        return <Loading message='마이페이지 정보를 불러오는 중입니다.'/>

    return (
        <>
        <Snackbar
            open={alert.open}
            autoHideDuration={3000}
            onClose={closeAlert}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
            <div>
                <AlertMui
                    severity={alert.severity}
                    title={alert.title}
                    text={alert.text}
                    onClose={closeAlert}
                />
            </div>
        </Snackbar>

        <DialogMui
            open={profileImageDialogOpen}
            onClose={() => setProfileImageDialogOpen(false)}
            title="프로필 이미지 수정"
            text="프로필 이미지를 변경하시겠습니까?"
            buttons={[
                {
                    title: "취소",
                    onClick: () => setProfileImageDialogOpen(false),
                },
                {
                    title: "변경",
                    color: "primary",
                    variant: "contained",
                    onClick: onConfirmProfileImageChange,
                },
            ]}
        />

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
            {((isCompanyUser || isAdminUser) && (
                <div className="user-company-dashboard-menu">
                    <button 
                    type="button" 
                    onClick={isAdminUser ? geAdminDashboard : goCompanyDashboard}>
                    대시보드
                    </button>
                </div>
                ))}
            </aside>
        )}

        <main className="user-mypage-main">
        <Tabs
            className="user-section-tabs"
            value={activeSection}
            onChange={changeSection}
        >
            <Tab label="프로필" value="info" />
            <Tab label="쇼핑" value="shopping" />
            <Tab label="인테리어" value="interior" />
        
        </Tabs>

            {sectionMenus[activeSection].length > 1 && (
            <Tabs
                className="user-sub-tabs"
                value={activeMenu}
                onChange={changeSubMenu}
            >
                {sectionMenus[activeSection].map((menu) => (
                    <Tab
                        key={menu.key}
                        label={menu.label}
                        value={menu.key}
                    />
                ))}
            </Tabs>
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
                    onDeleteClick={() => setDeleteOpen(true)}
                    isCompanyUser={isCompanyUser}
                    goCompanyDashboard={goCompanyDashboard}
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
                {activeMenu === "inquiries" && <UserQuestionPage user={user} setQuestionCount={setQuestionCount} />}
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

                {/* {activeMenu === "delete" && (
                <UserDeletePage
                    user={user}
                    setLoginUser={setLoginUser}
                    setLoginInfo={setLoginInfo}
                    onCancel={()=> changeMenu("info")}
                />
                )} */}

                {activeMenu === "interior" && <InteriorMyPage user={user} />}
            </section>
            </main>
        </div>

        <UserDeletePage
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        user={user}
        setLoginInfo={setLoginInfo}
        setLoginUser={setLoginUser}
        />

        </>
        );
};

export default UserMyPage;

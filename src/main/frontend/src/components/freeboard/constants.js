
export const ADMIN_TYPE = "admin";


export const GUEST_ID = "Guest";
export const GUEST_NAME = "방문자";


export const WITHDRAWN_USER_NAME = "탈퇴한 회원";


export const PAGE_SIZE = 8;


export const getLoginUser = () => {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

/** 로그인 유저가 관리자(type=admin)인지 */
export const isAdminUser = (loginUser) =>
    !!loginUser && loginUser.type === ADMIN_TYPE;

/** 작성자 이름이 비어 있으면 "탈퇴한 회원" 으로 대체 */
export const resolveUserName = (userName) =>
    userName && userName.trim() ? userName : WITHDRAWN_USER_NAME;


const WRITE_PERMISSIONS = {
    user:    ["자유", "질문", "정보"],
    company: ["자유", "정보", "이벤트", "광고"],
    admin:   ["자유", "질문", "정보", "이벤트", "광고", "공지"],
};

export const getCategoryOptions = (userType) =>
    WRITE_PERMISSIONS[userType] || WRITE_PERMISSIONS.user;


export const getPermissions = (loginUser, target = null) => {
    const type       = loginUser?.type || "guest";
    const isLoggedIn = !!loginUser;
    const isAdmin    = isLoggedIn && type === ADMIN_TYPE;
    const isDeleted  = isLoggedIn && type === "deleted";

    // 작성자 본인 여부 (탈퇴 계정은 소유권 없음)
    const isOwner =
        isLoggedIn &&
        !isDeleted &&
        target != null &&
        String(loginUser.id) === String(target.userId);

    if (isDeleted) {
        // 탈퇴 계정: 읽기만 가능
        return {
            isLoggedIn, isAdmin: false, isOwner: false,
            canWrite: false, canEdit: false, canDelete: false,
            canLike: false, canComment: false, canReport: false,
            categoryOptions: [],
        };
    }

    return {
        isLoggedIn,
        isAdmin,
        isOwner,
        canWrite:   isLoggedIn,             
        canEdit:    isLoggedIn && (isAdmin || isOwner),
        canDelete:  isLoggedIn && (isAdmin || isOwner),
        canLike:    isLoggedIn,
        canComment: isLoggedIn,
        canReport:  isLoggedIn,
        categoryOptions: getCategoryOptions(type),
    };
};

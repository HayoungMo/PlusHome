/**
 * 자유게시판 공통 상수 / 유틸
 *  - 관리자 타입, 로그인 유저 파싱, 작성자 표시 등 모듈 내 공통 로직 모음.
 *  - UI/UX는 변경하지 않고 변수명·로직 일관화를 위해 분리.
 */

// USERS.TYPE = 'admin' 인 계정을 관리자로 본다.
export const ADMIN_TYPE = "admin";

// 게스트 사용자 표기 (백엔드 'Guest' 와 동일)
export const GUEST_ID = "Guest";
export const GUEST_NAME = "방문자";

// 탈퇴/이름 누락 시 표기
export const WITHDRAWN_USER_NAME = "탈퇴한 회원";

// 자유게시판 페이지 크기 — 백엔드 FreeBoardService.PAGE_SIZE 와 동일하게 유지
export const PAGE_SIZE = 8;

/**
 * localStorage 의 user 키를 파싱해서 반환한다.
 *  - JSON 파싱 실패/미존재 시 null
 */
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

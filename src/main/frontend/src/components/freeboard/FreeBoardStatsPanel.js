import React from "react";
import FreeBoardUserStatsPanel from "./FreeBoardUserStatsPanel";
import FreeBoardAdminStatsPanel from "./FreeBoardAdminStatsPanel";
import FreeBoardGuestStatsPanel from "./FreeBoardGuestStatsPanel";

/**
 * 권한별 사이드 패널 라우터
 * admin   → 관리자 전용 패널 (신고/숨김/통계)
 * 로그인   → 내 활동 요약 패널
 * 게스트   → 전체 인기글 패널
 */
const FreeBoardStatsPanel = ({ loginUser, isAdmin, onRefresh }) => {
    if (isAdmin) return <FreeBoardAdminStatsPanel onRefresh={onRefresh} />;
    if (loginUser) return <FreeBoardUserStatsPanel loginUser={loginUser} />;
    return <FreeBoardGuestStatsPanel />;
};

export default FreeBoardStatsPanel;
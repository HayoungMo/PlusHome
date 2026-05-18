import React from "react";
import FreeBoardUserStatsPanel from "./FreeBoardUserStatsPanel";
import FreeBoardAdminStatsPanel from "./FreeBoardAdminStatsPanel";
import FreeBoardGuestStatsPanel from "./FreeBoardGuestStatsPanel";


const FreeBoardStatsPanel = ({ loginUser, isAdmin, onRefresh }) => {
    if (isAdmin) return <FreeBoardAdminStatsPanel onRefresh={onRefresh} />;
    if (loginUser) return <FreeBoardUserStatsPanel loginUser={loginUser} />;
    return <FreeBoardGuestStatsPanel />;
};

export default FreeBoardStatsPanel;
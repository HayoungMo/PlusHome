import React from "react";
import FreeBoardUserStatsPanel from "./FreeBoardUserStatsPanel";
import FreeBoardAdminStatsPanel from "./FreeBoardAdminStatsPanel";

const FreeBoardStatsPanel = ({ loginUser, isAdmin, onRefresh }) => {
    if (!loginUser) return null;
    if (isAdmin) return <FreeBoardAdminStatsPanel onRefresh={onRefresh} />;
    return <FreeBoardUserStatsPanel loginUser={loginUser} />;
};

export default FreeBoardStatsPanel;
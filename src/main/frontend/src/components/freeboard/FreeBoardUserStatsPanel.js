import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, Typography, Divider, Box } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import StatsSection from "./StatsSection";
import FreeBoardStatsService from "../../service/freeBoardStatsService";

const FreeBoardUserStatsPanel = ({ loginUser }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        latest: [],
        latestCount: 0,
        topLiked: [],
        topLikedCount: 0,
        topCommented: [],
        topCommentedCount: 0,
    });

    useEffect(() => {
        if (!loginUser || !loginUser.id) return;
        let mounted = true;
        (async () => {
            const data = await FreeBoardStatsService.getUserStats(loginUser.id);
            if (mounted && data) setStats(data);
        })();
        return () => { mounted = false; };
    }, [loginUser]);

    if (!loginUser) return null;

    const goArticle = (item) => {
        if (item && item.boardId) navigate(`/freeboard/article/${item.boardId}`);
    };

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <PersonOutlineIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">
                    내 활동 요약
                </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <StatsSection
                title="내가 쓴 최신글"
                count={stats.latestCount}
                items={stats.latest}
                onItemClick={goArticle}
                emptyText="작성한 게시글이 없습니다."
                rightLabel={(it) => it.createdAt || ""}
            />

            <StatsSection
                title="내가 쓴 좋아요 많은 글"
                count={stats.topLikedCount}
                items={stats.topLiked}
                onItemClick={goArticle}
                emptyText="좋아요 받은 게시글이 없습니다."
                rightLabel={(it) => (
                    <>
                        <ThumbUpAltIcon sx={{ fontSize: 11 }} />
                        {it.likeCount ?? 0}
                    </>
                )}
            />

            <StatsSection
                title="내가 쓴 댓글 많은 글"
                count={stats.topCommentedCount}
                items={stats.topCommented}
                onItemClick={goArticle}
                emptyText="댓글 달린 게시글이 없습니다."
                rightLabel={(it) => (
                    <>
                        <ChatBubbleOutlineIcon sx={{ fontSize: 11 }} />
                        {it.commentCount ?? 0}
                    </>
                )}
            />
        </Paper>
    );
};

export default FreeBoardUserStatsPanel;

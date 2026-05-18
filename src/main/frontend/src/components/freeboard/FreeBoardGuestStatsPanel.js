import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, Typography, Divider, Box } from "@mui/material";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import StatsSection from "./StatsSection";
import FreeBoardStatsService from "../../service/freeBoardStatsService";

const FreeBoardGuestStatsPanel = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        topLiked: [],
        topLikedCount: 0,
        topCommented: [],
        topCommentedCount: 0,
    });

    useEffect(() => {
        let mounted = true;
        (async () => {
            const data = await FreeBoardStatsService.getPublicStats();
            if (mounted && data) {
                setStats({
                    topLiked: data.topLiked || [],
                    topLikedCount: data.topLikedCount || 0,
                    topCommented: data.topCommented || [],
                    topCommentedCount: data.topCommentedCount || 0,
                });
            }
        })();
        return () => { mounted = false; };
    }, []);

    const goArticle = (item) => {
        if (item?.boardId) navigate(`/freeboard/article/${item.boardId}`);
    };

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <WhatshotIcon fontSize="small" color="error" />
                <Typography variant="subtitle1" fontWeight="bold">
                    전체 인기글
                </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <StatsSection
                title="좋아요 많은 글"
                count={stats.topLikedCount}
                items={stats.topLiked}
                onItemClick={goArticle}
                emptyText="인기 게시글이 없습니다."
                rightLabel={(it) => (
                    <>
                        <ThumbUpAltIcon sx={{ fontSize: 11 }} />
                        {it.likeCount ?? 0}
                    </>
                )}
            />

            <StatsSection
                title="댓글 많은 글"
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

export default FreeBoardGuestStatsPanel;

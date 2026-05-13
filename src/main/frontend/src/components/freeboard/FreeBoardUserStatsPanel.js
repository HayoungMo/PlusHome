import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, Typography, Divider, Box } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

import StatsSection from "./StatsSection";
import FreeBoardStatsService from "../../service/freeBoardStatsService";

/**
 * 사이드 패널 - 로그인 일반 사용자용 
 * - 내가쓴 최신작성게시글 ( 갯수 )
 * - 내가쓴 좋아요많은게시글 ( 갯수 )
 * - 내가쓴 댓글많은게시글 ( 갯수 )
 *
 * props:
 *   loginUser : 로그인 유저 객체 (있어야 보임)
 */
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
            if (mounted) setStats(data);
        })();
        return () => {
            mounted = false;
        };
    }, [loginUser]);

    if (!loginUser) return null;

    const goArticle = (item) => {
        if (item && item.boardId) {
            navigate(`/freeboard/article/${item.boardId}`);
        }
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
                title="내가쓴 최신작성게시글"
                count={stats.latestCount}
                items={stats.latest}
                onItemClick={goArticle}
                emptyText="작성한 게시글이 없습니다."
                rightLabel={(it) => it.createdAt || ""}
            />

            <StatsSection
                title="내가쓴 좋아요많은게시글"
                count={stats.topLikedCount}
                items={stats.topLiked}
                onItemClick={goArticle}
                emptyText="좋아요 받은 게시글이 없습니다."
                rightLabel={(it) => `♥ ${it.likeCount ?? 0}`}
            />

            <StatsSection
                title="내가쓴 댓글많은게시글"
                count={stats.topCommentedCount}
                items={stats.topCommented}
                onItemClick={goArticle}
                emptyText="댓글 달린 게시글이 없습니다."
                rightLabel={(it) => `💬 ${it.commentCount ?? 0}`}
            />
        </Paper>
    );
};

export default FreeBoardUserStatsPanel;

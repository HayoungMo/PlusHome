import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Paper, Typography, Divider, Box, Stack, Chip,
    List, ListItem, ListItemText, Button,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ReportIcon from "@mui/icons-material/Report";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import StatsSection from "./StatsSection";
import FreeBoardStatsService from "../../service/freeBoardStatsService";
import { exportDangerExcel } from "./dangerExport";
import SnackbarAlert from "../SnackbarAlert";

const FreeBoardAdminStatsPanel = ({ onRefresh }) => {
    const navigate = useNavigate();
    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
    const showSnack = (message, severity = "success") => setSnack({ open: true, message, severity });
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    const [stats, setStats] = useState({
        latest: [],
        latestCount: 0,
        topLiked: [],
        topLikedCount: 0,
        topCommented: [],
        topCommentedCount: 0,
        reportedPosts: [],
        reportedPostsCount: 0,
        reportedComments: [],
        reportedCommentsCount: 0,
    });

    const loadStats = useCallback(async () => {
        const data = await FreeBoardStatsService.getAdminStats();
        if (data) setStats(data);
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const goArticle = (item) => {
        if (item && item.boardId) navigate(`/freeboard/article/${item.boardId}`);
    };

    const exportDanger = async (overrides) => {
        const snapshot = {
            reportedPosts: overrides?.reportedPosts ?? stats.reportedPosts ?? [],
            reportedComments: overrides?.reportedComments ?? stats.reportedComments ?? [],
        };
        try {
            await exportDangerExcel(snapshot);
        } catch (e) {
            console.warn("danger.xlsx 내보내기 실패:", e);
        }
    };

    const handleTogglePostHidden = async (post) => {
        if (!post?.boardId) return;
        const next = !post.hidden;
        const ok = await FreeBoardStatsService.togglePostHidden(post.boardId, next);
        if (ok !== null) {
            const nextReportedPosts = stats.reportedPosts.map((p) =>
                p.boardId === post.boardId ? { ...p, hidden: next } : p
            );
            setStats((prev) => ({ ...prev, reportedPosts: nextReportedPosts }));
            if (next) {
                showSnack("관리자에 의해 게시글이 숨김 처리되었습니다.", "warning");
                await exportDanger({ reportedPosts: nextReportedPosts });
            }
            if (onRefresh) onRefresh();
        }
    };

    const handleToggleCommentHidden = async (cmt) => {
        if (!cmt?.commentId) {
            showSnack("유효하지 않은 댓글 데이터입니다.", "error");
            return;
        }
        const next = !cmt.hidden;
        const ok = await FreeBoardStatsService.toggleCommentHidden(cmt.commentId, next);
        if (ok !== null) {
            const nextReportedComments = stats.reportedComments.map((c) =>
                c.commentId === cmt.commentId ? { ...c, hidden: next } : c
            );
            setStats((prev) => ({ ...prev, reportedComments: nextReportedComments }));
            if (next) {
                showSnack("관리자에 의해 댓글이 숨김 처리되었습니다.", "warning");
                await exportDanger({ reportedComments: nextReportedComments });
            }
            if (onRefresh) onRefresh();
        }
    };

    return (
        <>
        <SnackbarAlert open={snack.open} message={snack.message} severity={snack.severity} onClose={closeSnack} />
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <AdminPanelSettingsIcon fontSize="small" color="error" />
                <Typography variant="subtitle1" fontWeight="bold">관리자 통계</Typography>
                <Chip label="관리자 모드" color="error" size="small" />
            </Box>
            <Divider sx={{ mb: 2 }} />

            <StatsSection
                title="최신작성게시글"
                count={stats.latestCount}
                items={stats.latest}
                onItemClick={goArticle}
                emptyText="게시글이 없습니다."
                rightLabel={(it) => it.createdAt || ""}
            />
            <StatsSection
                title="좋아요많은게시글"
                count={stats.topLikedCount}
                items={stats.topLiked}
                onItemClick={goArticle}
                emptyText="좋아요 받은 게시글이 없습니다."
                rightLabel={(it) => (
                    <><ThumbUpAltIcon sx={{ fontSize: 11 }} />{it.likeCount ?? 0}</>
                )}
            />
            <StatsSection
                title="댓글많은게시글"
                count={stats.topCommentedCount}
                items={stats.topCommented}
                onItemClick={goArticle}
                emptyText="댓글 달린 게시글이 없습니다."
                rightLabel={(it) => (
                    <><ChatBubbleOutlineIcon sx={{ fontSize: 11 }} />{it.commentCount ?? 0}</>
                )}
            />

            {/* 신고 게시글 */}
            <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <ReportIcon fontSize="small" color="warning" />
                    <Typography variant="subtitle2" fontWeight="bold">신고게시글</Typography>
                    <Chip
                        label={`${stats.reportedPostsCount}개`}
                        size="small" color="warning" variant="outlined"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                </Stack>
                {stats.reportedPosts.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                        신고된 게시글이 없습니다.
                    </Typography>
                ) : (
                    <List dense disablePadding>
                        {stats.reportedPosts.map((p, idx) => (
                            <ListItem
                                key={p.boardId ? `reported-post-${p.boardId}` : `post-fallback-${idx}`}
                                sx={{ py: 0.25, px: 0.5 }}
                                secondaryAction={
                                    <Button
                                        size="small"
                                        color={p.hidden ? "success" : "warning"}
                                        variant="outlined"
                                        onClick={() => handleTogglePostHidden(p)}
                                        sx={{ minWidth: 0, px: 1, fontSize: "0.65rem" }}
                                    >
                                        {p.hidden ? "복원" : "숨김"}
                                    </Button>
                                }
                            >
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="caption" noWrap
                                            onClick={() => goArticle(p)}
                                            sx={{
                                                cursor: "pointer",
                                                textDecoration: p.hidden ? "line-through" : "none",
                                                color: p.hidden ? "text.disabled" : "text.primary",
                                                maxWidth: 140, display: "inline-block",
                                            }}
                                        >
                                            {p.title || `#${p.boardId}`}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            신고 {p.reportCount ?? 0}회
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>

            {/* 신고 댓글 */}
            <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <ReportIcon fontSize="small" color="warning" />
                    <Typography variant="subtitle2" fontWeight="bold">신고댓글·대댓글</Typography>
                    <Chip
                        label={`${stats.reportedCommentsCount}개`}
                        size="small" color="warning" variant="outlined"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                </Stack>
                {stats.reportedComments.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                        신고된 댓글이 없습니다.
                    </Typography>
                ) : (
                    <List dense disablePadding>
                        {stats.reportedComments.map((c, idx) => (
                            <ListItem
                                key={c.commentId ? `reported-cmt-${c.commentId}` : `cmt-fallback-${idx}`}
                                sx={{ py: 0.25, px: 0.5 }}
                                secondaryAction={
                                    <Button
                                        size="small"
                                        color={c.hidden ? "success" : "warning"}
                                        variant="outlined"
                                        onClick={() => handleToggleCommentHidden(c)}
                                        sx={{ minWidth: 0, px: 1, fontSize: "0.65rem" }}
                                    >
                                        {c.hidden ? "복원" : "숨김"}
                                    </Button>
                                }
                            >
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="caption" noWrap
                                            onClick={() => c.boardId && goArticle({ boardId: c.boardId })}
                                            sx={{
                                                cursor: "pointer",
                                                textDecoration: c.hidden ? "line-through" : "none",
                                                color: c.hidden ? "text.disabled" : "text.primary",
                                                maxWidth: 140, display: "inline-block",
                                            }}
                                        >
                                            {c.parentId ? "└ " : ""}
                                            {c.title || `#${c.commentId || "No ID"}`}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            신고 {c.reportCount ?? 0}회
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Paper>
        </>
    );
};

export default FreeBoardAdminStatsPanel;
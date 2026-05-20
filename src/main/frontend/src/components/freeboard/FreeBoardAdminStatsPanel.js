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
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import StatsSection from "./StatsSection";
import FreeBoardStatsService from "../../service/freeBoardStatsService";
import { exportDangerExcel } from "./dangerExport";
import SnackbarAlert from "../SnackbarAlert";

const AUTO_HIDE_THRESHOLD = 3; // 신고 3회 이상 자동숨김

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

    /* 신고 항목 렌더러 (게시글 / 댓글 공통) */
    const ReportedItem = ({ item, isComment, onToggle }) => {
        const isAutoHidden = !!item.hidden && (item.reportCount ?? 0) >= AUTO_HIDE_THRESHOLD;
        return (
            <ListItem
                disableGutters
                sx={{
                    py: 0.5,
                    px: 0.5,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 0.5,
                    borderBottom: "1px solid #f0f0f0",
                }}
            >
               
                <Box
                    sx={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                    onClick={() => isComment
                        ? (item.boardId && goArticle({ boardId: item.boardId }))
                        : goArticle(item)
                    }
                >
                    <Typography
                        variant="caption"
                        sx={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textDecoration: item.hidden ? "line-through" : "none",
                            color: item.hidden ? "text.disabled" : "text.primary",
                        }}
                    >
                        {isComment && item.parentId ? "└ " : ""}
                        {isComment
                            ? (item.title || `#${item.commentId || "No ID"}`)
                            : (item.title || `#${item.boardId}`)
                        }
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.2 }}>
                        <Typography variant="caption" color="text.secondary">
                            신고 {item.reportCount ?? 0}회
                        </Typography>
                        
                        {isAutoHidden && (
                            <Chip
                                icon={<AutoFixHighIcon sx={{ fontSize: "0.65rem !important" }} />}
                                label="자동숨김"
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{ height: 16, fontSize: "0.6rem", px: 0.3 }}
                            />
                        )}
                    </Stack>
                </Box>

               
                <Button
                    size="small"
                    color={item.hidden ? "success" : "warning"}
                    variant="outlined"
                    onClick={() => onToggle(item)}
                    sx={{ flexShrink: 0, minWidth: 44, px: 0.8, fontSize: "0.65rem", lineHeight: 1.4 }}
                >
                    {item.hidden ? "복원" : "숨김"}
                </Button>
            </ListItem>
        );
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
                                <ReportedItem
                                    key={p.boardId ? `rp-${p.boardId}` : `rp-${idx}`}
                                    item={p}
                                    isComment={false}
                                    onToggle={handleTogglePostHidden}
                                />
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
                                <ReportedItem
                                    key={c.commentId ? `rc-${c.commentId}` : `rc-${idx}`}
                                    item={c}
                                    isComment={true}
                                    onToggle={handleToggleCommentHidden}
                                />
                            ))}
                        </List>
                    )}
                </Box>
            </Paper>
        </>
    );
};

export default FreeBoardAdminStatsPanel;

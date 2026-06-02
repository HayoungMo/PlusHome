import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/freeboard.css";
import FreeBoardService from "../service/freeBoardService";
import FreeBoardStatsService from "../service/freeBoardStatsService";
import ConfirmDialog from "../components/ConfirmDialog";
import SnackbarAlert from "../components/SnackbarAlert";
import {
    Container, Typography, Button, Box, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Pagination, Chip, Checkbox, Divider, List, ListItem, ListItemButton, ListItemText,
    TextField, MenuItem, Select, FormControl, InputLabel, Popover, IconButton,
    Snackbar, Alert,
} from "@mui/material";
import {
    Create as CreateIcon,
    DeleteSweep as DeleteSweepIcon,
    Visibility as VisibilityIcon,
    ThumbUp as ThumbUpIcon,
    ChatBubbleOutline as ChatBubbleOutlineIcon,
    Label as LabelIcon,
    Search as SearchIcon,
    CalendarToday as CalendarTodayIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    PersonOutline as PersonOutlineIcon,
    ThumbUpAlt as ThumbUpAltIcon,
    ChatBubbleOutline as CommentIcon,
    Whatshot as WhatshotIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    Report as ReportIcon,
    AutoFixHigh as AutoFixHighIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// ── 인라인 유틸 (components/freeboard/constants 제거) ─────────────
const PAGE_SIZE = 8;
const getLoginUser = () => {
    try { const r = localStorage.getItem("user"); return r ? JSON.parse(r) : null; }
    catch { return null; }
};
const isAdminUser   = (u) => !!u && u.type === "admin";
const resolveUserName = (n) => n && n.trim() ? n : "탈퇴한 회원";

// ── dangerExport 인라인 (components/freeboard/dangerExport 제거) ──
const _postRow = (p) => ({ boardId: p.boardId ?? "", userId: p.userId ?? "", userName: p.userName ?? "", category: p.category ?? "", title: p.title ?? "", viewCount: p.viewCount ?? 0, likeCount: p.likeCount ?? 0, commentCount: p.commentCount ?? 0, hidden: p.hidden ? 1 : 0, reportCount: p.reportCount ?? 0, createdAt: p.createdAt ?? "" });
const _commentRow = (c) => ({ commentId: c.commentId ?? "", boardId: c.boardId ?? "", userId: c.userId ?? "", userName: c.userName ?? "", content: c.content ?? "", hidden: c.hidden ? 1 : 0, reportCount: c.reportCount ?? 0, createdAt: c.createdAt ?? "" });
const _csvEscape = (v) => { if (v == null) return ""; const s = String(v).replace(/"/g, '""'); return /[",\n\r]/.test(s) ? `"${s}"` : s; };
const _buildCsv = (rows) => { if (!rows?.length) return ""; const h = Object.keys(rows[0]); return h.join(",") + "\n" + rows.map((r) => h.map((k) => _csvEscape(r[k])).join(",")).join("\n"); };
const _downloadBlob = (blob, name) => { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); };
const exportDangerExcel = async ({ reportedPosts = [], reportedComments = [] }) => {
    try {
        const XLSX = await import("xlsx");
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportedPosts.map(_postRow).length ? reportedPosts.map(_postRow) : [{ title: "(신고된 게시글 없음)" }]), "신고게시글");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportedComments.map(_commentRow).length ? reportedComments.map(_commentRow) : [{ content: "(신고된 댓글 없음)" }]), "신고댓글");
        XLSX.writeFile(wb, "black.xlsx"); return { ok: true, format: "xlsx" };
    } catch { /* fallback CSV */ }
    const bom = "﻿";
    const blob = new Blob([bom + "[신고게시글]\n" + _buildCsv(reportedPosts.map(_postRow)) + "\n\n[신고댓글]\n" + _buildCsv(reportedComments.map(_commentRow))], { type: "text/csv;charset=utf-8;" });
    _downloadBlob(blob, "black.csv"); return { ok: true, format: "csv" };
};

// ── StatsSection (components/freeboard/StatsSection 인라인) ───────
const PREVIEW_COUNT = 3;
const StatsSection = ({ title, count = 0, items = [], onItemClick, emptyText = "데이터가 없습니다.", rightLabel }) => {
    const [expanded, setExpanded] = useState(false);
    const [hiddenSnack, setHiddenSnack] = useState(false);
    const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);
    const hasMore = items.length > PREVIEW_COUNT;
    const handleClick = (it) => { if (it.hidden) { setHiddenSnack(true); return; } onItemClick && onItemClick(it); };
    return (
        <Box sx={{ mb: 1.5 }}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                <Typography className="stats-section-title">{title}</Typography>
                <Chip label={`${count}`} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: "0.65rem", px: 0.5 }} />
            </Stack>
            {items.length === 0 ? (
                <Typography className="stats-empty-text">{emptyText}</Typography>
            ) : (
                <List dense disablePadding>
                    {visible.map((it) => (
                        <ListItemButton key={it.boardId || it.commentId} onClick={() => handleClick(it)} sx={{ py: 0.25, px: 0.5 }}>
                            <ListItemText primary={
                                <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 0.5 }}>
                                    <Typography className={`stats-ellipsis-text${it.hidden ? " stats-item-hidden" : ""}`} variant="caption" sx={{ flex: 1, minWidth: 0 }}>{it.title || it.content}</Typography>
                                    {rightLabel && <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, flexShrink: 0, fontSize: "0.7rem", color: "text.secondary", ml: "auto" }}>{rightLabel(it)}</Box>}
                                </Box>
                            } />
                        </ListItemButton>
                    ))}
                </List>
            )}
            {hasMore && (
                <Button size="small" variant="text" endIcon={expanded ? <ExpandLessIcon fontSize="inherit" /> : <ExpandMoreIcon fontSize="inherit" />} onClick={() => setExpanded((p) => !p)} sx={{ fontSize: "0.7rem", color: "#4b6bbb", mt: 0.3, p: 0, minWidth: 0 }}>
                    {expanded ? "접기" : `더보기 (${items.length - PREVIEW_COUNT}개 더)`}
                </Button>
            )}
            <Snackbar open={hiddenSnack} autoHideDuration={3000} onClose={() => setHiddenSnack(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={() => setHiddenSnack(false)} severity="warning">관리자에 의해 비공개 처리 되었습니다.</Alert>
            </Snackbar>
        </Box>
    );
};

// ── FreeBoardGuestStatsPanel 인라인 ───────────────────────────────
const FreeBoardGuestStatsPanel = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ topLiked: [], topLikedCount: 0, topCommented: [], topCommentedCount: 0 });
    const hasFetched = useRef(false);
    useEffect(() => {
        if (hasFetched.current) return; hasFetched.current = true;
        FreeBoardStatsService.getPublicStats().then((d) => { if (d) setStats({ topLiked: d.topLiked || [], topLikedCount: d.topLikedCount || 0, topCommented: d.topCommented || [], topCommentedCount: d.topCommentedCount || 0 }); });
    }, []);
    const go = (it) => it?.boardId && navigate(`/freeboard/article/${it.boardId}`);
    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" gap={1} mb={1}><WhatshotIcon fontSize="small" color="error" /><Typography variant="subtitle1" fontWeight="bold">전체 인기글</Typography></Stack>
            <Divider sx={{ mb: 2 }} />
            <StatsSection title="좋아요 많은 글" count={stats.topLikedCount} items={stats.topLiked} onItemClick={go} emptyText="인기 게시글이 없습니다." rightLabel={(it) => <><ThumbUpAltIcon sx={{ fontSize: 11 }} />{it.likeCount ?? 0}</>} />
            <StatsSection title="댓글 많은 글" count={stats.topCommentedCount} items={stats.topCommented} onItemClick={go} emptyText="댓글 달린 게시글이 없습니다." rightLabel={(it) => <><CommentIcon sx={{ fontSize: 11 }} />{it.commentCount ?? 0}</>} />
        </Paper>
    );
};

// ── FreeBoardUserStatsPanel 인라인 ────────────────────────────────
const FreeBoardUserStatsPanel = ({ loginUser }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ latest: [], latestCount: 0, topLiked: [], topLikedCount: 0, topCommented: [], topCommentedCount: 0 });
    const lastFetchedId = useRef(null);
    useEffect(() => {
        if (!loginUser?.id || lastFetchedId.current === loginUser.id) return;
        lastFetchedId.current = loginUser.id;
        FreeBoardStatsService.getUserStats(loginUser.id).then((d) => { if (d) setStats(d); });
    }, [loginUser]);
    const go = (it) => it?.boardId && navigate(`/freeboard/article/${it.boardId}`);
    if (!loginUser) return null;
    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" gap={1} mb={1}><PersonOutlineIcon fontSize="small" color="primary" /><Typography variant="subtitle1" fontWeight="bold">내 활동 요약</Typography></Stack>
            <Divider sx={{ mb: 2 }} />
            <StatsSection title="내가 쓴 최신글" count={stats.latestCount} items={stats.latest} onItemClick={go} emptyText="작성한 게시글이 없습니다." rightLabel={(it) => it.createdAt || ""} />
            <StatsSection title="좋아요 많은 내 글" count={stats.topLikedCount} items={stats.topLiked} onItemClick={go} emptyText="좋아요 받은 게시글이 없습니다." rightLabel={(it) => <><ThumbUpAltIcon sx={{ fontSize: 11 }} />{it.likeCount ?? 0}</>} />
            <StatsSection title="댓글 많은 내 글" count={stats.topCommentedCount} items={stats.topCommented} onItemClick={go} emptyText="댓글 달린 게시글이 없습니다." rightLabel={(it) => <><CommentIcon sx={{ fontSize: 11 }} />{it.commentCount ?? 0}</>} />
        </Paper>
    );
};

// ── FreeBoardAdminStatsPanel 인라인 ──────────────────────────────
const AUTO_HIDE_THRESHOLD = 3;
const FreeBoardAdminStatsPanel = ({ onRefresh }) => {
    const navigate = useNavigate();
    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
    const showSnack = (msg, sev = "success") => setSnack({ open: true, message: msg, severity: sev });
    const [stats, setStats] = useState({ latest: [], latestCount: 0, topLiked: [], topLikedCount: 0, topCommented: [], topCommentedCount: 0, reportedPosts: [], reportedPostsCount: 0, reportedComments: [], reportedCommentsCount: 0 });
    const hasFetched = useRef(false);
    const loadStats = useCallback(async () => { const d = await FreeBoardStatsService.getAdminStats(); if (d) setStats(d); }, []);
    useEffect(() => { if (hasFetched.current) return; hasFetched.current = true; loadStats(); }, [loadStats]);
    const go = (it) => it?.boardId && navigate(`/freeboard/article/${it.boardId}`);

    const handleTogglePost = async (post) => {
        const next = !post.hidden;
        const ok = await FreeBoardStatsService.togglePostHidden(post.boardId, next);
        if (ok !== null) {
            const updated = stats.reportedPosts.map((p) => p.boardId === post.boardId ? { ...p, hidden: next } : p);
            setStats((prev) => ({ ...prev, reportedPosts: updated }));
            if (next) { showSnack("게시글이 숨김 처리되었습니다.", "warning"); exportDangerExcel({ reportedPosts: updated, reportedComments: stats.reportedComments }); }
            if (onRefresh) onRefresh();
        }
    };
    const handleToggleComment = async (cmt) => {
        if (!cmt?.commentId) { showSnack("유효하지 않은 댓글 데이터입니다.", "error"); return; }
        const next = !cmt.hidden;
        const ok = await FreeBoardStatsService.toggleCommentHidden(cmt.commentId, next);
        if (ok !== null) {
            const updated = stats.reportedComments.map((c) => c.commentId === cmt.commentId ? { ...c, hidden: next } : c);
            setStats((prev) => ({ ...prev, reportedComments: updated }));
            if (next) { showSnack("댓글이 숨김 처리되었습니다.", "warning"); exportDangerExcel({ reportedPosts: stats.reportedPosts, reportedComments: updated }); }
            if (onRefresh) onRefresh();
        }
    };
    const ReportedItem = ({ item, isComment, onToggle }) => {
        const isAutoHidden = !!item.hidden && (item.reportCount ?? 0) >= AUTO_HIDE_THRESHOLD;
        return (
            <ListItem disableGutters sx={{ py: 0.5, px: 0.5, display: "flex", alignItems: "flex-start", gap: 0.5, borderBottom: "1px solid #f0f0f0" }}>
                <Box sx={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => isComment ? (item.boardId && go({ boardId: item.boardId })) : go(item)}>
                    <Typography variant="caption" sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: item.hidden ? "line-through" : "none", color: item.hidden ? "text.disabled" : "text.primary" }}>
                        {isComment ? (item.title || `#${item.commentId}`) : (item.title || `#${item.boardId}`)}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.2 }}>
                        <Typography variant="caption" color="text.secondary">신고 {item.reportCount ?? 0}회</Typography>
                        {isAutoHidden && <Chip icon={<AutoFixHighIcon sx={{ fontSize: "0.65rem !important" }} />} label="자동숨김" size="small" color="warning" variant="outlined" sx={{ height: 16, fontSize: "0.6rem", px: 0.3 }} />}
                    </Stack>
                </Box>
                <Button size="small" color={item.hidden ? "success" : "warning"} variant="outlined" onClick={() => onToggle(item)} sx={{ flexShrink: 0, minWidth: 44, px: 0.8, fontSize: "0.65rem" }}>
                    {item.hidden ? "복원" : "숨김"}
                </Button>
            </ListItem>
        );
    };
    return (
        <>
            <SnackbarAlert open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((p) => ({ ...p, open: false }))} />
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" gap={1} mb={1}>
                    <AdminPanelSettingsIcon fontSize="small" color="error" />
                    <Typography variant="subtitle1" fontWeight="bold">관리자 통계</Typography>
                    <Chip label="관리자 모드" color="error" size="small" />
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <StatsSection title="최신 게시글" count={stats.latestCount} items={stats.latest} onItemClick={go} emptyText="게시글이 없습니다." rightLabel={(it) => it.createdAt || ""} />
                <StatsSection title="좋아요 많은 글" count={stats.topLikedCount} items={stats.topLiked} onItemClick={go} emptyText="좋아요 받은 게시글이 없습니다." rightLabel={(it) => <><ThumbUpAltIcon sx={{ fontSize: 11 }} />{it.likeCount ?? 0}</>} />
                <StatsSection title="댓글 많은 글" count={stats.topCommentedCount} items={stats.topCommented} onItemClick={go} emptyText="댓글 달린 게시글이 없습니다." rightLabel={(it) => <><CommentIcon sx={{ fontSize: 11 }} />{it.commentCount ?? 0}</>} />
                <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <ReportIcon fontSize="small" color="warning" />
                        <Typography variant="subtitle2" fontWeight="bold">신고게시글</Typography>
                        <Chip label={`${stats.reportedPostsCount}개`} size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
                    </Stack>
                    {stats.reportedPosts.length === 0 ? <Typography variant="caption" color="text.secondary">신고된 게시글이 없습니다.</Typography>
                        : <List dense disablePadding>{stats.reportedPosts.map((p, i) => <ReportedItem key={p.boardId || i} item={p} isComment={false} onToggle={handleTogglePost} />)}</List>}
                </Box>
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <ReportIcon fontSize="small" color="warning" />
                        <Typography variant="subtitle2" fontWeight="bold">신고댓글</Typography>
                        <Chip label={`${stats.reportedCommentsCount}개`} size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
                    </Stack>
                    {stats.reportedComments.length === 0 ? <Typography variant="caption" color="text.secondary">신고된 댓글이 없습니다.</Typography>
                        : <List dense disablePadding>{stats.reportedComments.map((c, i) => <ReportedItem key={c.commentId || i} item={c} isComment onToggle={handleToggleComment} />)}</List>}
                </Box>
            </Paper>
        </>
    );
};

// ── FreeBoardStatsPanel (라우터) 인라인 ──────────────────────────
const FreeBoardStatsPanel = ({ loginUser, isAdmin, onRefresh }) => {
    if (isAdmin) return <FreeBoardAdminStatsPanel onRefresh={onRefresh} />;
    if (loginUser) return <FreeBoardUserStatsPanel loginUser={loginUser} />;
    return <FreeBoardGuestStatsPanel />;
};

// ── 유틸 ──────────────────────────────────────────────────────
const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const created = new Date(dateStr);
    if (isNaN(created.getTime())) return dateStr;
    const diffMs  = Date.now() - created.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1)  return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr  < 24) return `${diffHr}시간 전`;
    return dateStr.slice(0, 10);
};

const isNew = (dateStr) => {
    if (!dateStr) return false;
    const created = new Date(dateStr);
    return !isNaN(created.getTime()) && Date.now() - created.getTime() < 86400000;
};

const categoryColor = (cat) => {
    switch (cat) {
        case "공지":   return "error";
        case "질문":   return "warning";
        case "정보":   return "info";
        case "자유":   return "success";
        case "이벤트": return "secondary";
        case "광고":   return "primary";
        default:       return "default";
    }
};

// ── 검색 필터 ──────────────────────────────────────────────────
const SearchFilter = ({ params, onSearch, onCategoryChange, onDateSearch }) => {
    const [inputValue, setInputValue] = useState(params.searchValue ?? "");
    const [startDate, setStartDate]   = useState(params.startDate ? dayjs(params.startDate) : null);
    const [endDate, setEndDate]       = useState(params.endDate   ? dayjs(params.endDate)   : null);
    const [dateAnchor, setDateAnchor] = useState(null);

    useEffect(() => { setInputValue(params.searchValue ?? ""); }, [params.searchValue]);

    const handleSearchSubmit = () => onSearch({ value: inputValue, key: "title" });

    const handleDateReset = () => {
        setStartDate(null);
        setEndDate(null);
        onDateSearch({ startDate: "", endDate: "" });
    };

    const handleDateApply = () => {
        onDateSearch({
            startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
            endDate:   endDate   ? endDate.format("YYYY-MM-DD")   : "",
        });
        setDateAnchor(null);
    };

    const hasActiveDates = !!(startDate || endDate);

    return (
        <Paper className="fb-search-paper">
            <div className="fb-search-row">
                <IconButton
                    className={`fb-date-icon-btn${hasActiveDates ? " is-active" : ""}`}
                    onClick={(e) => setDateAnchor(e.currentTarget)}
                    title="기간 검색"
                >
                    <CalendarTodayIcon fontSize="small" />
                    {hasActiveDates && <span className="fb-date-active-dot" />}
                </IconButton>

                <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>카테고리</InputLabel>
                    <Select value={params.category} label="카테고리"
                        onChange={(e) => onCategoryChange(e.target.value)}>
                        <MenuItem value="">전체</MenuItem>
                        <MenuItem value="자유">자유</MenuItem>
                        <MenuItem value="질문">질문</MenuItem>
                        <MenuItem value="정보">정보</MenuItem>
                        <MenuItem value="광고">광고</MenuItem>
                        <MenuItem value="이벤트">이벤트</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    size="small"
                    placeholder="검색어를 입력하세요"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                    sx={{ flexGrow: 1 }}
                />

                <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleSearchSubmit}
                    className="fb-search-btn"
                >
                    검색
                </Button>
            </div>

            {hasActiveDates && (
                <div className="fb-date-active-row">
                    <Typography variant="caption" className="fb-date-active-label">
                        기간: {startDate ? startDate.format("YYYY-MM-DD") : "시작일"} ~ {endDate ? endDate.format("YYYY-MM-DD") : "종료일"}
                    </Typography>
                    <Button size="small" variant="text" onClick={handleDateReset} className="fb-date-reset-btn">
                        초기화
                    </Button>
                </div>
            )}

            <Popover
                open={Boolean(dateAnchor)}
                anchorEl={dateAnchor}
                onClose={() => setDateAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{ sx: { p: 2, border: "1px solid #c5d4f0", borderRadius: 2, mt: 0.5 } }}
            >
                <Typography variant="caption" className="fb-date-popover-title">기간 검색</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Stack spacing={1.5}>
                        <DatePicker label="시작일" value={startDate} onChange={setStartDate}
                            format="YYYY.MM.DD" maxDate={endDate || undefined}
                            slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }} />
                        <DatePicker label="종료일" value={endDate} onChange={setEndDate}
                            format="YYYY.MM.DD" minDate={startDate || undefined}
                            slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }} />
                        <div className="fb-popover-btn-row">
                            {hasActiveDates && (
                                <Button size="small" variant="text"
                                    onClick={() => { setStartDate(null); setEndDate(null); }}
                                    className="fb-popover-clear-btn">
                                    초기화
                                </Button>
                            )}
                            <Button size="small" variant="contained" onClick={handleDateApply}
                                className="fb-popover-search-btn">
                                기간검색
                            </Button>
                        </div>
                    </Stack>
                </LocalizationProvider>
            </Popover>
        </Paper>
    );
};

// ── 메인 컴포넌트 ──────────────────────────────────────────────
const FreeBoardListPage = () => {

    const navigate = useNavigate();
    const [posts, setPosts]             = useState([]);
    const [dataCount, setDataCount]     = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);
    const [params, setParams] = useState({
        pageNum: 1, searchKey: "title", searchValue: "",
        category: "", startDate: "", endDate: "",
    });
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

    const loginUser = useMemo(() => getLoginUser(), []);
    const isAdmin   = isAdminUser(loginUser);

    const showSnack  = (message, severity = "success") => setSnack({ open: true, message, severity });
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    const fetchPosts = useCallback(async () => {
        try {
            const data = await FreeBoardService.getLists(params);
            setPosts(
                (data.lists || []).map((post) => ({
                    ...post,
                    userName: resolveUserName(post.userName),
                }))
            );
            setDataCount(data.dataCount || 0);
            setSelectedIds([]);
        } catch {
            showSnack("목록 조회 실패", "error");
        }
    }, [params]);

    // StrictMode 이중 호출 방지:
    // fetchPosts는 params가 바뀔 때마다 새 함수 참조를 갖는다(useCallback).
    // lastFetchRef에 직전 참조를 저장해두고, 같은 참조로 재호출하면 skip.
    // → params 실제 변경 시엔 새 참조이므로 정상 재조회.
    const lastFetchRef = useRef(null);
    useEffect(() => {
        if (lastFetchRef.current === fetchPosts) return;
        lastFetchRef.current = fetchPosts;
        fetchPosts();
    }, [fetchPosts]);

    const handleSearch         = ({ value, key }) =>
        setParams((p) => ({ ...p, pageNum: 1, searchValue: value, searchKey: key }));
    const handlePageChange     = (newPage) =>
        setParams((p) => ({ ...p, pageNum: newPage }));
    const handleCategoryChange = (category) =>
        setParams((p) => ({ ...p, pageNum: 1, category, searchValue: "" }));
    const handleDateSearch     = ({ startDate, endDate }) =>
        setParams((p) => ({ ...p, pageNum: 1, startDate, endDate }));

    const handleMultiDelete = () => {
        if (!loginUser)          { showSnack("로그인이 필요합니다.", "warning"); return; }
        if (!selectedIds.length) { showSnack("삭제할 게시글을 선택해주세요.", "warning"); return; }
        setDeleteDialog(true);
    };
    const handleMultiDeleteConfirm = async () => {
        setDeleteDialog(false);
        try {
            await FreeBoardService.deleteMulti(selectedIds);
            showSnack(`${selectedIds.length}개 게시글이 삭제되었습니다.`, "success");
            fetchPosts();
        } catch {
            showSnack("삭제 실패", "error");
        }
    };

    const visiblePosts    = isAdmin ? posts : posts.filter((p) => p.hidden !== 1);
    const allSelected     = visiblePosts.length > 0 && selectedIds.length === visiblePosts.length;
    const handleSelectAll = () =>
        setSelectedIds(allSelected ? [] : visiblePosts.map((p) => p.boardId));
    const handleSelectOne = (id) =>
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    const handleRowClick = (post) => {
        if (post.hidden === 1) {
            showSnack("관리자에 의해 비공개 처리 되었습니다.", "warning");
            return;
        }
        navigate(`/freeboard/article/${post.boardId}`);
    };

    return (
        <Container maxWidth="xl" className="fb-list-page">
            <div className="fb-list-grid">
                {/* 좌측: 목록 */}
                <div className="fb-list-left">
                    <div className="fb-list-header">
                        <Typography variant="h5" className="fb-list-title">자유게시판</Typography>
                        <div className="fb-header-btns">
                            {isAdmin && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteSweepIcon />}
                                    onClick={handleMultiDelete}
                                    disabled={selectedIds.length === 0}
                                >
                                    선택삭제 ({selectedIds.length})
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<CreateIcon />}
                                onClick={() => navigate("/freeboard/write")}
                                className="fb-write-btn"
                            >
                                글쓰기
                            </Button>
                        </div>
                    </div>

                    <SearchFilter
                        params={params}
                        onSearch={handleSearch}
                        onCategoryChange={handleCategoryChange}
                        onDateSearch={handleDateSearch}
                    />

                    <TableContainer component={Paper} className="fb-table-container">
                        <Table>
                            <TableHead className="fb-table-head">
                                <TableRow>
                                    {isAdmin && (
                                        <TableCell padding="checkbox" align="center">
                                            <Checkbox checked={allSelected} onChange={handleSelectAll} />
                                        </TableCell>
                                    )}
                                    <TableCell align="center" width="80">
                                        <LabelIcon fontSize="small" sx={{ verticalAlign: "middle" }} />
                                    </TableCell>
                                    <TableCell align="center" sx={{ minWidth: 200 }}>제목</TableCell>
                                    <TableCell align="center" width="100">작성자</TableCell>
                                    <TableCell align="center" width="60"><VisibilityIcon fontSize="small" /></TableCell>
                                    <TableCell align="center" width="60"><ThumbUpIcon fontSize="small" /></TableCell>
                                    <TableCell align="center" width="60"><ChatBubbleOutlineIcon fontSize="small" /></TableCell>
                                    <TableCell align="center" width="100">작성일</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {visiblePosts.length > 0 ? (
                                    visiblePosts.map((post) => (
                                        <TableRow
                                            key={post.boardId}
                                            hover
                                            className={`fb-table-row${post.hidden === 1 ? " is-hidden" : ""}`}
                                        >
                                            {isAdmin && (
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selectedIds.includes(post.boardId)}
                                                        onChange={() => handleSelectOne(post.boardId)}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <Chip
                                                    label={post.category || "자유"}
                                                    size="small"
                                                    color={categoryColor(post.category)}
                                                    variant="outlined"
                                                    sx={{ height: 20 }}
                                                />
                                                {post.hidden === 1 && (
                                                    <Chip label="숨김" size="small" variant="outlined" color="warning"
                                                        sx={{ ml: 0.5, height: 20 }} />
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className={`fb-title-cell${post.hidden === 1 ? " is-hidden" : ""}`}
                                                onClick={() => handleRowClick(post)}
                                            >
                                                <div className="fb-title-inner">
                                                    <Typography
                                                        variant="body2"
                                                        noWrap
                                                        className={`fb-title-text${post.category === "공지" ? " is-notice" : ""}${post.hidden === 1 ? " is-hidden" : ""}`}
                                                    >
                                                        {post.title}
                                                    </Typography>
                                                    {isNew(post.createdAt) && (
                                                        <Chip label="NEW" size="small" color="error" variant="outlined"
                                                            sx={{ height: 18, fontSize: "0.65rem", px: 0.5, fontWeight: "bold", flexShrink: 0 }} />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="fb-author-cell">
                                                {post.userId}
                                            </TableCell>
                                            <TableCell className="fb-stat-cell">{post.viewCount ?? 0}</TableCell>
                                            <TableCell className="fb-stat-cell">{post.likeCount ?? 0}</TableCell>
                                            <TableCell className="fb-stat-cell">{post.commentCount ?? 0}</TableCell>
                                            <TableCell className="fb-date-cell">
                                                {formatRelativeTime(post.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin ? 8 : 7} className="fb-empty-cell">
                                            게시글이 존재하지 않습니다.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <div className="fb-pagination-wrap">
                        <Pagination
                            className="fb-pagination"
                            count={Math.max(1, Math.ceil(dataCount / PAGE_SIZE))}
                            page={params.pageNum}
                            onChange={(_, p) => handlePageChange(p)}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </div>
                </div>

                {/* 우측: 통계 패널 */}
                <div className="fb-list-side">
                    <FreeBoardStatsPanel loginUser={loginUser} isAdmin={isAdmin} onRefresh={fetchPosts} />
                </div>
            </div>

            <ConfirmDialog
                open={deleteDialog}
                title="게시글 다중 삭제"
                message={`선택한 ${selectedIds.length}개의 게시글을 삭제할까요?`}
                confirmLabel="삭제"
                confirmColor="error"
                onConfirm={handleMultiDeleteConfirm}
                onClose={() => setDeleteDialog(false)}
            />

            <SnackbarAlert open={snack.open} message={snack.message} severity={snack.severity} onClose={closeSnack} />
        </Container>
    );
};

export default FreeBoardListPage;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container, Typography, Button, Box, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Pagination, Chip, Checkbox,
    Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel,
} from "@mui/material";
import {
    Create as CreateIcon,
    DeleteSweep as DeleteSweepIcon,
    Visibility as VisibilityIcon,
    ThumbUp as ThumbUpIcon,
    ChatBubbleOutline as ChatBubbleOutlineIcon,
} from "@mui/icons-material";
import { FreeBoardStatsPanel, PAGE_SIZE } from "./freeboard";
import SnackbarAlert from "./SnackbarAlert";
import FreeBoardPromoBanner from "./FreeBoardPromoBanner";
import FreeBoardSearchFilter from "./FreeBoardSearchFilter";

// 작성 시간 포맷 — 24시간 이내면 상대시간, 이후면 날짜
const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const created = new Date(dateStr);
    if (isNaN(created.getTime())) return dateStr;
    const diffMs  = Date.now() - created.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1)  return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHr  = Math.floor(diffMin / 60);
    if (diffHr  < 24) return `${diffHr}시간 전`;
    return dateStr.slice(0, 10);
};

// 24시간 이내 작성 여부
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

/* ──────────────────────────────────────────────────────────────
   FreeBoardListMui — 메인 목록 컨테이너
   (검색 필터: FreeBoardSearchFilter / 배너: FreeBoardPromoBanner)
   ────────────────────────────────────────────────────────────── */
const FreeBoardListMui = ({
    posts = [],
    dataCount,
    params,
    loginUser,
    isAdmin,
    onRefresh,
    selectedIds,
    setSelectedIds,
    onSearch,
    onPageChange,
    onCategoryChange,
    onDateSearch,
    onDelete,
}) => {
    const navigate = useNavigate();
    const [snack, setSnack] = useState({ open: false, message: "", severity: "warning" });

    // 운영원칙 모달 (NOTICE_ENABLED = false 로 끄기 가능)
    const NOTICE_ENABLED = true;
    const [noticeOpen, setNoticeOpen]       = useState(false);
    const [dontShowToday, setDontShowToday] = useState(false);

    useEffect(() => {
        if (!NOTICE_ENABLED) return;
        const today  = new Date().toDateString();
        const hidden = localStorage.getItem("freeboard_notice_hidden");
        if (hidden !== today) setNoticeOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNoticeClose = () => {
        if (dontShowToday) {
            localStorage.setItem("freeboard_notice_hidden", new Date().toDateString());
        }
        setNoticeOpen(false);
    };

    const showSnack  = (message, severity = "warning") => setSnack({ open: true, message, severity });
    const closeSnack = () => setSnack(prev => ({ ...prev, open: false }));

    const visiblePosts = isAdmin
        ? posts
        : posts.filter(post => post.hidden !== 1);

    const handleSelectAll = () => {
        if (visiblePosts.length > 0 && selectedIds.length === visiblePosts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(visiblePosts.map((p) => p.boardId));
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 240px" },
                gap: 2,
                alignItems: "flex-start",
            }}>
                {/* 좌측 — 목록 영역 */}
                <Box sx={{ minWidth: 0 }}>
                    {/* 헤더: 제목 + 글쓰기 버튼 */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: "#1e3a8a" }}>자유게시판</Typography>
                        <Stack direction="row" spacing={1}>
                            {isAdmin && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteSweepIcon />}
                                    onClick={onDelete}
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
                                sx={{ bgcolor: "#1e3a8a", "&:hover": { bgcolor: "#1a317a" } }}
                            >
                                글쓰기
                            </Button>
                        </Stack>
                    </Stack>

                    {/* 검색 필터 */}
                    <FreeBoardSearchFilter
                        params={params}
                        onSearch={onSearch}
                        onCategoryChange={onCategoryChange}
                        onDateSearch={onDateSearch}
                    />

                    {/* 게시글 테이블 */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#eef2fa" }}>
                                <TableRow>
                                    {isAdmin && (
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={visiblePosts.length > 0 && selectedIds.length === visiblePosts.length}
                                                onChange={handleSelectAll}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell align="center" width="80">카테고리</TableCell>
                                    <TableCell sx={{ minWidth: 200 }}>제목</TableCell>
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
                                            sx={{ backgroundColor: post.hidden === 1 ? "rgba(0,0,0,0.03)" : "inherit" }}
                                        >
                                            {isAdmin && (
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selectedIds.includes(post.boardId)}
                                                        onChange={() => handleSelectOne(post.boardId)}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell align="center">
                                                <Chip
                                                    label={post.category || "자유"}
                                                    size="small"
                                                    color={categoryColor(post.category)}
                                                    variant="outlined"
                                                    sx={{ height: 20 }}
                                                />
                                                {post.hidden === 1 && (
                                                    <Chip
                                                        label="숨김"
                                                        size="small"
                                                        variant="outlined"
                                                        color="warning"
                                                        sx={{ ml: 0.5, height: 20 }}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    minWidth: 200, maxWidth: 300, cursor: "pointer",
                                                    fontWeight:      post.category === "공지" ? "bold" : "normal",
                                                    textDecoration:  post.hidden === 1 ? "line-through" : "none",
                                                    color:           post.hidden === 1 ? "text.disabled" : "text.primary",
                                                }}
                                                onClick={() => {
                                                    if (post.hidden === 1) {
                                                        showSnack("관리자에 의해 비공개 처리 되었습니다.");
                                                        return;
                                                    }
                                                    navigate(`/freeboard/article/${post.boardId}`);
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, overflow: "hidden" }}>
                                                    <Typography
                                                        variant="body2"
                                                        noWrap
                                                        sx={{
                                                            fontWeight:     post.category === "공지" ? "bold" : "normal",
                                                            textDecoration: post.hidden === 1 ? "line-through" : "none",
                                                            color:          post.hidden === 1 ? "text.disabled" : "text.primary",
                                                            flex: 1, minWidth: 0,
                                                        }}
                                                    >
                                                        {post.title}
                                                    </Typography>
                                                    {isNew(post.createdAt) && (
                                                        <Chip
                                                            label="NEW"
                                                            size="small"
                                                            color="error"
                                                            variant="outlined"
                                                            sx={{ height: 18, fontSize: "0.65rem", px: 0.5, fontWeight: "bold", flexShrink: 0 }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="caption" display="block"
                                                    sx={{ color: "#1e3a8a", fontWeight: "bold", lineHeight: 1.2 }}>
                                                    {post.userId}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                                                {post.viewCount ?? 0}
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                                                {post.likeCount ?? 0}
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                                                {post.commentCount ?? 0}
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontSize: "0.85rem", color: "text.secondary", whiteSpace: "nowrap" }}>
                                                {formatRelativeTime(post.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin ? 8 : 7} align="center" sx={{ py: 5 }}>
                                            게시글이 존재하지 않습니다.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* 페이지네이션 */}
                    <Stack alignItems="center" sx={{ mt: 4 }}>
                        <Pagination
                            count={Math.max(1, Math.ceil(dataCount / PAGE_SIZE))}
                            page={params.pageNum}
                            onChange={(e, p) => onPageChange(p)}
                            color="primary"
                            showFirstButton
                            showLastButton
                            sx={{
                                "& .MuiPaginationItem-root.Mui-selected": {
                                    bgcolor: "#0019ff", color: "#fff",
                                    "&:hover": { bgcolor: "#1a317a" },
                                },
                                "& .MuiPaginationItem-root:hover": { bgcolor: "#eef2fa" },
                            }}
                        />
                    </Stack>

                    {/* 추천 상품 & 인테리어업체 배너 */}
                    <FreeBoardPromoBanner navigate={navigate} />
                </Box>

                {/* 우측 — 통계 패널 */}
                <Box sx={{ position: { md: "sticky" }, top: { md: 16 } }}>
                    <FreeBoardStatsPanel loginUser={loginUser} isAdmin={isAdmin} />
                </Box>
            </Box>

            {/* 운영원칙 공지 모달 */}
            <Dialog
                open={noticeOpen}
                onClose={handleNoticeClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2, border: "1px solid #c5d4f0" } }}
            >
                <DialogTitle sx={{ color: "#1e3a8a", fontWeight: "bold", borderBottom: "1px solid #eef2fa" }}>
                    📢 PlusHome 자유게시판 운영원칙
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        PlusHome은 게시물을 통해 자유롭게 의견을 나누는 공간입니다. 건전한 인터넷 문화 정착을 위해 아래 행위가 포함된 댓글은 <strong>별도의 예고 없이 삭제 또는 제한 조치</strong>될 수 있습니다.<br /><br />
                        <strong>[운영원칙]</strong><br />
                        1. 타인에 대한 욕설, 비방, 인신공격 또는 명예훼손<br />
                        2. 개인정보 유출, 사생활 침해 또는 불법정보 유출<br />
                        3. 음란성 내용 또는 음란물 링크<br />
                        4. 상업적 광고 또는 사이트/홈페이지 홍보<br />
                        5. 같은 내용의 반복(도배) 또는 게시물 관계없는 내용<br />
                        6. 지역감정, 폭력, 사행심 조장<br />
                        7. 언론보도 형식의 허위 게시물 또는 자살유발정보<br />
                        8. 혐오표현 또는 특정 집단에 대한 비하·조롱 표현<br /><br />
                        위반 정도가 심하거나 상습적인 경우 댓글 작성 권한이 제한될 수 있으며, 비정상적인 조회·추천 패턴 발생 시 ID/IP가 제재될 수 있습니다.<br /><br />
                        법률에 위반되는 댓글은 관계 법령에 의거 민형사상 처벌을 받을 수 있으니 이용에 각별한 주의를 부탁드립니다. PlusHome은 서로를 존중하는 건강한 소통문화를 지향합니다.<br /><br />
                        감사합니다.<br /><br />
                        - PlusHome 올림 -
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "space-between", px: 2, py: 1.5, borderTop: "1px solid #eef2fa" }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={dontShowToday}
                                onChange={(e) => setDontShowToday(e.target.checked)}
                                sx={{ color: "#aec4ed", "&.Mui-checked": { color: "#1e3a8a" } }}
                            />
                        }
                        label={<Typography variant="caption" sx={{ color: "#4b6bbb" }}>오늘 하루 보지 않기</Typography>}
                    />
                    <Button
                        size="small"
                        variant="contained"
                        onClick={handleNoticeClose}
                        sx={{ bgcolor: "#1e3a8a", "&:hover": { bgcolor: "#1a317a" } }}
                    >
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            <SnackbarAlert
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={closeSnack}
            />
        </Container>
    );
};

export default FreeBoardListMui;

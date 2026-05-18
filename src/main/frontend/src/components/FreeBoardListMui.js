import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container, Typography, Button, Box, Stack, TextField, MenuItem, Select,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Pagination, Chip, InputLabel, FormControl, Checkbox
} from "@mui/material";
import { 
    Create as CreateIcon, 
    Search as SearchIcon, 
    DeleteSweep as DeleteSweepIcon,
    Visibility as VisibilityIcon,
    ThumbUp as ThumbUpIcon,
    ChatBubbleOutline as ChatBubbleOutlineIcon,
} from "@mui/icons-material";
import { FreeBoardStatsPanel, PAGE_SIZE } from "./freeboard";
import FreeBoardStatsService from "../service/freeBoardStatsService";

// 작성 시간 포맷: 1일 이내 → "N분 전" / "N시간 전", 이후 → 날짜 그대로
const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const created = new Date(dateStr);
    if (isNaN(created.getTime())) return dateStr;
    const diffMs = Date.now() - created.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1)  return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24)  return `${diffHr}시간 전`;
    return dateStr;
};

// 24시간 이내 작성 여부
const isNew = (dateStr) => {
    if (!dateStr) return false;
    const created = new Date(dateStr);
    return !isNaN(created.getTime()) && Date.now() - created.getTime() < 86400000;
};

const categoryColor = (cat) => {
    switch (cat) {
        case "공지": return "error";
        case "질문": return "warning";
        case "정보": return "info";
        case "자유": return "success";
        case "이벤트": return "secondary";
        case "광고": return "primary";
        default: return "default";
    }
};

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
    onDelete 
}) => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState(params.searchValue);
    const [topLikedPosts, setTopLikedPosts] = useState([]);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);

    // 카테고리 변경·초기화 등 외부에서 searchValue가 바뀔 때 입력창 동기화
    useEffect(() => {
        setInputValue(params.searchValue);
    }, [params.searchValue]);

    useEffect(() => {
        const fetchTopLiked = async () => {
            try {
                const data = await FreeBoardStatsService.getPublicStats();
                setTopLikedPosts(data?.topLiked || []);
            } catch (err) {
                console.error("인기 게시글 조회 실패:", err);
            }
        };
        fetchTopLiked();
    }, []);

    const ROTATING_PLACEHOLDERS = topLikedPosts.length > 0
        ? topLikedPosts.slice(0, 5).map((post) => `실시간 인기글 : ${post.title}`)
        : ["검색어를 입력하세요"];

    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIdx((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
        }, 2000);
        return () => clearInterval(timer);
    }, [ROTATING_PLACEHOLDERS.length]);

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
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    md: "minmax(0, 1fr) 240px"
                },
                gap: 2,
                alignItems: "flex-start",
            }}>
                <Box sx={{ minWidth: 0 }}>
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

                    <Paper sx={{ p: 2, mb: 3, border: "1px solid #c5d4f0" }}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center">
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>카테고리</InputLabel>
                                <Select
                                    value={params.category}
                                    label="카테고리"
                                    onChange={(e) => onCategoryChange(e.target.value)}
                                >
                                    <MenuItem value="">전체</MenuItem>
                                    <MenuItem value="공지">공지</MenuItem>
                                    <MenuItem value="자유">자유</MenuItem>
                                    <MenuItem value="질문">질문</MenuItem>
                                    <MenuItem value="광고">광고</MenuItem>
                                    <MenuItem value="이벤트">이벤트</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                size="small"
                                placeholder={ROTATING_PLACEHOLDERS[placeholderIdx]}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && onSearch(inputValue)}
                                sx={{ flexGrow: 1 }}
                            />
                            {/* 검색 버튼 */}
                            <Button
                                variant="contained"
                                startIcon={<SearchIcon />}
                                onClick={() => onSearch(inputValue)}
                                sx={{ bgcolor: "#4b6bbb", "&:hover": { bgcolor: "#3a57a3" } }}
                            >
                                검색
                            </Button>
                        </Stack>
                    </Paper>

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
                                    <TableCell align="center" width="60">
                                        <VisibilityIcon fontSize="small" />
                                    </TableCell>
                                    <TableCell align="center" width="60">
                                        <ThumbUpIcon fontSize="small" />
                                    </TableCell>
                                    <TableCell align="center" width="60">
                                        <ChatBubbleOutlineIcon fontSize="small" />
                                    </TableCell>
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
                                                    <Chip label="숨김" size="small" variant="outlined" color="warning" sx={{ ml: 0.5, height: 20 }} />
                                                )}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    minWidth: 200,
                                                    maxWidth: 300,
                                                    cursor: "pointer",
                                                    fontWeight: post.category === "공지" ? "bold" : "normal",
                                                    textDecoration: post.hidden === 1 ? "line-through" : "none",
                                                    color: post.hidden === 1 ? "text.disabled" : "text.primary",
                                                }}
                                                onClick={() => navigate(`/freeboard/article/${post.boardId}`)}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, overflow: "hidden" }}>
                                                    <Typography
                                                        variant="body2"
                                                        noWrap
                                                        sx={{
                                                            fontWeight: post.category === "공지" ? "bold" : "normal",
                                                            textDecoration: post.hidden === 1 ? "line-through" : "none",
                                                            color: post.hidden === 1 ? "text.disabled" : "text.primary",
                                                            flex: 1,
                                                            minWidth: 0,
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
                                            <TableCell align="center" sx={{ fontSize: "0.82rem", color: "#4b6bbb" }}>
                                                {post.userName || ""}
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
                                    bgcolor: "#1e3a8a",
                                    color: "#fff",
                                    "&:hover": { bgcolor: "#1a317a" },
                                },
                                "& .MuiPaginationItem-root:hover": {
                                    bgcolor: "#eef2fa",
                                },
                            }}
                        />
                    </Stack>
                </Box>

                <Box sx={{ position: { md: "sticky" }, top: { md: 16 } }}>
                    <FreeBoardStatsPanel loginUser={loginUser} isAdmin={isAdmin} onRefresh={onRefresh} />
                </Box>
            </Box>
        </Container>
    );
};

export default FreeBoardListMui;
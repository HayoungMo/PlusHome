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

    useEffect(() => {
        const fetchTopLiked = async () => {
            try {
                const data = await FreeBoardStatsService.getAdminStats();
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
                    md: loginUser ? "minmax(0, 1fr) 240px" : "1fr" 
                },
                gap: 2,
                alignItems: "flex-start",
            }}>
                <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold">자유게시판</Typography>
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
                                startIcon={<CreateIcon />} 
                                onClick={() => navigate("/freeboard/write")}
                            >
                                글쓰기
                            </Button>
                        </Stack>
                    </Stack>

                    <Paper sx={{ p: 2, mb: 3 }}>
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
                                    <MenuItem value="정보">정보</MenuItem>
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
                            <Button 
                                variant="outlined" 
                                startIcon={<SearchIcon />} 
                                onClick={() => onSearch(inputValue)}
                            >
                                검색
                            </Button>
                        </Stack>
                    </Paper>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableRow>
                                    {isAdmin && (
                                        <TableCell padding="checkbox">
                                            <Checkbox 
                                                checked={visiblePosts.length > 0 && selectedIds.length === visiblePosts.length} 
                                                onChange={handleSelectAll} 
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell align="center" width="60">번호</TableCell>
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
                                            <TableCell align="center">{post.boardId}</TableCell>
                                            <TableCell align="center">
                                                {post.category === "공지" 
                                                    ? <Chip label="공지" size="small" color="error" sx={{ height: 20 }} />
                                                    : <Chip label={post.category} size="small" variant="outlined" sx={{ height: 20 }} />
                                                }
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
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }} 
                                                onClick={() => navigate(`/freeboard/article/${post.boardId}`)}
                                            >
                                                {post.title}
                                            </TableCell>
                                            <TableCell align="center">{post.userName || "방문자"}</TableCell>
                                            <TableCell align="center" sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                                                {post.viewCount ?? 0}
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                                                {post.likeCount ?? 0}
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                                                {post.commentCount ?? 0}
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                                                {post.createdAt}
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
                        />
                    </Stack>
                </Box>

                {loginUser && (
                    <Box sx={{ position: { md: "sticky" }, top: { md: 16 } }}>
                        <FreeBoardStatsPanel loginUser={loginUser} isAdmin={isAdmin} onRefresh={onRefresh} />
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default FreeBoardListMui;
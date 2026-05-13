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
    DeleteSweep as DeleteSweepIcon
} from "@mui/icons-material";
import { FreeBoardStatsPanel, PAGE_SIZE } from "./freeboard";

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
    const ROTATING_PLACEHOLDERS = [
    "제목으로 검색해보세요",
    "작성자로 검색해보세요",
    "내용으로 검색해보세요",
    ];
    const [placeholderIdx, setPlaceholderIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIdx((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    // [필터링 로직] 관리자가 아닐 경우에는 hidden: 1=(신고글)인 게시글을 리스트에서 제외
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
                    {/* 상단 타이틀 및 버튼 */}
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

                    {/* 검색 필터 영역 */}
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

                    {/* 게시글 테이블 */}
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
                                    <TableCell align="center" width="80">번호</TableCell>
                                    <TableCell>제목</TableCell>
                                    <TableCell align="center" width="120">작성자</TableCell>
                                    <TableCell align="center" width="120">작성일</TableCell>
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
                                            <TableCell 
                                                sx={{ 
                                                    cursor: "pointer", 
                                                    fontWeight: post.category === "공지" ? "bold" : "normal",
                                                    textDecoration: post.hidden === 1 ? "line-through" : "none",
                                                    color: post.hidden === 1 ? "text.disabled" : "text.primary"
                                                }} 
                                                onClick={() => navigate(`/freeboard/article/${post.boardId}`)}
                                            >
                                              
                                                {post.category === "공지" && <Chip label="공지" size="small" color="error" sx={{ mr: 1, height: 20 }} />}
                                                {post.hidden === 1 && <Chip label="숨김" size="small" variant="outlined" sx={{ mr: 1, height: 20 }} />}
                                                
                                                {post.title}
                                                
                                                {post.commentCount > 0 && (
                                                    <Typography component="span" variant="caption" color="error" sx={{ ml: 0.5 }}>
                                                        ({post.commentCount})
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">{post.userName || "방문자"}</TableCell>
                                            <TableCell align="center" sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                                                {post.createdAt}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin ? 5 : 4} align="center" sx={{ py: 5 }}>
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
                        />
                    </Stack>
                </Box>

                {/* 사이드 패널 */}
                {loginUser && (
                    <Box sx={{ position: { md: "sticky" }, top: { md: 16 } }}>
                        <FreeBoardStatsPanel loginUser={loginUser} isAdmin={isAdmin} onRefresh={onRefresh}  />
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default FreeBoardListMui;
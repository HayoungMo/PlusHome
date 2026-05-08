import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Button,
    Box,
    Stack,
    TextField,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination,
    Chip,
    InputLabel,
    FormControl,
    Tooltip,
    Checkbox,
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SearchIcon from "@mui/icons-material/Search";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

import FreeBoardService from "../service/freeBoardService";

// 관리자 권한 타입 (USERS.TYPE = 'admin' 인 계정은 모든 권한)
const ADMIN_TYPE = "admin";

// DB FREEBOARD.CATEGORY 컬럼 (자유/질문/정보 + 공지)
const CATEGORY_FILTERS = [
    { value: "", label: "전체" },
    { value: "공지", label: "공지" },
    { value: "자유", label: "자유" },
    { value: "질문", label: "질문" },
    { value: "정보", label: "정보" },
];

const categoryColor = (cat) => {
    switch (cat) {
        case "공지":
            return "error";
        case "질문":
            return "warning";
        case "정보":
            return "info";
        case "자유":
            return "success";
        default:
            return "default";
    }
};

const PAGE_SIZE = 8;

const FreeBoardListPage = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [dataCount, setDataCount] = useState(0);

    const [params, setParams] = useState({
        pageNum: 1,
        searchKey: "title",
        searchValue: "",
        category: "",
    });
    const [inputValue, setInputValue] = useState("");

    const [selectedIds, setSelectedIds] = useState([]);

    // 로그인 / 관리자 판별 (LoginPage 는 localStorage.user 에 저장)
    const loginUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    })();
    const isAdmin = loginUser && loginUser.type === ADMIN_TYPE;

    const fetchPosts = useCallback(async () => {
        try {
            const data = await FreeBoardService.getLists(params);
            setPosts(data.lists || []);
            setDataCount(data.dataCount || 0);
            setSelectedIds([]);
        } catch (err) {
            console.error("목록 조회 실패:", err);
        }
    }, [params]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleSearch = () => {
        setParams((prev) => ({ ...prev, pageNum: 1, searchValue: inputValue }));
    };

    const handlePageChange = (event, newPage) => {
        setParams((prev) => ({ ...prev, pageNum: newPage }));
    };

    const handleCategoryChange = (e) => {
        setParams((prev) => ({ ...prev, pageNum: 1, category: e.target.value }));
    };

    // 체크박스
    const isSelected = (id) => selectedIds.includes(id);
    const handleSelectOne = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };
    const allSelected = posts.length > 0 && selectedIds.length === posts.length;
    const someSelected = selectedIds.length > 0 && selectedIds.length < posts.length;
    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(posts.map((p) => p.boardId));
        }
    };

    const handleMultiDelete = async () => {
        if (!loginUser) {
            alert("로그인이 필요합니다.");
            return;
        }
        if (selectedIds.length === 0) {
            alert("삭제할 게시글을 선택해주세요.");
            return;
        }
        if (!window.confirm(`선택한 ${selectedIds.length}개의 게시글을 삭제할까요?`)) return;
        try {
            const result = await FreeBoardService.deleteMulti(selectedIds);
            const success = result?.success ?? 0;
            const forbidden = result?.forbidden ?? 0;
            alert(
                `${success}개 삭제됨${
                    forbidden > 0 ? ` / ${forbidden}개는 권한이 없어 제외됨` : ""
                }`
            );
            await fetchPosts();
        } catch {
            alert("삭제 실패 — 로그인이 필요할 수 있습니다.");
        }
    };

    const totalPages = Math.max(1, Math.ceil(dataCount / PAGE_SIZE));

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h5" fontWeight="bold">
                        자유게시판
                    </Typography>
                    {isAdmin && (
                        <Chip label="관리자 모드" color="error" size="small" />
                    )}
                </Stack>
                <Stack direction="row" spacing={1}>
                    {/* 다중 삭제: 관리자(type=admin) 모드에서만 노출 */}
                    {isAdmin && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteSweepIcon />}
                            onClick={handleMultiDelete}
                            disabled={selectedIds.length === 0}
                        >
                            선택삭제 {selectedIds.length > 0 && `(${selectedIds.length})`}
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

            {/* 검색 / 필터 영역 */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1}
                    alignItems="center"
                    justifyContent="center"
                >
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel id="category-label">카테고리</InputLabel>
                        <Select
                            labelId="category-label"
                            label="카테고리"
                            value={params.category}
                            onChange={handleCategoryChange}
                        >
                            {CATEGORY_FILTERS.map((c) => (
                                <MenuItem key={c.label} value={c.value}>
                                    {c.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel id="searchKey-label">검색조건</InputLabel>
                        <Select
                            labelId="searchKey-label"
                            label="검색조건"
                            value={params.searchKey}
                            onChange={(e) =>
                                setParams((prev) => ({ ...prev, searchKey: e.target.value }))
                            }
                        >
                            <MenuItem value="title">제목</MenuItem>
                            <MenuItem value="userName">작성자</MenuItem>
                            <MenuItem value="content">내용</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        placeholder="검색어 입력"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        sx={{ minWidth: 220 }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<SearchIcon />}
                        onClick={handleSearch}
                    >
                        검색
                    </Button>
                </Stack>
                <Typography align="right" sx={{ mt: 2, pr: 1 }} color="text.secondary">
                    총 {dataCount.toLocaleString()}건
                </Typography>
            </Paper>

            {/* 목록 테이블 */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableRow>
                            {isAdmin && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={someSelected}
                                        checked={allSelected}
                                        onChange={handleSelectAll}
                                        inputProps={{ "aria-label": "전체 선택" }}
                                    />
                                </TableCell>
                            )}
                            <TableCell align="center" width={70}>
                                번호
                            </TableCell>
                            <TableCell align="center" width={90}>
                                카테고리
                            </TableCell>
                            <TableCell>제목</TableCell>
                            <TableCell align="center" width={120}>
                                작성자
                            </TableCell>
                            <TableCell align="center" width={70}>
                                <Tooltip title="조회수">
                                    <VisibilityIcon fontSize="small" />
                                </Tooltip>
                            </TableCell>
                            <TableCell align="center" width={70}>
                                <Tooltip title="좋아요">
                                    <ThumbUpAltOutlinedIcon fontSize="small" />
                                </Tooltip>
                            </TableCell>
                            <TableCell align="center" width={70}>
                                <Tooltip title="댓글">
                                    <ChatBubbleOutlineIcon fontSize="small" />
                                </Tooltip>
                            </TableCell>
                            <TableCell align="center" width={120}>
                                작성일
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {posts.length > 0 ? (
                            posts.map((post) => {
                                const isNotice = post.category === "공지";
                                const checked = isSelected(post.boardId);
                                return (
                                    <TableRow
                                        key={post.boardId}
                                        hover
                                        selected={checked}
                                    >
                                        {isAdmin && (
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={checked}
                                                    onChange={() =>
                                                        handleSelectOne(post.boardId)
                                                    }
                                                    inputProps={{
                                                        "aria-label": `${post.boardId} 선택`,
                                                    }}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell align="center">{post.boardId}</TableCell>
                                        <TableCell align="center">
                                            {/* 공지일 때만 카테고리 칩이 빨강(filled) */}
                                            <Chip
                                                label={post.category || "자유"}
                                                color={categoryColor(post.category)}
                                                size="small"
                                                variant={isNotice ? "filled" : "outlined"}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box
                                                component="span"
                                                onClick={() =>
                                                    navigate(`/freeboard/article/${post.boardId}`)
                                                }
                                                sx={{
                                                    cursor: "pointer",
                                                    "&:hover": { textDecoration: "underline" },
                                                }}
                                            >
                                                {post.title}
                                            </Box>
                                            {post.commentCount > 0 && (
                                                <Typography
                                                    component="span"
                                                    sx={{
                                                        color: "error.main",
                                                        fontSize: "0.8rem",
                                                        ml: 0.5,
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    ({post.commentCount})
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {post.userName || "방문자"}
                                        </TableCell>
                                        <TableCell align="center">
                                            {post.viewCount ?? 0}
                                        </TableCell>
                                        <TableCell align="center">
                                            {post.likeCount ?? 0}
                                        </TableCell>
                                        <TableCell align="center">
                                            {post.commentCount ?? 0}
                                        </TableCell>
                                        <TableCell align="center">{post.createdAt}</TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 9 : 8} align="center">
                                    게시글이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 페이지네이션 */}
            <Stack alignItems="center" sx={{ mt: 4 }}>
                <Pagination
                    count={totalPages}
                    page={params.pageNum}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                />
            </Stack>
        </Container>
    );
};

export default FreeBoardListPage;

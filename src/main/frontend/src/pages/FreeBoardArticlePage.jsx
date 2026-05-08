import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Container,
    Typography,
    Divider,
    Box,
    Stack,
    Button,
    Paper,
    Chip,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import FreeBoardService from "../service/freeBoardService";
import FreeBoardCommentMui from "../components/FreeBoardCommentMui";

const categoryColor = (cat) => {
    switch (cat) {
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

const FreeBoardArticlePage = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const currentId = Number(boardId);

    const [article, setArticle] = useState(null);
    const [prevArticle, setPrevArticle] = useState(null);
    const [nextArticle, setNextArticle] = useState(null);

    // 🔥 UI용 loginUser (버튼 권한 체크용)
    const loginUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    })();

    const isAdmin = loginUser?.type === "admin";
    const isArticleOwner =
        loginUser && article?.userId && loginUser.id === article.userId;

    const hasArticleAuthority = isAdmin || isArticleOwner;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 🔥 effect 내부에서 다시 가져오기 (ESLint 해결 핵심)
                const loginUser = JSON.parse(localStorage.getItem("user"));
                const isAdmin = loginUser?.type === "admin";

                // 1. 게시글 조회
                const data = await FreeBoardService.getFreeBoard(boardId);

                if (!data) {
                    alert("존재하지 않는 게시글입니다.");
                    navigate("/freeboard/list");
                    return;
                }

                // 2. 권한 체크 (조회는 허용)
                const isAuthor =
                    String(data.userId) === String(loginUser?.id);

                if (!isAdmin && !isAuthor) {
                    // 조회는 허용 → 아무것도 안 함
                }

                setArticle(data);

                // 3. 이전글 / 다음글
                const navData = await FreeBoardService.getNav(boardId);

                setPrevArticle(navData?.prev || null);
                setNextArticle(navData?.next || null);

            } catch (error) {
                console.error("데이터 로드 실패:", error);
                alert("게시글을 불러오는 중 오류 발생");
                navigate("/freeboard/list");
            }
        };

        fetchData();
    }, [boardId, navigate]);

    // 👍 좋아요
    const handleLike = async () => {
        if (!loginUser) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const updated = await FreeBoardService.likeFreeBoard(currentId);

            if (updated && typeof updated === "object") {
                setArticle((prev) => ({ ...prev, ...updated }));
            } else {
                setArticle((prev) =>
                    prev
                        ? {
                              ...prev,
                              likeCount: (prev.likeCount || 0) + 1,
                          }
                        : prev
                );
            }
        } catch {
            alert("좋아요 처리 실패");
        }
    };

    // 🗑️ 삭제
    const handleArticleDelete = async () => {
        if (!hasArticleAuthority) {
            alert("삭제 권한이 없습니다.");
            return;
        }

        if (!window.confirm("게시글을 삭제하시겠습니까?")) return;

        try {
            await FreeBoardService.deleteFreeBoard(currentId);
            alert("삭제되었습니다.");
            navigate("/freeboard/list");
        } catch {
            alert("삭제 실패");
        }
    };

    // 💬 댓글 수 동기화
    const handleCommentCountChange = (delta) => {
        setArticle((prev) =>
            prev
                ? {
                      ...prev,
                      commentCount: Math.max(
                          0,
                          (prev.commentCount || 0) + delta
                      ),
                  }
                : prev
        );
    };

    if (!article) {
        return (
            <Typography sx={{ mt: 4, textAlign: "center" }}>
                로딩 중...
            </Typography>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={2} sx={{ p: { xs: 2, md: 4 } }}>

                {/* 상단 */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Chip
                        label={article.category || "자유"}
                        color={categoryColor(article.category)}
                        size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                        #{article.boardId}
                    </Typography>
                </Stack>

                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {article.title}
                </Typography>

                <Stack direction="row" spacing={2} sx={{ color: "text.secondary", mb: 3 }}>
                    <Typography variant="body2">
                        {article.userName} ({article.userId})
                    </Typography>
                    <Typography variant="body2">{article.createdAt}</Typography>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <VisibilityIcon fontSize="inherit" />
                        <Typography variant="body2">
                            {article.viewCount || 0}
                        </Typography>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 3 }} />

                {/* 본문 */}
                <Box sx={{ minHeight: "200px", mb: 4 }}>
                    <Typography
                        variant="body1"
                        sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}
                    >
                        {article.content}
                    </Typography>
                </Box>

                {/* 좋아요 */}
                <Stack direction="row" justifyContent="center" sx={{ mb: 3 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ThumbUpAltIcon />}
                        onClick={handleLike}
                    >
                        좋아요 {article.likeCount || 0}
                    </Button>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {/* 버튼 */}
                <Stack direction="row" spacing={1} justifyContent="space-between">
                    <Button
                        variant="outlined"
                        startIcon={<ListAltIcon />}
                        onClick={() => navigate("/freeboard/list")}
                    >
                        목록
                    </Button>

                    {hasArticleAuthority && (
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() =>
                                    navigate(`/freeboard/edit/${boardId}`)
                                }
                            >
                                수정
                            </Button>

                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleArticleDelete}
                            >
                                삭제
                            </Button>
                        </Stack>
                    )}
                </Stack>

                {/* 이전글 / 다음글 */}
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ my: 3 }}>
                    <Button
                        variant="text"
                        startIcon={<NavigateBeforeIcon />}
                        disabled={!prevArticle}
                        onClick={() =>
                            navigate(`/freeboard/article/${prevArticle.boardId}`)
                        }
                    >
                        {prevArticle ? "이전글" : "이전글 없음"}
                    </Button>

                    <Divider orientation="vertical" flexItem />

                    <Button
                        variant="text"
                        endIcon={<NavigateNextIcon />}
                        disabled={!nextArticle}
                        onClick={() =>
                            navigate(`/freeboard/article/${nextArticle.boardId}`)
                        }
                    >
                        {nextArticle ? "다음글" : "다음글 없음"}
                    </Button>
                </Stack>

                {/* 댓글 */}
                <FreeBoardCommentMui
                    boardId={currentId}
                    loginUser={loginUser}
                    onCommentCountChange={handleCommentCountChange}
                />
            </Paper>
        </Container>
    );
};

export default FreeBoardArticlePage;
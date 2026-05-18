import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Divider, Box, Stack, Button, Paper, Chip } from "@mui/material";
import {
    Visibility as VisibilityIcon, ThumbUpAlt as ThumbUpAltIcon,
    Edit as EditIcon, Delete as DeleteIcon, ListAlt as ListAltIcon,
    NavigateBefore as NavigateBeforeIcon, NavigateNext as NavigateNextIcon,
    Share as ShareIcon, Create as CreateIcon,
    ChatBubbleOutline as ChatBubbleOutlineIcon,
} from "@mui/icons-material";

import FreeBoardCommentMui from "./FreeBoardCommentMui";
import FreeBoardReportButton from "./freeboard/FreeBoardReportButton";

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

/* NEW 뱃지 — outlined, 목록과 동일 */
const NewBadge = () => (
    <Chip
        label="NEW"
        color="error"
        size="small"
        variant="outlined"
        sx={{ fontWeight: "bold", height: 18, fontSize: "0.65rem", px: 0.5, flexShrink: 0 }}
    />
);

/* 작성자 — userName만 표시 */
const AuthorDisplay = ({ userName }) => (
    <Typography variant="body2">{userName}</Typography>
);

const FreeBoardArticleMui = ({
    article, prevArticle, nextArticle, loginUser, isAdmin, isOwner, hasAuthority, canReport,
    alreadyLiked,
    onLike, onDelete, onShare, onEdit, onBack, onNavigate, onCommentCountChange
}) => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                   
                    
                </Stack>
                {loginUser && (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<CreateIcon />}
                        onClick={() => navigate("/freeboard/write")}
                        sx={{ bgcolor: "#1e3a8a", "&:hover": { bgcolor: "#1a317a" } }}
                    >
                        글쓰기
                    </Button>
                )}
            </Stack>

            <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, border: "1px solid #c5d4f0" }}>
                {/* 헤더 섹션 */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Chip
                        label={article.category || "자유"}
                        color={categoryColor(article.category)}
                        size="small"
                        variant="outlined"
                    />
                    {article.isNew && <NewBadge />}
                </Stack>

                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ wordBreak: "break-all", color: "#0f1d3d" }}>
                    {article.title}
                </Typography>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, color: "#4b6bbb" }}>
                    <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem sx={{ borderColor: "#c5d4f0" }} />}>
                        
                        <AuthorDisplay userName={article.userName} />
                        <Typography variant="body2" sx={{ color: "#aec4ed" }}>{article.createdAt}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <VisibilityIcon sx={{ fontSize: 18, color: "#aec4ed" }} />
                        <Typography variant="body2" sx={{ color: "#4b6bbb" }}>{article.viewCount || 0}</Typography>
                        <Button
                            variant="text"
                            startIcon={<ShareIcon />}
                            onClick={onShare}
                            sx={{ color: "#4b6bbb", "&:hover": { bgcolor: "#eef2fa" } }}
                        >
                            공유
                        </Button>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 2, borderColor: "#c5d4f0" }} />

                {/* 본문 섹션 */}
                <Box sx={{ minHeight: "300px", py: 4 }}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: "1.1rem", color: "#0f1d3d" }}>
                        {article.content}
                    </Typography>
                </Box>

                {/* 좋아요 버튼 */}
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 6 }}>
                    <Button
                        variant={alreadyLiked ? "contained" : "outlined"}
                        size="large"
                        startIcon={<ThumbUpAltIcon />}
                        onClick={onLike}
                        sx={{
                            borderRadius: 5,
                            px: 4,
                            bgcolor: alreadyLiked ? "#1e3a8a" : "transparent",
                            color: alreadyLiked ? "#fff" : "#1e3a8a",
                            borderColor: "#1e3a8a",
                            boxShadow: alreadyLiked ? 2 : 0,
                            "&:hover": {
                                bgcolor: alreadyLiked ? "#1a317a" : "#eef2fa",
                                borderColor: "#1e3a8a",
                            },
                        }}
                    >
                        좋아요 {article.likeCount || 0}
                    </Button>
                </Stack>

                {/* 하단 제어 버튼 바 */}
                <Stack direction="row" justifyContent="space-between" sx={{ bgcolor: "#eef2fa", p: 2, borderRadius: 2, border: "1px solid #c5d4f0" }}>
                    <Button
                        startIcon={<ListAltIcon />}
                        onClick={onBack}
                        sx={{ color: "#1e3a8a", "&:hover": { bgcolor: "#dde8f8" } }}
                    >
                        목록
                    </Button>
                    <Stack direction="row" spacing={1}>
                        {canReport && (
                            <FreeBoardReportButton targetType="post" targetId={article.boardId} label="신고" />
                        )}
                        {hasAuthority && (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    onClick={onEdit}
                                    sx={{ color: "#1e3a8a", borderColor: "#aec4ed", "&:hover": { bgcolor: "#eef2fa", borderColor: "#1e3a8a" } }}
                                >
                                    수정
                                </Button>
                                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>삭제</Button>
                            </>
                        )}
                    </Stack>
                </Stack>

                {/* 이전글 / 다음글 */}
                <Stack direction="row" spacing={0} justifyContent="center" sx={{ my: 4, borderTop: "1px solid #c5d4f0", borderBottom: "1px solid #c5d4f0" }}>
                    <Button
                        fullWidth
                        startIcon={<NavigateBeforeIcon />}
                        disabled={!prevArticle}
                        onClick={() => onNavigate(prevArticle.boardId)}
                        sx={{
                            py: 2, borderRadius: 0, justifyContent: "flex-start",
                            color: "#1e3a8a",
                            "&:hover": { bgcolor: "#eef2fa" },
                            "&.Mui-disabled": { color: "#aec4ed" },
                        }}
                    >
                        {prevArticle ? prevArticle.title : "이전글이 없습니다."}
                    </Button>
                    <Divider orientation="vertical" flexItem sx={{ borderColor: "#c5d4f0" }} />
                    <Button
                        fullWidth
                        endIcon={<NavigateNextIcon />}
                        disabled={!nextArticle}
                        onClick={() => onNavigate(nextArticle.boardId)}
                        sx={{
                            py: 2, borderRadius: 0, justifyContent: "flex-end",
                            color: "#1e3a8a",
                            "&:hover": { bgcolor: "#eef2fa" },
                            "&.Mui-disabled": { color: "#aec4ed" },
                        }}
                    >
                        {nextArticle ? nextArticle.title : "다음글이 없습니다."}
                    </Button>
                </Stack>

                {/* 댓글 영역 */}
                <Box sx={{ mt: 6 }}>
                    <FreeBoardCommentMui
                        key={article.boardId}
                        boardId={article.boardId}
                        loginUser={loginUser}
                        onCommentCountChange={onCommentCountChange}
                    />
                </Box>
            </Paper>
        </Container>
    );
};

export default FreeBoardArticleMui;

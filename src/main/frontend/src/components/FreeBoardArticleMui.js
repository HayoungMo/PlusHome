import React from "react";
import { Container, Typography, Divider, Box, Stack, Button, Paper, Chip } from "@mui/material";
import { 
    Visibility as VisibilityIcon, ThumbUpAlt as ThumbUpAltIcon, 
    Edit as EditIcon, Delete as DeleteIcon, ListAlt as ListAltIcon,
    NavigateBefore as NavigateBeforeIcon, NavigateNext as NavigateNextIcon, Share as ShareIcon
} from "@mui/icons-material";

import FreeBoardCommentMui from "./FreeBoardCommentMui";
import FreeBoardReportButton from "./freeboard/FreeBoardReportButton";

const categoryColor = (cat) => {
    switch (cat) {
        case "공지": return "error"; 
        case "질문": return "warning";
        case "정보": return "info";
        case "자유": return "success";
        default: return "default";
    }
};

const FreeBoardArticleMui = ({ 
    article, prevArticle, nextArticle, loginUser, isAdmin, isOwner, hasAuthority, canReport,
    onLike, onDelete, onShare, onEdit, onBack, onNavigate, onCommentCountChange 
}) => {
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
                {/* 헤더 섹션 */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Chip 
                        label={article.category || "자유"} 
                        color={categoryColor(article.category)} 
                        size="small" 
                        variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">NO. {article.boardId}</Typography>
                </Stack>
                
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ wordBreak: "break-all" }}>
                    {article.title}
                </Typography>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, color: "text.secondary" }}>
                    <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                        <Typography variant="body2">{article.userName} {article.userId && `(${article.userId})`}</Typography>
                        <Typography variant="body2">{article.createdAt}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <VisibilityIcon sx={{ fontSize: 18 }} />
                        <Typography variant="body2">{article.viewCount || 0}</Typography>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* 본문 섹션 */}
                <Box sx={{ minHeight: "300px", py: 4 }}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: "1.1rem" }}>
                        {article.content}
                    </Typography>
                </Box>

                {/* 좋아요 버튼 */}
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 6 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<ThumbUpAltIcon />}
                        onClick={onLike}
                        sx={{ borderRadius: 5, px: 4 }}
                    >
                        좋아요 {article.likeCount || 0}
                    </Button>
                </Stack>

                {/* 하단 버튼 바 */}
                <Stack direction="row" justifyContent="space-between" sx={{ bgcolor: "#fcfcfc", p: 2, borderRadius: 2, border: "1px solid #eee" }}>
                    <Button startIcon={<ListAltIcon />} onClick={onBack} color="inherit">목록</Button>
                    <Stack direction="row" spacing={1}>
                        <Button variant="text" startIcon={<ShareIcon />} onClick={onShare} color="inherit">공유</Button>
                        {canReport && (
                            <FreeBoardReportButton targetType="post" targetId={article.boardId} label="신고" />
                        )}
                        {hasAuthority && (
                            <>
                                <Button variant="outlined" startIcon={<EditIcon />} onClick={onEdit}>수정</Button>
                                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>삭제</Button>
                            </>
                        )}
                    </Stack>
                </Stack>

                {/* 이전글/다음글 네비게이션 */}
                <Stack direction="row" spacing={0} justifyContent="center" sx={{ my: 4, borderTop: "1px solid #eee", borderBottom: "1px solid #eee" }}>
                    <Button
                        fullWidth
                        startIcon={<NavigateBeforeIcon />}
                        disabled={!prevArticle}
                        onClick={() => onNavigate(prevArticle.boardId)}
                        sx={{ py: 2, borderRadius: 0, justifyContent: "flex-start", color: "text.primary" }}
                    >
                        {prevArticle ? prevArticle.title : "이전글이 없습니다."}
                    </Button>
                    <Divider orientation="vertical" flexItem />
                    <Button
                        fullWidth
                        endIcon={<NavigateNextIcon />}
                        disabled={!nextArticle}
                        onClick={() => onNavigate(nextArticle.boardId)}
                        sx={{ py: 2, borderRadius: 0, justifyContent: "flex-end", color: "text.primary" }}
                    >
                        {nextArticle ? nextArticle.title : "다음글이 없습니다."}
                    </Button>
                </Stack>

               
                <Box sx={{ mt: 6 }}>
                    <FreeBoardCommentMui
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
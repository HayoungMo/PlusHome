import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container, Typography, Divider, Box, Stack, Button, Paper, Chip, Avatar,
    Menu, MenuItem, ListItemIcon, ListItemText,
} from "@mui/material";
import {
    Visibility as VisibilityIcon,
    ThumbUpAlt as ThumbUpAltIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ListAlt as ListAltIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
    Share as ShareIcon,
    Create as CreateIcon,
    ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { SiNaver } from "react-icons/si";

import { getImgDirSimple } from "../resources/function/GetImgDir";
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

const NewBadge = () => (
    <Chip
        label="NEW"
        color="error"
        size="small"
        variant="outlined"
        sx={{ fontWeight: "bold", height: 18, fontSize: "0.65rem", px: 0.5, flexShrink: 0 }}
    />
);

const AuthorDisplay = ({ userId, profileImage }) => {
    const imageUrl = profileImage?.img_name
        ? getImgDirSimple({ kind: profileImage.img_kind, name: profileImage.img_name })
        : null;

    return (
        <Stack direction="row" spacing={0.8} alignItems="center">
            <Avatar
                src={imageUrl}
                sx={{ bgcolor: "#1e3a8a", width: 26, height: 26, fontSize: "0.75rem", fontWeight: "bold" }}
            >
                {!imageUrl && (userId ? userId[0].toUpperCase() : "?")}
            </Avatar>
            <Box>
                <Typography variant="body2" sx={{ lineHeight: 1.3, fontWeight: "bold", color: "#1e3a8a" }}>
                    {userId}
                </Typography>
            </Box>
        </Stack>
    );
};

/* ──────────────────────────────────────────────────────────────
   공유 메뉴 — X, 네이버, 인스타그램, 링크복사 //
   ────────────────────────────────────────────────────────────── */
const ShareMenu = ({ anchorEl, open, onClose, article, showSnack }) => {

    const url   = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article?.title || "");

    const shareHandleX = () => {
        window.open(
            `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
            "_blank", "noopener,noreferrer"
        );
        onClose();
    };

    const shareHandleNaver = () => {
        window.open(
            `https://share.naver.com/web/shareView?url=${url}&title=${title}`,
            "_blank", "noopener,noreferrer,width=600,height=500"
        );
        onClose();
    };

    const shareHandleInstagram = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showSnack("링크가 복사됐어요. 인스타그램에 붙여넣기 해주세요!", "info");
        } catch {
            showSnack(`링크: ${window.location.href}`, "info");
        }
        onClose();
    };

    const shareHandleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showSnack("공유 링크가 복사되었습니다.", "success");
        } catch {
            showSnack(`공유 링크: ${window.location.href}`, "info");
        }
        onClose();
    };

    const items = [
        {
            label: "X (트위터)",
            icon: <FaXTwitter size={18} />,
            color: "#000",
            bg: "#f0f0f0",
            onClick: shareHandleX,
        },
        {
            label: "네이버",
            icon: <SiNaver size={16} />,
            color: "#03C75A",
            bg: "#e8f9ef",
            onClick: shareHandleNaver,
        },
        {
            label: "인스타그램",
            icon: <FaInstagram size={18} />,
            color: "#E1306C",
            bg: "#fdeef4",
            onClick: shareHandleInstagram,
        },
        {
            label: "링크 복사",
            icon: <ContentCopyIcon sx={{ fontSize: 17 }} />,
            color: "#4b6bbb",
            bg: "#eef2fa",
            onClick: shareHandleCopy,
        },
    ];

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
                sx: { mt: 0.5, border: "1px solid #c5d4f0", borderRadius: 2, minWidth: 180, boxShadow: "0 4px 16px rgba(30,58,138,0.10)" },
            }}
        >
            {items.map(({ label, icon, color, bg, onClick }) => (
                <MenuItem
                    key={label}
                    onClick={onClick}
                    sx={{
                        py: 1.2, px: 2,
                        "&:hover": { bgcolor: bg },
                        gap: 1.5,
                    }}
                >
                    <ListItemIcon sx={{ color, minWidth: 28 }}>
                        {icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={label}
                        primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500, color: "#1e3a8a" }}
                    />
                </MenuItem>
            ))}
        </Menu>
    );
};
/* ──────────────────────────────────────────────────────────────
   FreeBoardArticleMui
   ────────────────────────────────────────────────────────────── */
const FreeBoardArticleMui = ({
    article, prevArticle, nextArticle, loginUser, hasAuthority, canReport,
    alreadyLiked,
    onLike, onDelete, onEdit, onBack, onNavigate, onCommentCountChange,
    showSnack,
}) => {
    const navigate = useNavigate();
    const [shareAnchor, setShareAnchor] = useState(null);

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Stack direction="row" spacing={0.5} alignItems="center" />
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
                {/* 헤더 */}
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
                        <AuthorDisplay userId={article.userId} profileImage={article.profileImage} />
                        <Typography variant="body2" sx={{ color: "#aec4ed" }}>{article.createdAt}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <VisibilityIcon sx={{ fontSize: 18, color: "#aec4ed" }} />
                        <Typography variant="body2" sx={{ color: "#4b6bbb" }}>{article.viewCount || 0}</Typography>

                        {/* 공유 버튼 */}
                        <Button
                            variant="text"
                            startIcon={<ShareIcon />}
                            onClick={(e) => setShareAnchor(e.currentTarget)}
                            sx={{ color: "#4b6bbb", "&:hover": { bgcolor: "#eef2fa" } }}
                        >
                            공유
                        </Button>
                        <ShareMenu
                            anchorEl={shareAnchor}
                            open={Boolean(shareAnchor)}
                            onClose={() => setShareAnchor(null)}
                            article={article}
                            showSnack={showSnack}
                        />
                    </Stack>
                </Stack>

                <Divider sx={{ my: 2, borderColor: "#c5d4f0" }} />

                {/* 본문 */}
                <Box sx={{ minHeight: "300px", py: 4 }}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: "1.1rem", color: "#0f1d3d" }}>
                        {article.content}
                    </Typography>
                </Box>

                {/* 좋아요 */}
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 6 }}>
                    <Button
                        variant={alreadyLiked ? "contained" : "outlined"}
                        size="large"
                        startIcon={<ThumbUpAltIcon />}
                        onClick={onLike}
                        sx={{
                            borderRadius: 5, px: 4,
                            bgcolor:     alreadyLiked ? "#1e3a8a" : "transparent",
                            color:       alreadyLiked ? "#fff" : "#1e3a8a",
                            borderColor: "#1e3a8a",
                            boxShadow:   alreadyLiked ? 2 : 0,
                            "&:hover": {
                                bgcolor:     alreadyLiked ? "#1a317a" : "#eef2fa",
                                borderColor: "#1e3a8a",
                            },
                        }}
                    >
                        좋아요 {article.likeCount || 0}
                    </Button>
                </Stack>

                {/* 하단 제어 버튼 바 */}
                <Stack direction="row" justifyContent="space-between"
                    sx={{ bgcolor: "#eef2fa", p: 2, borderRadius: 2, border: "1px solid #c5d4f0" }}>
                    <Button startIcon={<ListAltIcon />} onClick={onBack}
                        sx={{ color: "#1e3a8a", "&:hover": { bgcolor: "#dde8f8" } }}>
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
                                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
                                    삭제
                                </Button>
                            </>
                        )}
                    </Stack>
                </Stack>

                {/* 이전글 / 다음글 */}
                <Stack direction="row" spacing={0} justifyContent="center"
                    sx={{ my: 4, borderTop: "1px solid #c5d4f0", borderBottom: "1px solid #c5d4f0" }}>
                    <Button
                        fullWidth
                        startIcon={<NavigateBeforeIcon />}
                        disabled={!prevArticle}
                        onClick={() => prevArticle && onNavigate(prevArticle.boardId)}
                        sx={{
                            py: 2, borderRadius: 0, justifyContent: "flex-start", color: "#1e3a8a",
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
                        onClick={() => nextArticle && onNavigate(nextArticle.boardId)}
                        sx={{
                            py: 2, borderRadius: 0, justifyContent: "flex-end", color: "#1e3a8a",
                            "&:hover": { bgcolor: "#eef2fa" },
                            "&.Mui-disabled": { color: "#aec4ed" },
                        }}
                    >
                        {nextArticle ? nextArticle.title : "다음글이 없습니다."}
                    </Button>
                </Stack>

                {/* 댓글 */}
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

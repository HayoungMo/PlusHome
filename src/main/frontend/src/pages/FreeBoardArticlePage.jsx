import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import "../css/freeboard.css";
import { useNavigate, useParams } from "react-router-dom";
import FreeBoardService from "../service/freeBoardService";
import FreeBoardCommentService from "../service/freeBoardCommentService";
import { getImgDirSimple } from "../resources/function/GetImgDir";
import ConfirmDialog from "../components/ConfirmDialog";
import SnackbarAlert from "../components/SnackbarAlert";
import http from "../http-common";
import {
    Container, Typography, Divider, Button, Paper, Chip, Avatar,
    Menu, MenuItem, ListItemIcon, ListItemText,
    TextField, List, ListItem, ListItemAvatar,
    Dialog, DialogTitle, DialogContent, DialogActions,
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
    ReportGmailerrorred as ReportGmailerrorredIcon,
} from "@mui/icons-material";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { SiNaver } from "react-icons/si";

// ── 인라인 유틸  ────────────
const ADMIN_TYPE = "admin";
const getLoginUser = () => {
    try { const r = localStorage.getItem("user"); return r ? JSON.parse(r) : null; }
    catch { return null; }
};
const resolveUserName = (n) => n && n.trim() ? n : "탈퇴한 회원";
const getPermissions = (loginUser, target = null) => {
    const isLoggedIn = !!loginUser;
    const isAdmin    = isLoggedIn && loginUser.type === ADMIN_TYPE;
    const isDeleted  = isLoggedIn && loginUser.type === "deleted";
    const isOwner    = isLoggedIn && !isDeleted && target != null
        && String(loginUser.id) === String(target.userId);
    if (isDeleted) return { isLoggedIn, isAdmin: false, isOwner: false, canWrite: false, canEdit: false, canDelete: false, canLike: false, canComment: false, canReport: false };
    return { isLoggedIn, isAdmin, isOwner, canWrite: isLoggedIn, canEdit: isLoggedIn && (isAdmin || isOwner), canDelete: isLoggedIn && (isAdmin || isOwner), canLike: isLoggedIn, canComment: isLoggedIn, canReport: isLoggedIn };
};

// ── 신고 버튼 --
const REPORT_REASONS = ["스팸/광고", "음란성/선정성", "욕설/혐오 표현", "허위 사실 / 명예훼손", "도배/관련 없는 내용", "기타"];
const fbAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};
const FreeBoardReportButton = ({ targetType, targetId, size = "small", label = "신고", onSubmitted }) => {
    const [open, setOpen]     = useState(false);
    const [reason, setReason] = useState(REPORT_REASONS[0]);
    const [detail, setDetail] = useState("");
    const [loading, setLoading] = useState(false);
    const [snack, setSnack]   = useState({ open: false, message: "", severity: "success" });
    const showSnack  = (msg, sev = "success") => setSnack({ open: true, message: msg, severity: sev });
    const closeSnack = () => setSnack((p) => ({ ...p, open: false }));

    const handleSubmit = async () => {
        if (!targetId) return;
        const user = getLoginUser();
        if (!user) { showSnack("로그인이 필요한 서비스입니다.", "warning"); return; }
        setLoading(true);
        try {
            const url = targetType === "post"
                ? `/freeboard/report/post/${targetId}`
                : `/freeboard/report/comment/${targetId}`;
            const res  = await http.post(url, { reason, detail, userId: user.id }, fbAuthHeader());
            const data = res?.data || {};
            if (data.status === "DUPLICATE") { showSnack("이미 신고하신 항목입니다.", "warning"); setOpen(false); return; }
            if (data.status === "UNAUTHORIZED") { showSnack("권한이 없습니다.", "error"); return; }
            showSnack(`신고가 접수되었습니다. (누적 ${data.count ?? 0}회)`, "success");
            setOpen(false); setDetail("");
            if (onSubmitted) onSubmitted();
        } catch (e) {
            const st = e?.response?.status;
            if (st === 409 || e?.response?.data?.status === "DUPLICATE") { showSnack("이미 신고한 항목입니다.", "warning"); setOpen(false); return; }
            if (st === 401) { showSnack("로그인이 필요합니다.", "warning"); return; }
            showSnack("신고 처리 중 오류가 발생했습니다.", "error");
        } finally { setLoading(false); }
    };

    return (
        <>
            <Button size={size} color="error" startIcon={<ReportGmailerrorredIcon fontSize="inherit" />} onClick={() => setOpen(true)}>{label}</Button>
            <SnackbarAlert open={snack.open} message={snack.message} severity={snack.severity} onClose={closeSnack} />
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold" }}>{targetType === "post" ? "게시글 신고" : "댓글 신고"}</DialogTitle>
                <DialogContent dividers>
                    <TextField select label="신고 사유" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth size="small" sx={{ mb: 2, mt: 1 }}>
                        {REPORT_REASONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                    </TextField>
                    <TextField label="추가 설명 (선택)" value={detail} onChange={(e) => setDetail(e.target.value)} fullWidth multiline minRows={3} size="small" />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)} disabled={loading} color="inherit">취소</Button>
                    <Button onClick={handleSubmit} color="error" variant="contained" disabled={loading}>신고하기</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

// ── 유틸 ──────────────────────────────────────────────────────
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

// ── 작성자 표시 ────────────────────────────────────────────────
const AuthorDisplay = ({ userId, profileImage }) => {
    const imageUrl = profileImage?.img_name
        ? getImgDirSimple({ kind: profileImage.img_kind, name: profileImage.img_name })
        : null;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Avatar src={imageUrl} className="fb-article-avatar">
                {!imageUrl && (userId ? userId[0].toUpperCase() : "?")}
            </Avatar>
            <Typography className="fb-author-name">{userId}</Typography>
        </div>
    );
};

// ── 공유 메뉴 ──────────────────────────────────────────────────
const ShareMenu = ({ anchorEl, open, onClose, article, showSnack }) => {
    const url   = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article?.title || "");

    const items = [
        {
            label: "X (트위터)",
            icon: <FaXTwitter size={18} />,
            color: "#000", bg: "#f0f0f0",
            onClick: () => { window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, "_blank", "noopener,noreferrer"); onClose(); },
        },
        {
            label: "네이버",
            icon: <SiNaver size={16} />,
            color: "#03C75A", bg: "#e8f9ef",
            onClick: () => { window.open(`https://share.naver.com/web/shareView?url=${url}&title=${title}`, "_blank", "noopener,noreferrer,width=600,height=500"); onClose(); },
        },
        {
            label: "인스타그램",
            icon: <FaInstagram size={18} />,
            color: "#E1306C", bg: "#fdeef4",
            onClick: async () => {
                try { await navigator.clipboard.writeText(window.location.href); showSnack("링크가 복사됐어요. 인스타그램에 붙여넣기 해주세요!", "info"); }
                catch { showSnack(`링크: ${window.location.href}`, "info"); }
                onClose();
            },
        },
        {
            label: "링크 복사",
            icon: <ContentCopyIcon sx={{ fontSize: 17 }} />,
            color: "#4b6bbb", bg: "#eef2fa",
            onClick: async () => {
                try { await navigator.clipboard.writeText(window.location.href); showSnack("공유 링크가 복사되었습니다.", "success"); }
                catch { showSnack(`공유 링크: ${window.location.href}`, "info"); }
                onClose();
            },
        },
    ];

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{ className: "fb-share-menu-paper" }}
        >
            {items.map(({ label, icon, color, bg, onClick }) => (
                <MenuItem key={label} onClick={onClick} sx={{ py: 1.2, px: 2, "&:hover": { bgcolor: bg }, gap: 1.5 }}>
                    <ListItemIcon sx={{ color, minWidth: 28 }}>{icon}</ListItemIcon>
                    <ListItemText primary={label}
                        primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500, color: "#1e3a8a" }} />
                </MenuItem>
            ))}
        </Menu>
    );
};

// ── 댓글 아이템 ────────────────────────────────────────────────
const CommentItem = ({ comment, isReply = false, loginUser, isAdmin, onUpdate, onDelete, onReply }) => {
    const [editing, setEditing]           = useState(false);
    const [editContent, setEditContent]   = useState(comment.content || "");
    const [replyOpen, setReplyOpen]       = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [snack, setSnack] = useState({ open: false, message: "", severity: "warning" });

    const { canEdit, canDelete, canReport, canComment } = getPermissions(loginUser, comment);
    const hasAuthority = canEdit || canDelete;

    const showSnack  = (message, severity = "warning") => setSnack({ open: true, message, severity });
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    const handleEditSave = async () => {
        if (!editContent.trim()) { showSnack("내용을 입력해주세요."); return; }
        await onUpdate(comment.commentId, editContent.trim());
        setEditing(false);
    };

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) { showSnack("답글 내용을 입력해주세요."); return; }
        await onReply(comment.commentId, replyContent.trim());
        setReplyOpen(false);
        setReplyContent("");
    };

    return (
        <>
            <ListItem
                alignItems="flex-start"
                className={`fb-comment-item${isReply ? " is-reply" : ""}`}
            >
                <ListItemAvatar>
                    <Avatar className="fb-comment-avatar">
                        {comment.userName ? comment.userName[0].toUpperCase() : "?"}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    disableTypography
                    primary={
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <Typography component="span" className="fb-comment-author">
                                {comment.userName}
                                {comment.userType === ADMIN_TYPE && (
                                    <Chip label="관리자" size="small" color="primary" className="fb-admin-chip" />
                                )}
                            </Typography>
                            <Typography component="span" className="fb-comment-date">
                                {comment.createdAt}
                            </Typography>
                        </div>
                    }
                    secondary={
                        <div style={{ marginTop: 8 }}>
                            {editing ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <TextField
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        size="small" multiline fullWidth autoFocus
                                    />
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <Button size="small" variant="outlined" color="primary" onClick={handleEditSave}>저장</Button>
                                        <Button size="small" variant="outlined" color="inherit" onClick={() => setEditing(false)}>취소</Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Typography variant="body2" className="fb-comment-content">
                                        {comment.content}
                                    </Typography>
                                    <div className="fb-comment-actions">
                                        {!isReply && canComment && (
                                            <Button size="small" variant="text" onClick={() => setReplyOpen(!replyOpen)}>
                                                {replyOpen ? "답글취소" : "답글"}
                                            </Button>
                                        )}
                                        {hasAuthority && (
                                            <>
                                                <Button size="small" variant="text" onClick={() => setEditing(true)}>수정</Button>
                                                <Button size="small" variant="text" color="error"
                                                    onClick={(e) => { e.stopPropagation(); onDelete(comment.commentId); }}>
                                                    삭제
                                                </Button>
                                            </>
                                        )}
                                        {canReport && (
                                            <FreeBoardReportButton targetType="comment" targetId={comment.commentId} />
                                        )}
                                    </div>
                                </>
                            )}

                            {!isReply && replyOpen && !editing && (
                                <div className="fb-reply-input-row">
                                    <TextField
                                        size="small"
                                        placeholder="답글 내용을 입력하세요..."
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        fullWidth
                                    />
                                    <Button variant="outlined" color="primary" size="small"
                                        onClick={handleReplySubmit} sx={{ minWidth: 60 }}>
                                        등록
                                    </Button>
                                </div>
                            )}
                        </div>
                    }
                />
            </ListItem>

            <SnackbarAlert open={snack.open} message={snack.message} severity={snack.severity} onClose={closeSnack} />
        </>
    );
};

// ── 댓글 섹션 ──────────────────────────────────────────────────
const CommentSection = ({ boardId, loginUser, onCommentCountChange }) => {
    const [comments, setComments]             = useState([]);
    const [commentContent, setCommentContent] = useState("");
    const [deleteDialog, setDeleteDialog]     = useState({ open: false, commentId: null });
    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

    const { isAdmin, canComment } = getPermissions(loginUser);
    const currentBoardId = Number(boardId);

    const showSnack  = (message, severity = "success") => setSnack({ open: true, message, severity });
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    const loadComments = useCallback(async () => {
        try {
            const userType = loginUser?.type || "guest";
            const list = await FreeBoardCommentService.getComments(boardId, userType);
            setComments(
                (list || []).map((c) => ({
                    ...c,
                    userName: c.userName?.trim() || "탈퇴한 회원",
                }))
            );
        } catch {
            showSnack("댓글을 불러오지 못했습니다.", "error");
        }
    }, [boardId, loginUser]);

    useEffect(() => { loadComments(); }, [loadComments]);

    const handleCommentSubmit = async () => {
        if (!canComment) { showSnack("로그인 후 이용 가능합니다.", "warning"); return; }
        if (!commentContent.trim()) { showSnack("댓글 내용을 입력해주세요.", "warning"); return; }
        try {
            await FreeBoardCommentService.writeComment({
                boardId: currentBoardId,
                content: commentContent.trim(),
                userId:  loginUser.id,
                userName: loginUser.name,
                parentId: null,
            });
            setCommentContent("");
            await loadComments();
            onCommentCountChange?.(1);
        } catch {
            showSnack("댓글 등록 실패", "error");
        }
    };

    const handleReply = async (parentId, content) => {
        if (!canComment) { showSnack("로그인 후 이용 가능합니다.", "warning"); return; }
        try {
            await FreeBoardCommentService.writeComment({
                boardId: currentBoardId, content,
                userId: loginUser.id, userName: loginUser.name, parentId,
            });
            await loadComments();
            onCommentCountChange?.(1);
        } catch {
            showSnack("답글 등록 실패", "error");
        }
    };

    const handleUpdate = async (commentId, content) => {
        try {
            await FreeBoardCommentService.updateComment({ commentId, content });
            await loadComments();
            showSnack("댓글이 수정되었습니다.", "success");
        } catch {
            showSnack("수정 실패", "error");
        }
    };

    const handleDeleteRequest = (commentId) => setDeleteDialog({ open: true, commentId });

    const handleDeleteConfirm = async () => {
        const { commentId } = deleteDialog;
        setDeleteDialog({ open: false, commentId: null });
        try {
            await FreeBoardCommentService.deleteComment(boardId, commentId);
            showSnack("삭제되었습니다.", "success");
            await loadComments();
            onCommentCountChange?.(-1);
        } catch (error) {
            const status = error?.response?.status;
            if (status === 401)      showSnack("로그인 정보가 없거나 만료되었습니다. 다시 로그인해 주세요.", "error");
            else if (status === 403) showSnack("삭제 권한이 없습니다.", "error");
            else                     showSnack("삭제 중 서버 오류가 발생했습니다.", "error");
        }
    };

    const byCreatedAsc = (a, b) => {
        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta !== tb ? ta - tb : (a?.commentId || 0) - (b?.commentId || 0);
    };

    const rootComments = comments.filter((c) => !c.parentId).slice().sort(byCreatedAsc);
    const repliesOf    = (commentId) =>
        comments.filter((c) => c.parentId === commentId).slice().sort(byCreatedAsc);

    return (
        <div className="fb-comment-section">
            <Typography variant="h6" className="fb-comment-title">
                댓글 {comments.length}개
            </Typography>

            <div className="fb-comment-input-row">
                <TextField
                    className="fb-comment-input"
                    placeholder={canComment ? "따뜻한 댓글을 남겨주세요." : "로그인 후 댓글을 남겨보세요."}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    size="small" multiline minRows={2} fullWidth disabled={!canComment}
                />
                <Button
                    variant="contained"
                    onClick={handleCommentSubmit}
                    disabled={!canComment}
                    className="fb-comment-submit-btn"
                >
                    등록
                </Button>
            </div>

            <List className="fb-comment-list">
                {rootComments.map((c) => (
                    <React.Fragment key={c.commentId}>
                        <CommentItem
                            comment={c} isReply={false}
                            loginUser={loginUser} isAdmin={isAdmin}
                            onUpdate={handleUpdate}
                            onDelete={handleDeleteRequest}
                            onReply={handleReply}
                        />
                        {repliesOf(c.commentId).map((r) => (
                            <CommentItem
                                key={r.commentId}
                                comment={r} isReply={true}
                                loginUser={loginUser} isAdmin={isAdmin}
                                onUpdate={handleUpdate}
                                onDelete={handleDeleteRequest}
                                onReply={handleReply}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </List>

            <ConfirmDialog
                open={deleteDialog.open}
                title="댓글 삭제" message="정말 삭제하시겠습니까?"
                confirmLabel="삭제" confirmColor="error"
                onConfirm={handleDeleteConfirm}
                onClose={() => setDeleteDialog({ open: false, commentId: null })}
            />

            <SnackbarAlert open={snack.open} message={snack.message} severity={snack.severity} onClose={closeSnack} />
        </div>
    );
};

// ── 메인 컴포넌트 ──────────────────────────────────────────────
const FreeBoardArticlePage = () => {
    const { boardId } = useParams();
    const navigate    = useNavigate();
    const currentBoardId = Number(boardId);

    const [article, setArticle]           = useState(null);
    const [prevArticle, setPrevArticle]   = useState(null);
    const [nextArticle, setNextArticle]   = useState(null);
    const [alreadyLiked, setAlreadyLiked] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [shareAnchor, setShareAnchor]   = useState(null);
    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

    const loginUser  = useMemo(() => getLoginUser(), []);
    const fetchedRef = useRef(null);

    const { canEdit, canDelete, canReport, canLike } = getPermissions(loginUser, article);
    const hasArticleAuthority = canEdit || canDelete;

    const showSnack  = useCallback((message, severity = "success") =>
        setSnack({ open: true, message, severity }), []);
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    const fetchData = useCallback(async (id) => {
        try {
            const data = await FreeBoardService.getFreeBoard(id);
            if (!data) { showSnack("존재하지 않는 게시글입니다.", "error"); navigate("/freeboard/list"); return; }
            const isNewPost = data.createdAt ? (new Date() - new Date(data.createdAt)) < 86400000 : false;
            setArticle({ ...data, userName: resolveUserName(data.userName), userId: data.userId || "Unknown", isNew: isNewPost });
        } catch {
            showSnack("게시글을 불러오는 중 오류가 발생했습니다.", "error");
            navigate("/freeboard/list");
            return;
        }

        if (loginUser) {
            try { setAlreadyLiked(!!(await FreeBoardService.checkLike(id))); }
            catch { setAlreadyLiked(false); }
        }

        try {
            const navData = await FreeBoardService.getNav(id);
            setPrevArticle(navData?.prev || null);
            setNextArticle(navData?.next || null);
        } catch {
            setPrevArticle(null);
            setNextArticle(null);
        }
    }, [navigate, loginUser, showSnack]);

    useEffect(() => {
        if (fetchedRef.current === String(boardId)) return;
        fetchedRef.current = String(boardId);
        setArticle(null);
        setAlreadyLiked(false);
        FreeBoardService.incrementView(boardId).catch(() => {});
        fetchData(boardId);
        window.scrollTo(0, 0);
    }, [boardId, fetchData]);

    const handleLike = async () => {
        if (!canLike) { showSnack("로그인이 필요합니다.", "warning"); return; }
        try {
            if (alreadyLiked) {
                const updated = await FreeBoardService.unlikeFreeBoard(currentBoardId);
                setAlreadyLiked(false);
                if (updated && typeof updated === "object") setArticle((p) => ({ ...p, likeCount: updated.likeCount }));
                showSnack("좋아요를 취소했습니다.", "success");
            } else {
                const updated = await FreeBoardService.likeFreeBoard(currentBoardId);
                setAlreadyLiked(true);
                if (updated && typeof updated === "object") setArticle((p) => ({ ...p, likeCount: updated.likeCount }));
                showSnack("좋아요를 눌렀습니다.", "success");
            }
        } catch { showSnack("좋아요 처리에 실패했습니다.", "error"); }
    };

    const handleDeleteRequest = () => {
        if (!hasArticleAuthority) { showSnack("삭제 권한이 없습니다.", "error"); return; }
        setDeleteDialog(true);
    };
    const handleDeleteConfirm = async () => {
        setDeleteDialog(false);
        try {
            await FreeBoardService.deleteFreeBoard(currentBoardId);
            showSnack("삭제되었습니다.", "success");
            setTimeout(() => navigate("/freeboard/list"), 800);
        } catch { showSnack("삭제 실패", "error"); }
    };

    const handleCommentCountChange = (delta) =>
        setArticle((prev) => prev ? { ...prev, commentCount: Math.max(0, (prev.commentCount || 0) + delta) } : prev);

    if (!article) return null;

    return (
        <>
            <Container maxWidth="md" className="fb-article-page">
                <div className="fb-top-bar">
                    {loginUser && (
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<CreateIcon />}
                            onClick={() => navigate("/freeboard/write")}
                            className="fb-article-write-btn"
                        >
                            글쓰기
                        </Button>
                    )}
                </div>

                <Paper elevation={2} className="fb-article-card" sx={{ p: { xs: 2, md: 4 } }}>
                    {/* 카테고리 + NEW */}
                    <div className="fb-meta-top">
                        <Chip label={article.category || "자유"} color={categoryColor(article.category)} size="small" variant="outlined" />
                        {article.isNew && (
                            <Chip label="NEW" color="error" size="small" variant="outlined"
                                sx={{ fontWeight: "bold", height: 18, fontSize: "0.65rem", px: 0.5 }} />
                        )}
                    </div>

                    {/* 제목 */}
                    <Typography variant="h4" className="fb-article-title" gutterBottom>
                        {article.title}
                    </Typography>

                    {/* 작성자 / 날짜 / 조회수 */}
                    <div className="fb-info-row">
                        <div className="fb-author-group">
                            <AuthorDisplay userId={article.userId} profileImage={article.profileImage} />
                            <Divider orientation="vertical" flexItem className="fb-author-divider" />
                            <Typography className="fb-article-date">{article.createdAt}</Typography>
                        </div>
                        <div className="fb-view-row">
                            <VisibilityIcon className="fb-view-icon" />
                            <Typography className="fb-view-count">{article.viewCount || 0}</Typography>
                            <Button
                                variant="text"
                                startIcon={<ShareIcon />}
                                onClick={(e) => setShareAnchor(e.currentTarget)}
                                className="fb-share-btn"
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
                        </div>
                    </div>

                    <Divider className="fb-article-divider" />

                    {/* 본문 */}
                    <div className="fb-article-body">{article.content}</div>

                    {/* 좋아요 */}
                    <div className="fb-like-section">
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<ThumbUpAltIcon />}
                            onClick={handleLike}
                            className={`fb-like-btn${alreadyLiked ? " is-liked" : ""}`}
                        >
                            좋아요 {article.likeCount || 0}
                        </Button>
                    </div>

                    {/* 액션 바 */}
                    <div className="fb-action-bar">
                        <Button startIcon={<ListAltIcon />} onClick={() => navigate("/freeboard/list")} className="fb-list-btn">
                            목록
                        </Button>
                        <div className="fb-action-right">
                            {canReport && <FreeBoardReportButton targetType="post" targetId={article.boardId} label="신고" />}
                            {hasArticleAuthority && (
                                <>
                                    <Button variant="outlined" startIcon={<EditIcon />}
                                        onClick={() => navigate(`/freeboard/edit/${boardId}`)}
                                        className="fb-edit-btn">
                                        수정
                                    </Button>
                                    <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteRequest}>
                                        삭제
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 이전글 / 다음글 */}
                    <div className="fb-nav-bar">
                        <Button
                            fullWidth
                            startIcon={<NavigateBeforeIcon />}
                            disabled={!prevArticle}
                            onClick={() => prevArticle && navigate(`/freeboard/article/${prevArticle.boardId}`)}
                            className="fb-nav-btn is-prev"
                        >
                            {prevArticle ? prevArticle.title : "이전글이 없습니다."}
                        </Button>
                        <Divider orientation="vertical" flexItem className="fb-nav-divider" />
                        <Button
                            fullWidth
                            endIcon={<NavigateNextIcon />}
                            disabled={!nextArticle}
                            onClick={() => nextArticle && navigate(`/freeboard/article/${nextArticle.boardId}`)}
                            className="fb-nav-btn is-next"
                        >
                            {nextArticle ? nextArticle.title : "다음글이 없습니다."}
                        </Button>
                    </div>

                    {/* 댓글 */}
                    <CommentSection
                        key={article.boardId}
                        boardId={article.boardId}
                        loginUser={loginUser}
                        onCommentCountChange={handleCommentCountChange}
                    />
                </Paper>
            </Container>

            <ConfirmDialog
                open={deleteDialog}
                title="게시글 삭제"
                message="게시글을 정말 삭제하시겠습니까?"
                confirmLabel="삭제"
                confirmColor="error"
                onConfirm={handleDeleteConfirm}
                onClose={() => setDeleteDialog(false)}
            />
            <SnackbarAlert
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={closeSnack}
                alertSx={snack.severity === "success" ? { bgcolor: "#00a1ff" } : {}}
            />
        </>
    );
};

export default FreeBoardArticlePage;

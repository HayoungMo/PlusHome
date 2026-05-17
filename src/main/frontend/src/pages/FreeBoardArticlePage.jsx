import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FreeBoardService from "../service/freeBoardService";
import FreeBoardArticleMui from "../components/FreeBoardArticleMui";
import { getLoginUser, isAdminUser, resolveUserName } from "../components/freeboard/constants";
import ConfirmDialog from "../components/ConfirmDialog";
import SnackbarAlert from "../components/SnackbarAlert";

const FreeBoardArticlePage = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const currentBoardId = Number(boardId);

    const [article, setArticle] = useState(null);
    const [prevArticle, setPrevArticle] = useState(null);
    const [nextArticle, setNextArticle] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

    const loginUser = useMemo(() => getLoginUser(), []);
    const isAdmin = isAdminUser(loginUser);
    const isArticleOwner = !!loginUser && !!article?.userId && String(loginUser.id) === String(article.userId);
    const hasArticleAuthority = isAdmin || isArticleOwner;
    const canReportArticle = !!loginUser && !isAdmin && !isArticleOwner;

    const showSnack = (message, severity = "success") =>
        setSnack({ open: true, message, severity });
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    const fetchData = useCallback(async () => {
        if (!boardId) return;
        try {
            const data = await FreeBoardService.getFreeBoard(boardId);
            if (!data) {
                showSnack("존재하지 않는 게시글입니다.", "error");
                return navigate("/freeboard/list");
            }
            setArticle({
                ...data,
                userName: resolveUserName(data.userName),
                userId: data.userId || "Unknown",
            });
            const navData = await FreeBoardService.getNav(boardId);
            setPrevArticle(navData?.prev || null);
            setNextArticle(navData?.next || null);
        } catch {
            showSnack("게시글을 불러오는 중 오류가 발생했습니다.", "error");
            navigate("/freeboard/list");
        }
    }, [boardId, navigate]);

    useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
    }, [fetchData]);

    // 공유
    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showSnack("공유 링크가 복사되었습니다.", "success");
        } catch {
            showSnack(`공유 링크: ${window.location.href}`, "info");
        }
    };

    // 좋아요
    const likedKey = `liked_${boardId}_${loginUser?.id}`;
    const [alreadyLiked, setAlreadyLiked] = useState(
        !!loginUser && !!localStorage.getItem(likedKey)
    );
    const handleLike = async () => {
        if (!loginUser) {
            showSnack("로그인이 필요합니다.", "warning");
            return;
        }
        if (alreadyLiked) {
            showSnack("이미 좋아요를 누른 게시글입니다.", "info");
            return;
        }
        try {
            const updatedData = await FreeBoardService.likeFreeBoard(currentBoardId);
            localStorage.setItem(likedKey, "true");
            setAlreadyLiked(true);
            setArticle((prev) => ({ ...prev, likeCount: updatedData.likeCount }));
        } catch {
            showSnack("좋아요 처리에 실패했습니다.", "error");
        }
    };

    // 삭제 요청 → 다이얼로그
    const handleDeleteRequest = () => {
        if (!hasArticleAuthority) {
            showSnack("삭제 권한이 없습니다.", "error");
            return;
        }
        setDeleteDialog(true);
    };

    // 삭제 확정
    const handleDeleteConfirm = async () => {
        setDeleteDialog(false);
        try {
            await FreeBoardService.deleteFreeBoard(currentBoardId);
            showSnack("삭제되었습니다.", "success");
            setTimeout(() => navigate("/freeboard/list"), 800);
        } catch {
            showSnack("삭제 실패", "error");
        }
    };

    // 댓글 수 실시간 반영
    const handleCommentCountChange = (delta) => {
        setArticle((prev) =>
            prev ? { ...prev, commentCount: Math.max(0, (prev.commentCount || 0) + delta) } : prev
        );
    };

    if (!article) return null;

    return (
        <>
            <FreeBoardArticleMui
                article={article}
                prevArticle={prevArticle}
                nextArticle={nextArticle}
                loginUser={loginUser}
                isAdmin={isAdmin}
                isOwner={isArticleOwner}
                hasAuthority={hasArticleAuthority}
                canReport={canReportArticle}
                onLike={handleLike}
                onDelete={handleDeleteRequest}
                onShare={handleShare}
                onCommentCountChange={handleCommentCountChange}
                onEdit={() => navigate(`/freeboard/edit/${boardId}`)}
                onBack={() => navigate("/freeboard/list")}
                onNavigate={(id) => navigate(`/freeboard/article/${id}`)}
            />

            {/* 삭제 확인 다이얼로그 */}
            <ConfirmDialog
                open={deleteDialog}
                title="게시글 삭제"
                message="게시글을 정말 삭제하시겠습니까?"
                confirmLabel="삭제"
                confirmColor="error"
                onConfirm={handleDeleteConfirm}
                onClose={() => setDeleteDialog(false)}
            />

            {/* 알림 스낵바 */}
            <SnackbarAlert
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={closeSnack}
            />
        </>
    );
};

export default FreeBoardArticlePage;

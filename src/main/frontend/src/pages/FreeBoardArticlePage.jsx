import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import "../css/FreeBoardArticlePage.css";
import { useNavigate, useParams } from "react-router-dom";
import FreeBoardService from "../service/freeBoardService";
import FreeBoardArticleMui from "../components/FreeBoardArticleMui";
import { getLoginUser, resolveUserName, getPermissions } from "../components/freeboard/constants";
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

    // 권한 계산
    const { isAdmin, isOwner, canEdit, canDelete, canReport, canLike } = getPermissions(loginUser, article);
    const hasArticleAuthority = canEdit || canDelete;

    const showSnack = useCallback((message, severity = "success") =>
        setSnack({ open: true, message, severity }), []);
    const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

    const likedKey = useMemo(() => `liked_${boardId}_${loginUser?.id}`, [boardId, loginUser]);
    const [alreadyLiked, setAlreadyLiked] = useState(false);

    const fetchedBoardIdRef = useRef(null);

    const fetchData = useCallback(async (id) => {
        try {
            setAlreadyLiked(!!loginUser && !!localStorage.getItem(`liked_${id}_${loginUser?.id}`));

            // /api/freeboard/article/{boardId} 순수 데이터 조회 API 호출
            const data = await FreeBoardService.getFreeBoard(id);
            if (!data) {
                showSnack("존재하지 않는 게시글입니다.", "error");
                return navigate("/freeboard/list");
            }

            // 작성시간 기준 24시간 이내 조건 계산 후 데이터 가공
            const isNewPost = data.createdAt ? (new Date() - new Date(data.createdAt)) < 24 * 60 * 60 * 1000 : false;

            setArticle({
                ...data,
                userName: resolveUserName(data.userName),
                userId: data.userId || "Unknown",
                isNew: isNewPost
            });

            const navData = await FreeBoardService.getNav(id);
            setPrevArticle(navData?.prev || null);
            setNextArticle(navData?.next || null);
        } catch {
            showSnack("게시글을 불러오는 중 오류가 발생했습니다.", "error");
            navigate("/freeboard/list");
        }
    }, [navigate, loginUser, showSnack]);

    useEffect(() => {
        if (fetchedBoardIdRef.current === String(boardId)) return;
        fetchedBoardIdRef.current = String(boardId);

        setArticle(null);
        setAlreadyLiked(false);

      
        FreeBoardService.incrementView(boardId).catch(() => {});
        fetchData(boardId);
        window.scrollTo(0, 0);
    }, [boardId, fetchData]);

    // 공유 링크 복사
    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showSnack("공유 링크가 복사되었습니다.", "success");
        } catch {
            showSnack(`공유 링크: ${window.location.href}`, "info");
        }
    };

  
    const handleLike = async () => {
        if (!canLike) {
            showSnack("로그인이 필요합니다.", "warning");
            return;
        }
        try {
            if (alreadyLiked) {
                // 좋아요 취소 진행
                const updatedData = await FreeBoardService.unlikeFreeBoard(currentBoardId);
                localStorage.removeItem(likedKey);
                setAlreadyLiked(false);
             
                if (updatedData && typeof updatedData === "object") {
                    setArticle((prev) => ({ ...prev, likeCount: updatedData.likeCount }));
                }
                showSnack("좋아요를 취소했습니다.", "success");
            } else {
                // 좋아요 등록 진행
                const updatedData = await FreeBoardService.likeFreeBoard(currentBoardId);
                localStorage.setItem(likedKey, "true");
                setAlreadyLiked(true);
                if (updatedData && typeof updatedData === "object") {
                    setArticle((prev) => ({ ...prev, likeCount: updatedData.likeCount }));
                }
                showSnack("좋아요를 눌렀습니다.", "success");
            }
        } catch {
            showSnack("좋아요 처리에 실패했습니다.", "error");
        }
    };

    // 삭제 처리 개시
    const handleDeleteRequest = () => {
        if (!hasArticleAuthority) {
            showSnack("삭제 권한이 없습니다.", "error");
            return;
        }
        setDeleteDialog(true);
    };

    // 삭제 수행 확정
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

    // 댓글 수 변경 이벤트 리스너
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
                isOwner={isOwner}
                hasAuthority={hasArticleAuthority}
                canReport={canReport}
                alreadyLiked={alreadyLiked}
                onLike={handleLike}
                onDelete={handleDeleteRequest}
                onShare={handleShare}
                onCommentCountChange={handleCommentCountChange}
                onEdit={() => navigate(`/freeboard/edit/${boardId}`)}
                onBack={() => navigate("/freeboard/list")}
                onNavigate={(id) => navigate(`/freeboard/article/${id}`)}
            />

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
            />
        </>
    );
};

export default FreeBoardArticlePage;
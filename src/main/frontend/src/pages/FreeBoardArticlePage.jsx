import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FreeBoardService from "../service/freeBoardService";
import FreeBoardArticleMui from "../components/FreeBoardArticleMui";
import { getLoginUser, isAdminUser, resolveUserName } from "../components/freeboard/constants";

const FreeBoardArticlePage = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const currentBoardId = Number(boardId);

    const [article, setArticle] = useState(null);
    const [prevArticle, setPrevArticle] = useState(null);
    const [nextArticle, setNextArticle] = useState(null);

    // 1. 사용자 정보 로드 (모듈 공통 유틸 사용)
    const loginUser = useMemo(() => getLoginUser(), []);

    // 2. 권한 관련 변수 설정
    const isAdmin = isAdminUser(loginUser);
    const isArticleOwner = !!loginUser && !!article?.userId && String(loginUser.id) === String(article.userId);
    const hasArticleAuthority = isAdmin || isArticleOwner;
    const canReportArticle = !!loginUser && !isAdmin && !isArticleOwner;

    // 3. 데이터 로드 (게시글 상세 + 이전/다음글)
    const fetchData = useCallback(async () => {
        if (!boardId) return;
        try {
            const data = await FreeBoardService.getFreeBoard(boardId);
            console.log("article data:", data); 
            if (!data) {
                alert("존재하지 않는 게시글입니다.");
                return navigate("/freeboard/list");
            }

            // 탈퇴 회원 및 데이터 정제 (공통 유틸 사용)
            const processedArticle = {
                ...data,
                userName: resolveUserName(data.userName),
                userId: data.userId ? data.userId : "Unknown",
            };
            setArticle(processedArticle);

            // 이전글/다음글 정보 조회
            const navData = await FreeBoardService.getNav(boardId);
            setPrevArticle(navData?.prev || null);
            setNextArticle(navData?.next || null);
        } catch (err) {
            console.error("데이터 로드 실패:", err);
            // 에러 발생시 화면전환x,메시지 처리
            alert("게시글을 불러오는 중 오류가 발생했습니다.");
            navigate("/freeboard/list");
        }
    }, [boardId, navigate]);

    useEffect(() => {
        fetchData();
        
        window.scrollTo(0, 0);
    }, [fetchData]);

    // 4. 공유 핸들러(url복사)
    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            alert("공유 링크가 복사되었습니다.");
        } catch {
            alert(`공유 링크: ${url}`);
        }
    };

    // 5. 좋아요 처리 
    // 5. 좋아요 처리
    const likedKey = `liked_${boardId}_${loginUser?.id}`;
    const [alreadyLiked, setAlreadyLiked] = useState(
        !!loginUser && !!localStorage.getItem(likedKey)
    );
    const handleLike = async () => {
        if (!loginUser) return alert("로그인이 필요합니다.");
        if (alreadyLiked) return alert("이미 좋아요를 누른 게시글입니다.");
        try {
            const updatedData = await FreeBoardService.likeFreeBoard(currentBoardId);
            localStorage.setItem(likedKey, "true");
            setAlreadyLiked(true);
            setArticle((prev) => ({ ...prev, likeCount: updatedData.likeCount }));
        } catch { 
            alert("좋아요 처리에 실패했습니다."); 
        }
    };
    // 6. 삭제 처리
    const handleDelete = async () => {
        if (!hasArticleAuthority) return alert("삭제 권한이 없습니다.");
        if (!window.confirm("게시글을 정말 삭제하시겠습니까?")) return;
        try {
            await FreeBoardService.deleteFreeBoard(currentBoardId);
            alert("삭제되었습니다.");
            navigate("/freeboard/list");
        } catch { alert("삭제 실패"); }
    };

    // 7. 댓글 수 실시간 반영
    const handleCommentCountChange = (delta) => {
        setArticle(prev => prev ? {
            ...prev,
            commentCount: Math.max(0, (prev.commentCount || 0) + delta)
        } : prev);
    };

    if (!article) return null;

    return (
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
            onDelete={handleDelete}
            onShare={handleShare}
            onCommentCountChange={handleCommentCountChange}
            onEdit={() => navigate(`/freeboard/edit/${boardId}`)}
            onBack={() => navigate("/freeboard/list")}
            onNavigate={(id) => navigate(`/freeboard/article/${id}`)}
        />
    );
};

export default FreeBoardArticlePage;
import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Stack,
    Typography,
    TextField,
    Button,
    List,
} from "@mui/material";

import FreeBoardCommentService from "../service/freeBoardCommentService";
import FreeBoardCommentItemMui from "./FreeBoardCommentItemMui";

/**
 * 자유게시판 댓글 섹션 컴포넌트
 * - 댓글 목록 조회/등록/수정/삭제/대댓글 처리
 * - 권한 체크: 본인 또는 관리자(type=admin)
 *
 * props:
 *   boardId        : 게시글 번호 (필수)
 *   loginUser      : 로그인 유저 객체 (없으면 null)
 *   onCommentCountChange : (delta) => void (선택)
 *      댓글 등록(+1) / 삭제(-1) 시 호출되어 상위에서 게시글 commentCount 동기화 가능
 */
const FreeBoardCommentMui = ({ boardId, loginUser, onCommentCountChange }) => {
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState("");

    // 관리자 여부: USERS.TYPE = 'admin' 인 사용자는 모든 권한
    const isAdmin = loginUser?.type === "admin";
    const currentBoardId = Number(boardId);

    const loadComments = useCallback(async () => {
        try {
            const list = await FreeBoardCommentService.getComments(boardId);
            setComments(list || []);
        } catch (error) {
            console.error("댓글 로딩 실패:", error);
        }
    }, [boardId]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    // 댓글 등록
    const handleCommentSubmit = async () => {
        if (!loginUser) {
            alert("로그인 후 이용 가능합니다.");
            return;
        }
        if (!commentContent.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }
        const newComment = {
            boardId: currentBoardId,
            content: commentContent.trim(),
            userId: loginUser.id,
            userName: loginUser.name,
            parentId: null,
        };
        try {
            await FreeBoardCommentService.writeComment(newComment);
            setCommentContent("");
            await loadComments();
            if (onCommentCountChange) onCommentCountChange(1);
        } catch {
            alert("댓글 등록 실패");
        }
    };

    // 대댓글 등록
    const handleReply = async (parentId, content) => {
        if (!loginUser) {
            alert("로그인 후 이용 가능합니다.");
            return;
        }
        const newReply = {
            boardId: currentBoardId,
            content,
            userId: loginUser.id,
            userName: loginUser.name,
            parentId,
        };
        try {
            await FreeBoardCommentService.writeComment(newReply);
            await loadComments();
            if (onCommentCountChange) onCommentCountChange(1);
        } catch {
            alert("답글 등록 실패");
        }
    };

    // 댓글 수정
    const handleUpdate = async (commentId, content) => {
        try {
            await FreeBoardCommentService.updateComment({
                commentId,
                content,
            });
            await loadComments();
        } catch {
            alert("수정 실패");
        }
    };

    // 댓글 삭제
    const handleDelete = async (commentId) => {
        try {
            await FreeBoardCommentService.deleteComment(
                currentBoardId,
                commentId
            );
            setComments((prev) =>
                prev.filter((c) => c.commentId !== commentId)
            );
            if (onCommentCountChange) onCommentCountChange(-1);
        } catch {
            alert("삭제 실패");
        }
    };

    // 댓글 트리 구조용
    const rootComments = comments.filter((c) => !c.parentId);
    const repliesOf = (commentId) =>
        comments.filter((c) => c.parentId === commentId);

    return (
        <Box sx={{ mt: 5 }}>
            <Typography variant="h6" gutterBottom>
                댓글 {comments.length}개
            </Typography>
            <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                <TextField
                    placeholder={
                        loginUser
                            ? "댓글을 입력하세요"
                            : "로그인 후 댓글을 남겨보세요"
                    }
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    size="small"
                    multiline
                    minRows={2}
                    fullWidth
                    disabled={!loginUser}
                />
                <Button
                    variant="contained"
                    onClick={handleCommentSubmit}
                    sx={{ minWidth: 80 }}
                    disabled={!loginUser}
                >
                    등록
                </Button>
            </Stack>

            <List sx={{ p: 0 }}>
                {rootComments.map((c) => (
                    <React.Fragment key={c.commentId}>
                        <FreeBoardCommentItemMui
                            comment={c}
                            isReply={false}
                            loginUser={loginUser}
                            isAdmin={isAdmin}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            onReply={handleReply}
                        />
                        {repliesOf(c.commentId).map((r) => (
                            <FreeBoardCommentItemMui
                                key={r.commentId}
                                comment={r}
                                isReply={true}
                                loginUser={loginUser}
                                isAdmin={isAdmin}
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}
                                onReply={handleReply}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};

export default FreeBoardCommentMui;

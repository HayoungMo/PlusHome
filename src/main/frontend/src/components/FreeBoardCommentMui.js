import React, { useState, useEffect, useCallback } from "react";
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
 */
const FreeBoardCommentMui = ({ boardId, loginUser, onCommentCountChange }) => {
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState("");

    const isAdmin = loginUser?.type === "admin";
    const currentBoardId = Number(boardId);

    // 댓글 로딩
    const loadComments = useCallback(async () => {
        try {
            const userType = loginUser?.type || "guest"; 
            const list = await FreeBoardCommentService.getComments(boardId, userType);
            
            const processedList = (list || []).map(comment => ({
                ...comment,
                userName: (comment.userName && comment.userName.trim()) ? comment.userName : "탈퇴한 회원"
            }));
            
            setComments(processedList);
        } catch (error) {
            console.error("댓글 로딩 실패:", error);
        }
    }, [boardId, loginUser]);

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

    const handleDelete = async (commentId) => {
        
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
        
            await FreeBoardCommentService.deleteComment(boardId, commentId);
            
            // 2. 성공 시에만 알림
            alert("삭제되었습니다."); 
            loadComments(); 
            
        } catch (error) {
            console.error("삭제 에러 상세:", error);
            
            // 3. 에러 발생 시 상태 코드에 따라 알림창 하나만 띄우기
            if (error.response && error.response.status === 401) {
                alert("로그인 정보가 없거나 만료되었습니다. 다시 로그인해 주세요.");
            } else if (error.response && error.response.status === 403) {
                alert("삭제 권한이 없습니다. (본인 댓글만 삭제 가능)");
            } else {
                alert("삭제 중 서버 오류가 발생했습니다.");
            }
        }
    };
    // 댓글 정렬
    const byCreatedDesc = (a, b) => {
        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (tb !== ta) return tb - ta;
        return (b?.commentId || 0) - (a?.commentId || 0);
    };

    const rootComments = comments
        .filter((c) => !c.parentId)
        .slice()
        .sort(byCreatedDesc);

    const repliesOf = (commentId) =>
        comments
            .filter((c) => c.parentId === commentId)
            .slice()
            .sort(byCreatedDesc);

    return (
        <Box sx={{ mt: 5 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                댓글 {comments.length}개
            </Typography>

            <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                <TextField
                    placeholder={
                        loginUser
                            ? "따뜻한 댓글을 남겨주세요."
                            : "로그인 후 댓글을 남겨보세요."
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
                    sx={{ minWidth: 80, height: 'fit-content', py: 1.5 }}
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
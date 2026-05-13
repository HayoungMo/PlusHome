import React, { useState } from "react";
import {
    Box, Stack, Typography, TextField, Button, Avatar, Chip,
    ListItem, ListItemAvatar, ListItemText
} from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import PersonIcon from "@mui/icons-material/Person";
import FreeBoardReportButton from "./freeboard/FreeBoardReportButton";
import { ADMIN_TYPE } from "./freeboard/constants";

const FreeBoardCommentItemMui = ({
    comment,
    isReply = false,
    loginUser,
    isAdmin, // 부모(Mui)로부터 전달받은 관리자 여부
    onUpdate,
    onDelete,
    onReply,
}) => {
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content || "");
    const [replyOpen, setReplyOpen] = useState(false);
    const [replyContent, setReplyContent] = useState("");

    // [로직 수정] 관리자이거나, 로그인한 유저가 작성자인 경우 권한 부여
    const hasAuthority = isAdmin || (loginUser && loginUser.id === comment.userId);
    
    // 신고 버튼은 관리자가 아니고, 본인 댓글이 아닐 때만 노출
    const canReport = !!loginUser && !isAdmin && loginUser.id !== comment.userId;

    // 삭제 버튼 클릭 핸들러
    const handleDeleteClick = (e) => {
        if (e) e.stopPropagation(); 
       
        onDelete(comment.commentId); 
    };

    const handleEditSave = async () => {
        if (!editContent.trim()) { alert("내용을 입력해주세요."); return; }
        await onUpdate(comment.commentId, editContent.trim());
        setEditing(false);
    };

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) { alert("답글 내용을 입력해주세요."); return; }
        await onReply(comment.commentId, replyContent.trim());
        setReplyOpen(false);
        setReplyContent("");
    };

    return (
        <ListItem
            alignItems="flex-start"
            sx={{
                pl: isReply ? 6 : 2,
                bgcolor: isReply ? "action.hover" : "transparent",
                borderBottom: "1px solid",
                borderColor: "divider",
                transition: "background-color 0.2s",
                "&:hover": { bgcolor: isReply ? "action.selected" : "action.hover" }
            }}
        >
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: isReply ? "secondary.light" : "primary.light" }}>
                    {isReply ? <ReplyIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                disableTypography
                primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" fontWeight="bold">
                            {comment.userName}
                            {/*유저가 관리자인 경우 칩 표시 */}
                            {(comment.userType === ADMIN_TYPE || comment.userId === 'admin1') && (
                                <Chip 
                                    label="관리자" 
                                    size="small" 
                                    color="primary"
                                    sx={{ height: 16, fontSize: "0.6rem", ml: 0.5, fontWeight: 'bold' }} 
                                />
                            )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {comment.createdAt}
                        </Typography>
                    </Stack>
                }
                secondary={
                    <Box sx={{ mt: 1 }}>
                        {editing ? (
                            <Stack spacing={1} sx={{ mt: 1 }}>
                                <TextField 
                                    value={editContent} 
                                    onChange={(e) => setEditContent(e.target.value)} 
                                    size="small" 
                                    multiline 
                                    fullWidth 
                                    autoFocus
                                />
                                <Stack direction="row" spacing={1}>
                                    <Button size="small" variant="contained" onClick={handleEditSave}>저장</Button>
                                    <Button size="small" variant="outlined" onClick={() => setEditing(false)}>취소</Button>
                                </Stack>
                            </Stack>
                        ) : (
                            <>
                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", color: "text.primary", mb: 1 }}>
                                    {comment.content}
                                </Typography>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    {!isReply && loginUser && (
                                        <Button size="small" variant="text" onClick={() => setReplyOpen(!replyOpen)}>
                                            {replyOpen ? "답글취소" : "답글"}
                                        </Button>
                                    )}
                                    {hasAuthority && (
                                        <>
                                            <Button size="small" variant="text" onClick={() => setEditing(true)}>수정</Button>
                                            <Button size="small" variant="text" color="error" onClick={handleDeleteClick}>삭제</Button>
                                        </>
                                    )}
                                    {canReport && <FreeBoardReportButton targetType="comment" targetId={comment.commentId} />}
                                </Stack>
                            </>
                        )}
                        
                        {!isReply && replyOpen && !editing && (
                            <Stack direction="row" spacing={1} sx={{ mt: 2, pb: 1 }}>
                                <TextField 
                                    size="small" 
                                    placeholder="답글 내용을 입력하세요..." 
                                    value={replyContent} 
                                    onChange={(e) => setReplyContent(e.target.value)} 
                                    fullWidth 
                                />
                                <Button variant="contained" size="small" onClick={handleReplySubmit} sx={{ minWidth: 60 }}>
                                    등록
                                </Button>
                            </Stack>
                        )}
                    </Box>
                }
            />
        </ListItem>
    );
};

export default FreeBoardCommentItemMui;
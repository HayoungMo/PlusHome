import React, { useState } from "react";
import {
    Box, Stack, Typography, Chip, List, ListItemButton, ListItemText, Button, Snackbar, Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import "../../css/freeBoardStats.css";

const PREVIEW_COUNT = 3; // 기본으로 보여줄 개수

const StatsSection = ({
    title,
    count = 0,
    items = [],
    onItemClick,
    emptyText = "데이터가 없습니다.",
    rightLabel,
}) => {
    const [expanded, setExpanded] = useState(false);
    const [hiddenSnack, setHiddenSnack] = useState(false);

    const visibleItems = expanded ? items : items.slice(0, PREVIEW_COUNT);
    const hasMore = items.length > PREVIEW_COUNT;

    const handleItemClick = (it) => {
        if (it.hidden) {
            setHiddenSnack(true);
            return;
        }
        onItemClick && onItemClick(it);
    };

    return (
        <Box sx={{ mb: 1.5 }}>
            {/* 섹션 헤더 */}
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                <Typography className="stats-section-title">
                    {title}
                </Typography>
                <Chip
                    label={`${count}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 18, fontSize: "0.65rem", px: 0.5 }}
                />
            </Stack>

            {/* 리스트 */}
            {items.length === 0 ? (
                <Typography className="stats-empty-text">{emptyText}</Typography>
            ) : (
                <List dense disablePadding>
                    {visibleItems.map((it) => (
                        <ListItemButton
                            key={it.boardId || it.commentId}
                            onClick={() => handleItemClick(it)}
                            sx={{ py: 0.25, px: 0.5 }}
                        >
                            <ListItemText
                                primary={
                                    <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 0.5 }}>
                                        <Typography
                                            className={`stats-ellipsis-text ${it.hidden ? "stats-item-hidden" : ""}`}
                                            variant="caption"
                                            sx={{ flex: 1, textAlign: "left", minWidth: 0 }}
                                        >
                                            {it.title || it.content}
                                        </Typography>
                                        {rightLabel && (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, flexShrink: 0, fontSize: "0.7rem", color: "text.secondary", ml: "auto" }}>
                                                {rightLabel(it)}
                                            </Box>
                                        )}
                                    </Box>
                                }
                            />
                        </ListItemButton>
                    ))}
                </List>
            )}

            {/* 더보기 / 접기 버튼 */}
            {hasMore && (
                <Button
                    size="small"
                    variant="text"
                    endIcon={expanded ? <ExpandLessIcon fontSize="inherit" /> : <ExpandMoreIcon fontSize="inherit" />}
                    onClick={() => setExpanded((prev) => !prev)}
                    sx={{ fontSize: "0.7rem", color: "#4b6bbb", mt: 0.3, p: 0, minWidth: 0 }}
                >
                    {expanded ? "접기" : `더보기 (${items.length - PREVIEW_COUNT}개 더)`}
                </Button>
            )}

            {/* 숨김 게시글 클릭 알림 */}
            <Snackbar
                open={hiddenSnack}
                autoHideDuration={3000}
                onClose={() => setHiddenSnack(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={() => setHiddenSnack(false)} severity="warning" sx={{ width: "100%" }}>
                    관리자에 의해 비공개 처리 되었습니다.
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StatsSection;

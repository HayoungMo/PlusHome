import React from "react";
import { Box, Stack, Typography, Chip, List, ListItemButton, ListItemText } from "@mui/material";

const StatsSection = ({
    title,
    count = 0,
    items = [],
    onItemClick,
    emptyText = "데이터가 없습니다.",
    rightLabel,
    showHidden = false,
}) => {
    return (
        <Box sx={{ mb: 1.5 }}> {/* 간격을 살짝 줄임 */}
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="caption" fontWeight="bold" sx={{ fontSize: "0.75rem" }}>
                    {title}
                </Typography>
                <Chip
                    label={`${count}`} // '개' 글자를 빼서 공간 확보
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 18, fontSize: "0.65rem", px: 0.5 }}
                />
            </Stack>

            {items.length === 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", pl: 0.5 }}>
                    {emptyText}
                </Typography>
            ) : (
                <List dense disablePadding>
                    {items.map((it) => (
                        <ListItemButton
                            key={it.boardId || it.commentId}
                            onClick={() => onItemClick && onItemClick(it)}
                            sx={{ py: 0.1, px: 0.5 }} // 위아래 여백 최소화
                        >
                            <ListItemText
                                primary={
                                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="space-between">
                                        <Stack direction="row" spacing={0.3} alignItems="center" sx={{ minWidth: 0, flexGrow: 1 }}>
                                            <Typography
                                                variant="caption"
                                                noWrap
                                                sx={{
                                                    fontSize: "0.7rem", // 글자 크기 축소
                                                    maxWidth: "110px", // 너비가 좁아졌으므로 최대 폭 줄임
                                                    textDecoration: showHidden && it.hidden ? "line-through" : "none",
                                                    color: showHidden && it.hidden ? "text.disabled" : "text.primary",
                                                }}
                                            >
                                                {it.title || it.content || `#${it.boardId || it.commentId}`}
                                            </Typography>
                                            
                                            {showHidden && it.hidden && (
                                                <Chip
                                                    label="숨김"
                                                    size="small"
                                                    color="warning"
                                                    sx={{ height: 14, fontSize: "0.55rem", px: 0.3 }}
                                                />
                                            )}
                                        </Stack>

                                        {rightLabel && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ 
                                                    fontSize: "0.65rem", 
                                                    ml: 0.5,
                                                    whiteSpace: "nowrap", // 날짜 등이 줄바꿈되지 않게
                                                    flexShrink: 0 
                                                }}
                                            >
                                                {rightLabel(it)}
                                            </Typography>
                                        )}
                                    </Stack>
                                }
                            />
                        </ListItemButton>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default StatsSection;
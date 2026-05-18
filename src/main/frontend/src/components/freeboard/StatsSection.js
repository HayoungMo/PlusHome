import React from "react";
import { Box, Stack, Typography, Chip, List, ListItemButton, ListItemText } from "@mui/material";
import "../../css/freeBoardStats.css";


const StatsSection = ({
    title,
    count = 0,
    items = [],
    onItemClick,
    emptyText = "데이터가 없습니다.",
    rightLabel,
}) => {
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

            {/* 리스트 본문 */}
            {items.length === 0 ? (
                <Typography className="stats-empty-text">
                    {emptyText}
                </Typography>
            ) : (
                <List dense disablePadding>
                    {items.map((it) => (
                        <ListItemButton
                            key={it.boardId || it.commentId}
                            onClick={() => onItemClick && onItemClick(it)}
                            sx={{ py: 0.25, px: 0.5 }}
                        >
                            <ListItemText
                                primary={
                                    <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 0.5 }}>
                                        {/* 제목: 왼쪽 정렬, 넘치면 말줄임 */}
                                        <Typography
                                            className={`stats-ellipsis-text ${it.hidden ? "stats-item-hidden" : ""}`}
                                            variant="caption"
                                            sx={{ flex: 1, textAlign: "left", minWidth: 0 }}
                                        >
                                            {it.title || it.content}
                                        </Typography>

                                        {/* 아이콘+숫자: 오른쪽 고정 */}
                                        {rightLabel && (
                                            <Box
                                                sx={{ display: "flex", alignItems: "center", gap: 0.3, flexShrink: 0, fontSize: "0.7rem", color: "text.secondary", ml: "auto" }}
                                            >
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
        </Box>
    );
};

export default StatsSection;
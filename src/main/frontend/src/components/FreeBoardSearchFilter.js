import React, { useState, useEffect } from "react";
import {
    Box, Stack, TextField, MenuItem, Select,
    Paper, Button, Typography, FormControl, InputLabel,
    Popover, IconButton,
} from "@mui/material";
import {
    Search as SearchIcon,
    CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import FreeBoardStatsService from "../service/freeBoardStatsService";

const FreeBoardSearchFilter = ({ params, onSearch, onCategoryChange, onDateSearch }) => {
    const [inputValue, setInputValue]     = useState(params.searchValue ?? "");
    const [startDate, setStartDate]       = useState(params.startDate ? dayjs(params.startDate) : null);
    const [endDate, setEndDate]           = useState(params.endDate   ? dayjs(params.endDate)   : null);
    const [dateAnchor, setDateAnchor]     = useState(null);
    const [topLikedPosts, setTopLikedPosts] = useState([]);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);

    // 검색어 외부 변경 동기화
    useEffect(() => {
        setInputValue(params.searchValue ?? "");
    }, [params.searchValue]);

    // 인기글 조회 (placeholder 회전용)
    useEffect(() => {
        const fetchTopLiked = async () => {
            try {
                const data = await FreeBoardStatsService.getPublicStats();
                setTopLikedPosts(data?.topLiked || []);
            } catch (err) {
                console.error("인기 게시글 조회 실패:", err);
            }
        };
        fetchTopLiked();
    }, []);

    const ROTATING_PLACEHOLDERS = topLikedPosts.length > 0
        ? topLikedPosts.slice(0, 5).map((post) => `실시간 인기글 : ${post.title}`)
        : ["검색어를 입력하세요"];

    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIdx((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
        }, 2000);
        return () => clearInterval(timer);
    }, [ROTATING_PLACEHOLDERS.length]);

    const handleSearchSubmit = () => {
        onSearch({ value: inputValue, key: "title" });
    };

    const handleDateReset = () => {
        setStartDate(null);
        setEndDate(null);
        onDateSearch({ startDate: "", endDate: "" });
    };

    const handleDateSearch = () => {
        onDateSearch({
            startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
            endDate:   endDate   ? endDate.format("YYYY-MM-DD")   : "",
        });
        setDateAnchor(null);
    };

    const hasActiveDates = !!(startDate || endDate);

    return (
        <Paper sx={{ p: 2, mb: 3, border: "1px solid #c5d4f0" }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center">
                {/* 날짜 팝오버 트리거 */}
                <IconButton
                    onClick={(e) => setDateAnchor(e.currentTarget)}
                    sx={{
                        color:   hasActiveDates ? "#1e3a8a" : "#aec4ed",
                        border:  hasActiveDates ? "1px solid #4b6bbb" : "1px solid #c5d4f0",
                        borderRadius: 1,
                        p: "6px",
                        flexShrink: 0,
                        position: "relative",
                        bgcolor: hasActiveDates ? "#eef2fa" : "transparent",
                    }}
                    title="기간 검색"
                >
                    <CalendarTodayIcon fontSize="small" />
                    {hasActiveDates && (
                        <Box sx={{
                            position: "absolute",
                            top: 4, right: 4,
                            width: 7, height: 7,
                            borderRadius: "50%",
                            bgcolor: "#1e3a8a",
                        }} />
                    )}
                </IconButton>

                {/* 카테고리 */}
                <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>카테고리</InputLabel>
                    <Select
                        value={params.category}
                        label="카테고리"
                        onChange={(e) => onCategoryChange(e.target.value)}
                    >
                        <MenuItem value="">전체</MenuItem>
                        <MenuItem value="공지">공지</MenuItem>
                        <MenuItem value="자유">자유</MenuItem>
                        <MenuItem value="질문">질문</MenuItem>
                        <MenuItem value="정보">정보</MenuItem>
                        <MenuItem value="광고">광고</MenuItem>
                        <MenuItem value="이벤트">이벤트</MenuItem>
                    </Select>
                </FormControl>

                {/* 검색어 입력 */}
                <TextField
                    size="small"
                    placeholder={ROTATING_PLACEHOLDERS[placeholderIdx]}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                    sx={{ flexGrow: 1 }}
                />

                <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleSearchSubmit}
                    sx={{ bgcolor: "#4b6bbb", "&:hover": { bgcolor: "#3a57a3" }, flexShrink: 0 }}
                >
                    검색
                </Button>
            </Stack>

            {/* 활성 날짜 표시 */}
            {hasActiveDates && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: "#4b6bbb" }}>
                        기간: {startDate ? startDate.format("YYYY-MM-DD") : "시작일"} ~ {endDate ? endDate.format("YYYY-MM-DD") : "종료일"}
                    </Typography>
                    <Button
                        size="small"
                        variant="text"
                        onClick={handleDateReset}
                        sx={{ color: "#aec4ed", fontSize: "0.72rem", p: 0, minWidth: 0 }}
                    >
                        초기화
                    </Button>
                </Stack>
            )}

            {/* 날짜 선택 팝오버 */}
            <Popover
                open={Boolean(dateAnchor)}
                anchorEl={dateAnchor}
                onClose={() => setDateAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{ sx: { p: 2, border: "1px solid #c5d4f0", borderRadius: 2, mt: 0.5 } }}
            >
                <Typography variant="caption" sx={{ color: "#1e3a8a", fontWeight: "bold", mb: 1.5, display: "block" }}>
                    기간 검색
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Stack spacing={1.5}>
                        <DatePicker
                            label="시작일"
                            value={startDate}
                            onChange={(val) => setStartDate(val)}
                            format="YYYY.MM.DD"
                            maxDate={endDate || undefined}
                            slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
                        />
                        <DatePicker
                            label="종료일"
                            value={endDate}
                            onChange={(val) => setEndDate(val)}
                            format="YYYY.MM.DD"
                            minDate={startDate || undefined}
                            slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
                        />
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {(startDate || endDate) && (
                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => { setStartDate(null); setEndDate(null); }}
                                    sx={{ color: "#aec4ed" }}
                                >
                                    초기화
                                </Button>
                            )}
                            <Button
                                size="small"
                                variant="contained"
                                onClick={handleDateSearch}
                                sx={{ bgcolor: "#1e3a8a", "&:hover": { bgcolor: "#1a317a" } }}
                            >
                                기간검색
                            </Button>
                        </Stack>
                    </Stack>
                </LocalizationProvider>
            </Popover>
        </Paper>
    );
};

export default FreeBoardSearchFilter;

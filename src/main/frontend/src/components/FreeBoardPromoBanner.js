import React, { useState, useEffect, useRef } from "react";
import {
    Box, Stack, Typography, Chip, IconButton,
    Card, CardActionArea, CardContent, Avatar, Skeleton,
} from "@mui/material";
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    StorefrontOutlined as StorefrontIcon,
    HomeWorkOutlined as HomeWorkIcon,
} from "@mui/icons-material";
import FurnitureService from "../service/furnitureService";
import InteriorService from "../service/interiorService";
import { getImgFurnitureList } from "../resources/function/GetImgDir";

const VISIBLE_COUNT   = 3;
const SLIDE_INTERVAL  = 3500;
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5분

const FreeBoardPromoBanner = ({ navigate }) => {
    const [items, setItems]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [idx, setIdx]           = useState(0);
    const timerRef    = useRef(null);
    const refreshRef  = useRef(null);
    const itemsLenRef = useRef(0);

    // 데이터 로드 함수 — ref로 감싸 의존성 없이 재사용
    const loadData = useRef(async () => {
        setLoading(true);
        try {
            const [furRes, intRes] = await Promise.all([
                FurnitureService.getFurniture({ pageNum: 1, sort: "latest" }),
                InteriorService.fetchList(),
            ]);

            const furList = (furRes?.list || []).slice(0, 6);
            let furWithImg = furList;
            try { furWithImg = await getImgFurnitureList(furList); } catch { /* 이미지 실패 시 원본 사용 */ }

            const furItems = furWithImg.map(f => ({
                id:        `f-${f.f_code}`,
                type:      "furniture",
                name:      f.f_name,
                sub:       f.f_dprice ? `${f.f_dprice.toLocaleString()}원`
                         : f.f_price  ? `${f.f_price.toLocaleString()}원` : "",
                thumbnail: f.thumbnail || null,
                f_code:    f.f_code,
            }));

            const intItems = (intRes || []).slice(0, 6).map(c => ({
                id:        `i-${c.c_id}`,
                type:      "interior",
                name:      c.c_name,
                sub:       c.c_addr ? c.c_addr.slice(0, 20) : "인테리어 전문 업체",
                thumbnail: null,
                company:   c,
            }));

            const combined = [...furItems, ...intItems];
            itemsLenRef.current = combined.length;
            setItems(combined);
        } catch (e) {
            console.error("FreeBoardPromoBanner 로드 실패:", e);
        } finally {
            setLoading(false);
        }
    }).current;

    // 초기 로드 + 5분 주기 갱신 (슬라이드 위치 유지)
    useEffect(() => {
        loadData();
        refreshRef.current = setInterval(() => loadData(), REFRESH_INTERVAL);
        return () => clearInterval(refreshRef.current);
    }, [loadData]);

    // 자동 슬라이드
    const startTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setIdx(prev => (prev + 1) % Math.max(1, itemsLenRef.current));
        }, SLIDE_INTERVAL);
    };

    useEffect(() => {
        if (items.length > VISIBLE_COUNT) startTimer();
        return () => clearInterval(timerRef.current);
    }, [items.length]);

    const handlePrev = () => { setIdx(prev => (prev - 1 + items.length) % items.length); startTimer(); };
    const handleNext = () => { setIdx(prev => (prev + 1) % items.length); startTimer(); };

    const visibleItems = items.length === 0 ? [] : Array.from(
        { length: Math.min(VISIBLE_COUNT, items.length) },
        (_, i) => {
            const realIdx = (idx + i) % items.length;
            return { ...items[realIdx], _key: `${items[realIdx].id}-${i}` };
        }
    );

    const handleCardClick = (item) => {
        if (item.type === "furniture") {
            navigate(`/furniture/${item.f_code}`);
        } else {
            navigate("/interior/article", { state: { company: item.company } });
        }
    };

    if (!loading && items.length === 0) return null;

    return (
        <Box sx={{ mt: 3, mb: 1 }}>
            {/* 헤더 */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{
                        width: 4, height: 20, borderRadius: 1,
                        background: "linear-gradient(180deg, #1e3a8a 0%, #4b6bbb 100%)",
                    }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1e3a8a", fontSize: "0.9rem" }}>
                        추천 상품 &amp; 인테리어 업체
                    </Typography>
                    <Chip label="PLUS" size="small" sx={{ bgcolor: "#eef2fa", color: "#4b6bbb", fontSize: "0.6rem", height: 18, fontWeight: "bold" }} />
                </Stack>
                <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={handlePrev} disabled={items.length <= VISIBLE_COUNT}
                        sx={{ color: "#4b6bbb", border: "1px solid #c5d4f0", width: 26, height: 26,
                              "&:hover": { bgcolor: "#eef2fa" }, "&:disabled": { opacity: 0.3 } }}>
                        <ChevronLeftIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton size="small" onClick={handleNext} disabled={items.length <= VISIBLE_COUNT}
                        sx={{ color: "#4b6bbb", border: "1px solid #c5d4f0", width: 26, height: 26,
                              "&:hover": { bgcolor: "#eef2fa" }, "&:disabled": { opacity: 0.3 } }}>
                        <ChevronRightIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Stack>
            </Stack>

            {/* 카드 슬라이드 영역 */}
            <Box sx={{ display: "flex", gap: 1.5, overflow: "hidden" }}>
                {loading
                    ? Array.from({ length: VISIBLE_COUNT }).map((_, i) => (
                        <Box key={i} sx={{ flex: 1 }}>
                            <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 2 }} />
                            <Skeleton width="60%" sx={{ mt: 0.5 }} />
                            <Skeleton width="40%" />
                        </Box>
                    ))
                    : visibleItems.map((item) => (
                        <Card key={item._key} elevation={0} sx={{
                            flex: 1,
                            border: "1px solid #e0e9f8",
                            borderRadius: 2,
                            transition: "box-shadow 0.2s, transform 0.2s",
                            "&:hover": { boxShadow: "0 4px 16px rgba(30,58,138,0.12)", transform: "translateY(-2px)" },
                            cursor: "pointer",
                            bgcolor: item.type === "interior" ? "#f8faff" : "#fff",
                        }}>
                            <CardActionArea onClick={() => handleCardClick(item)}
                                sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
                                {/* 이미지 or 아이콘 */}
                                <Box sx={{
                                    height: 100, display: "flex", alignItems: "center", justifyContent: "center",
                                    bgcolor: item.type === "furniture" ? "#eef2fa" : "#e8f4f0",
                                    borderRadius: "8px 8px 0 0", overflow: "hidden",
                                }}>
                                    {item.thumbnail ? (
                                        <Box component="img" src={item.thumbnail} alt={item.name}
                                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            onError={(e) => { e.target.style.display = "none"; }} />
                                    ) : (
                                        <Avatar sx={{
                                            width: 48, height: 48,
                                            bgcolor: item.type === "furniture" ? "#aec4ed" : "#c5ddd8",
                                            color:  item.type === "furniture" ? "#1e3a8a" : "#2f5d50",
                                        }}>
                                            {item.type === "furniture"
                                                ? <StorefrontIcon sx={{ fontSize: 26 }} />
                                                : <HomeWorkIcon   sx={{ fontSize: 26 }} />}
                                        </Avatar>
                                    )}
                                </Box>
                                {/* 카드 본문 */}
                                <CardContent sx={{ p: 1, pb: "8px !important", flex: 1 }}>
                                    <Chip
                                        label={item.type === "furniture" ? "상품" : "인테리어"}
                                        size="small"
                                        sx={{
                                            height: 16, fontSize: "0.6rem", mb: 0.5,
                                            bgcolor: item.type === "furniture" ? "#eef2fa" : "#e8f4f0",
                                            color:   item.type === "furniture" ? "#4b6bbb" : "#2f5d50",
                                        }}
                                    />
                                    <Typography variant="body2" sx={{
                                        fontWeight: "bold", fontSize: "0.75rem", color: "#1e3a8a",
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    }}>
                                        {item.name}
                                    </Typography>
                                    {item.sub && (
                                        <Typography variant="caption" sx={{ color: "#4b6bbb", fontSize: "0.68rem" }}>
                                            {item.sub}
                                        </Typography>
                                    )}
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))
                }
            </Box>

            {/* 인디케이터 도트 */}
            {items.length > VISIBLE_COUNT && (
                <Stack direction="row" justifyContent="center" spacing={0.5} sx={{ mt: 1 }}>
                    {items.map((_, i) => (
                        <Box key={i} onClick={() => { setIdx(i); startTimer(); }} sx={{
                            width: i === idx ? 16 : 6, height: 6, borderRadius: 3,
                            bgcolor: i === idx ? "#1e3a8a" : "#c5d4f0",
                            cursor: "pointer",
                            transition: "width 0.3s, background-color 0.3s",
                        }} />
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default FreeBoardPromoBanner;

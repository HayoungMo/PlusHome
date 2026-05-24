import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  Container,
  Pagination,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import GetImgDlr from "../resources/function/GetImgDir";
import EventService from "../service/eventService";

const EventPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const handleNext = (eId) => {
    navigate(`/event/article/${eId}`);
  };

  const handleChange = (event, newValue) => {
    setTab(newValue);
    setPage(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await EventService.selectEventList();

      const dataList = Array.isArray(data) ? data : [];
      const listWithImages = await Promise.all(
        dataList.map(async (item) => {
          const logo = await GetImgDlr({
            kind: "DEV",
            returnType: "list",
            a: item.e_id,
            b: item.e_title,
            view: false,
          });

          return {
            ...item,
            logo,
          };
        }),
      );

      setEvents(listWithImages);
    };

    fetchData();
  }, []);

  const visibleEvents = useMemo(() => {
    const now = new Date();

    if (tab === 0) {
      return events.filter(
        (item) =>
          item.e_type === "event" &&
          new Date(item.e_startDate) <= now &&
          new Date(item.e_endDate) >= now,
      );
    }

    if (tab === 1) {
      return events.filter(
        (item) => item.e_type === "event" && new Date(item.e_endDate) < now,
      );
    }

    return events.filter((item) => item.e_type === "notice");
  }, [events, tab]);

  const totalPage = Math.ceil(visibleEvents.length / pageSize);
  const pagedEvents = visibleEvents.slice((page - 1) * pageSize, page * pageSize);

  const getThumbnail = (record) => {
    return record.logo?.result?.find((item) => item.img_tag === "THUMBNAIL")
      ?.img_name;
  };

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              이벤트
            </Typography>
            <Typography color="text.secondary">
              진행 중인 소식과 공지사항을 한눈에 확인하세요.
            </Typography>
          </Box>

          <Tabs
            value={tab}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="진행중인 이벤트" />
            <Tab label="종료된 이벤트" />
            <Tab label="공지사항" />
          </Tabs>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 2, md: 2.2 },
          }}
        >
          {pagedEvents.map((record) => {
            const thumbnail = getThumbnail(record);

            return (
              <Box
                key={record.e_id}
                component="button"
                type="button"
                onClick={() => handleNext(record.e_id)}
                sx={{
                  p: 0,
                  border: 0,
                  bgcolor: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  borderRadius: 1.5,
                  overflow: "hidden",
                  position: "relative",
                  aspectRatio: "1 / 1",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  transition: "transform 160ms ease, box-shadow 160ms ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
                  },
                  "&:focus-visible": {
                    outline: "3px solid #ffc400",
                    outlineOffset: 3,
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    width: 34,
                    height: 34,
                    background:
                      "linear-gradient(135deg, transparent 0 50%, rgba(255,255,255,0.92) 51% 100%)",
                    boxShadow: "-2px -2px 8px rgba(0,0,0,0.08)",
                  },
                }}
              >
                {thumbnail ? (
                  <Box
                    component="img"
                    src={thumbnail}
                    alt={record.e_title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: 2,
                      p: 3,
                      bgcolor: "#f7f2ea",
                    }}
                  >
                    <Chip
                      label={record.e_type === "notice" ? "공지" : "이벤트"}
                      size="small"
                      sx={{ alignSelf: "flex-start", fontWeight: 700 }}
                    />
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, wordBreak: "keep-all" }}
                    >
                      {record.e_title}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {visibleEvents.length === 0 && (
          <Box
            sx={{
              py: 10,
              textAlign: "center",
              color: "text.secondary",
              border: "1px solid #eee",
              borderRadius: 2,
            }}
          >
            표시할 항목이 없습니다.
          </Box>
        )}

        {totalPage > 1 && (
          <Pagination
            count={totalPage}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 4,
              "& .MuiPaginationItem-root.Mui-selected": {
                bgcolor: "#ffc400",
                color: "#111",
                fontWeight: 800,
              },
              "& .MuiPaginationItem-root.Mui-selected:hover": {
                bgcolor: "#f0b800",
              },
            }}
          />
        )}
      </Container>
    </Box>
  );
};

export default EventPage;

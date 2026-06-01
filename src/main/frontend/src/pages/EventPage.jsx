import React, { useEffect, useMemo, useState } from "react";
import { Chip, Pagination, Tab, Tabs } from "@mui/material";
import { useNavigate } from "react-router-dom";
import GetImgDlr from "../resources/function/GetImgDir";
import EventService from "../service/eventService";
import "../css/EventPage.css";
import Loading from "../components/Loading";
import SkeletonMui from "../components/SkeletonMui";

const EventPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
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
      try {
        setLoading(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const visibleEvents = useMemo(() => {
    const now = new Date();

    // 오늘 00:00
    now.setHours(0, 0, 0, 0);

    if (tab === 0) {
      return events.filter((item) => {
        const start = new Date(item.e_startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(item.e_endDate);
        end.setHours(0, 0, 0, 0);
        
        return item.e_type === "event" && start <= now && end >= now;
      });
    }

    if (tab === 1) {
      return events.filter((item) => {
        const end = new Date(item.e_endDate);
        return item.e_type === "event" && end < now;
      });
    }

    return events.filter((item) => item.e_type === "notice");
  }, [events, tab]);

  const totalPage = Math.ceil(visibleEvents.length / pageSize);
  const pagedEvents = visibleEvents.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const getThumbnail = (record) => {
    return record.logo?.result?.find((item) => item.img_tag === "THUMBNAIL")
      ?.img_name;
  };

  return (
    <main className="event-page">
      <div className="event-page-inner">
        <div className="event-page-header">
          <div>
            <p className="event-page-eyebrow">EVENT</p>
            <h2>이벤트</h2>
            <p>진행 중인 소식과 공지사항을 한눈에 확인하세요.</p>
          </div>

          <Tabs
            className="event-page-tabs"
            value={tab}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="진행중인 이벤트" />
            <Tab label="종료된 이벤트" />
            <Tab label="공지사항" />
          </Tabs>
        </div>
        {loading ? (
          <SkeletonMui variant="eventCard" count={pageSize} />
        ) : (
        <div className="event-card-grid">
          {pagedEvents.map((record) => {
            const thumbnail = getThumbnail(record);
            const isNotice = record.e_type === "notice";

            return (
              <button
                className={`event-card ${isNotice ? "event-card-notice" : "event-card-event"}`}
                key={record.e_id}
                type="button"
                onClick={() => handleNext(record.e_id)}
              >
                {thumbnail ? (
                  <img src={thumbnail} alt={record.e_title} />
                ) : (
                  <div className="event-card-fallback">
                    <Chip label={isNotice ? "공지" : "이벤트"} size="small" />
                    <strong>{record.e_title}</strong>
                  </div>
                )}

                <div className="event-card-overlay">
                  <span>{isNotice ? "NOTICE" : "EVENT"}</span>
                  <strong>{record.e_title}</strong>
                </div>
              </button>
            );
          })}
        </div>
        )}
        {!loading && events.length === 0 && <Loading />}
        {!loading && events.length !== 0 && visibleEvents.length === 0 && (
          <div className="event-page-empty">표시할 목록이 없습니다.</div>
        )}
        {!loading && totalPage > 1 && (
          <Pagination
            className="event-page-pagination"
            count={totalPage}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        )}
      </div>
    </main>
  );
};

export default EventPage;

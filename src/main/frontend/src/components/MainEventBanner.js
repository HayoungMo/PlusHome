import { Button } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GetImgDir from "../resources/function/GetImgDir";
import EventService from "../service/eventService";

const MainEventBanner = () => {
  //메인영상 옆에 이벤트 슬라이드 항목
  const [sideSlideIndex, setSideSlideIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const handleNext = (data) => {
    navigate(`/event/article/${data}`);
  };

  const visibleEvents = useMemo(() => {
    const now = new Date();

    // 오늘 00:00
    now.setHours(0, 0, 0, 0);

    return events.filter((item) => {
      const start = new Date(item.e_startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(item.e_endDate);
      end.setHours(0, 0, 0, 0);

      return item.e_type === "event" && start <= now && end >= now;
    });
  }, [events]);

  const currentEvent = visibleEvents[sideSlideIndex];

  const getBanner = (record) => {
    return record.logo?.result?.find((item) => item.img_tag === "BANNER")
      ?.img_name;
  };
  const currentBanner = currentEvent ? getBanner(currentEvent) : null;

  const moveSideSlide = (direction) => {
    setSideSlideIndex((prev) => {
      if (visibleEvents.length === 0) return 0;

      if (direction === "next") {
        return prev >= visibleEvents.length - 1 ? 0 : prev + 1;
      }

      return prev <= 0 ? visibleEvents.length - 1 : prev - 1;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await EventService.selectPopupList();

      const dataList = Array.isArray(data) ? data : [];
      const listWithImages = await Promise.all(
        dataList.map(async (item) => {
          const logo = await GetImgDir({
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
      setSideSlideIndex(0);
    };

    fetchData();
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: "360px",
        borderRadius: "8px",
        border: "1px solid #e5e1da",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        boxSizing: "border-box",
        padding: "32px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {currentBanner ? (
        <img
          src={currentBanner}
          alt={currentEvent?.e_title || "이벤트 배너"}
          onClick={() => handleNext(currentEvent.e_id)}
          style={{
            width: "100%",
            height: "360px",
            objectFit: "cover",
            cursor: "pointer",
          }}
        />
      ) : (
        <p>이벤트가 없습니다</p>
      )}

      <Button
        type="button"
        onClick={() => moveSideSlide("prev")}
        sx={{
          position: "absolute",
          left: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          minWidth: "36px",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          color: "#333",
          boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        {"<"}
      </Button>

      <Button
        type="button"
        onClick={() => moveSideSlide("next")}
        sx={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          minWidth: "36px",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          color: "#333",
          boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        {">"}
      </Button>

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "14px",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "6px",
        }}
      >
        {visibleEvents.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => setSideSlideIndex(index)}
            style={{
              width: sideSlideIndex === index ? "20px" : "8px",
              height: "8px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              backgroundColor: sideSlideIndex === index ? "#2f5f53" : "#ccc",
            }}
            aria-label={`${index + 1}번 슬라이드로 이동`}
          />
        ))}
      </div>
    </div>
  );
};

export default MainEventBanner;

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventService from "../service/eventService";
import GetImgDlr from "../resources/function/GetImgDir";
import { Button, Dialog } from "@mui/material";
import SkeletonMui from "../components/SkeletonMui";

const EventPopup = () => {
  const navigate = useNavigate();
  const [random, setRandom] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const handleNext = (data) => {
    navigate(`/event/article/${data}`);
  };
  const popupRef = useRef(false);

  useEffect(() => {
    if (popupRef.current) return;

    popupRef.current = true;

    const fetchData = async () => {
      const hidden = localStorage.getItem("hideEventPopup");
      const today = new Date().toDateString();

      if (hidden === today) {
        setOpen(false);
        return;
      }

      setOpen(true);
      setLoading(true);

      const data = await EventService.selectPopupList();

      const dataList = Array.isArray(data) ? data : [];
      const listWithImages = await Promise.all(
        dataList
          ?.filter((record) => record.e_type === "event")
          .filter(
            (item) =>
              new Date(item.e_endDate).setHours(0, 0, 0, 0) >=
                new Date().setHours(0, 0, 0, 0) &&
              new Date(item.e_startDate).setHours(0, 0, 0, 0) <=
                new Date().setHours(0, 0, 0, 0),
          )
          .map(async (item) => {
            console.log("아이템" + item);
            const logo = await GetImgDlr({
              kind: "DEV",
              returnType: "list",
              a: item.e_id,
              b: item.e_title,
              view: false,
            });

            if (!logo?.result?.length) {
              return item;
            }
            return {
              ...item,
              logo,
            };
          }),
      );
      if (listWithImages.length === 0) {
        setOpen(false);
        setLoading(false);
        return;
      }

      const randomEvent =
        listWithImages[Math.floor(Math.random() * listWithImages.length)];
      setImageLoaded(false);
      setRandom(randomEvent);

      setOpen(true);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleClose = (hideToday) => {
    if (hideToday) {
      localStorage.setItem("hideEventPopup", new Date().toDateString());
    }

    setOpen(false);
  };

  const popupImage = random?.logo?.result?.find(
    (item) => item.img_tag === "THUMBNAIL",
  )?.img_name;
  const showSkeleton = loading || (popupImage && !imageLoaded);

  return (
    <Dialog
      open={open}
      PaperProps={{ className: "event-popup-dialog" }}
    >
      {showSkeleton && (
        <SkeletonMui variant="eventPopup" />
      )}

      {!loading && popupImage && (
        <div
          className={`event-popup-content ${
            imageLoaded ? "" : "event-popup-content-hidden"
          }`}
        >
          <img
            className="event-popup-image"
            src={popupImage}
            alt=""
            onClick={() => handleNext(random.e_id)}
            onLoad={() => setImageLoaded(true)}
            onError={() => setOpen(false)}
          />
          <div className="event-popup-actions">
      <Button onClick={() => setOpen(false)}>닫기</Button>
      <Button onClick={() => handleClose(true)}>오늘 하루 보지 않기</Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default EventPopup;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventService from "../service/eventService";
import GetImgDlr from "../resources/function/GetImgDir";
import { Button, Dialog } from "@mui/material";

const EventPopup = () => {
  const navigate = useNavigate();
  const [random, setRandom] = useState([]);
  const [open, setOpen] = useState(false);
  const handleNext = (data) => {
    navigate(`/event/article/${data}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await EventService.selectPopupList();

      const dataList = Array.isArray(data) ? data : [];
      const listWithImages = await Promise.all(
        dataList
          ?.filter((record) => record.e_type === "event")
          .filter(
            (item) =>
              new Date(item.e_endDate) >= new Date() &&
              new Date(item.e_startDate) < new Date(),
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
        return;
      }

      const randomEvent =
        listWithImages[Math.floor(Math.random() * listWithImages.length)];
      setRandom(randomEvent);

      const hidden = localStorage.getItem("hideEventPopup");
      const today = new Date().toDateString();

      if (hidden !== today) {
        setOpen(true);
      }
    };

    fetchData();
  }, []);

  const handleClose = (hideToday) => {
    if (hideToday) {
      localStorage.setItem("hideEventPopup", new Date().toDateString());
    }

    setOpen(false);
  };

  return (
    <Dialog open={open}>
      <img
        src={
          random?.logo?.result?.find((item) => item.img_tag === "THUMBNAIL")
            ?.img_name
        }
        alt=""
        onClick={() => handleNext(random.e_id)}
      />
      <Button onClick={() => setOpen(false)}>닫기</Button>
      <Button onClick={() => handleClose(true)}>오늘 하루 보지 않기</Button>
    </Dialog>
  );
};

export default EventPopup;

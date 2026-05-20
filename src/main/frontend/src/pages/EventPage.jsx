import React, { useEffect, useState } from "react";
import GetImgDlr from "../resources/function/GetImgDir";
import EventService from "../service/eventService";
import { Button, Tab, Tabs } from "@mui/material";
import { useNavigate } from "react-router-dom";

const EventPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState(0);

  const handleNext = (data) => {
    navigate(`/event/article/${data}`);
  };

  const handleUpdate = (data) => {
    navigate(`/event/update/${data}`);
  };

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await EventService.selectEventList();

      const dataList = Array.isArray(data) ? data : [];
      const listWithImages = await Promise.all(
        dataList?.map(async (item) => {
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
      console.log(listWithImages);

      setEvents(listWithImages);
    };

    fetchData();
  }, []);

  return (
    <div>
      <Tabs value={tab} onChange={handleChange}>
        <Tab label="진행중인 이벤트" />
        <Tab label="종료된 이벤트" />
        <Tab label="공지사항" />
      </Tabs>

      {tab === 0 &&
        events
          .filter((item) => new Date(item.e_long) >= new Date())
          ?.filter((item) => item.e_type === "event")
          .map((record) => (
            <div>
              <img
                src={
                  record.logo?.result?.find(
                    (item) => item.img_tag === "THUMBNAIL",
                  )?.img_name
                }
                alt=""
                onClick={() => handleNext(record.e_id)}
              />
              {record.e_title}
              {record.e_content}
              <Button onClick={() => handleUpdate(record.e_id)}>수정</Button>
            </div>
          ))}

      {tab === 1 &&
        events
          .filter((item) => new Date(item.e_long) < new Date())
          ?.filter((item) => item.e_type === "event")
          .map((record) => (
            <div>
              <img
                src={
                  record.logo?.result?.find(
                    (item) => item.img_tag === "THUMBNAIL",
                  )?.img_name
                }
                alt=""
              />
              {record.e_title}
              {record.e_content}
            </div>
          ))}

      {tab === 2 &&
        events
          ?.filter((item) => item.e_type === "notice")
          .map((record) => (
            <div>
              <img
                src={
                  record.logo?.result?.find(
                    (item) => item.img_tag === "THUMBNAIL",
                  )?.img_name
                }
                alt=""
                onClick={() => handleNext(record.e_id)}
              />
              {record.e_title}
              {record.e_content}
              <Button onClick={() => handleUpdate(record.e_id)}>수정</Button>
            </div>
          ))}
    </div>
  );
};

export default EventPage;

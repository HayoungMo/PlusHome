import React, { useEffect, useState } from "react";
import GetImgDlr from "../resources/function/GetImgDir";
import TableMui from "./TableMui";
import EventService from "../service/eventService";

const EventLists = () => {
  const [events, setEvents] = useState();

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
            a: item.e_title,
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

  return <div>
{
    events && <TableMui rowData={events}/>
}
  </div>;
};

export default EventLists;

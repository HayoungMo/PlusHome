import http from "../http-common";

const insertEvent = async (data) => {
  try {
    await http.post("/event/insert", {
      e_id: data.e_id,
      e_title: data.e_title,
      e_content: data.e_content,
      e_startDate: data.e_startDate || null,
      e_endDate: data.e_endDate || null,
      e_type: data.e_type,
    });

    return {
      success: true,
    };
  } catch (err) {
    console.error(data, err);
    return {
      success: false,
    };
  }
};

const selectEventList = async () => {
  try {
    const res = await http.get("/event/getlist");

    return res.data;
  } catch (err) {
    console.error(err);
    return {
      success: false,
    };
  }
};

const selectEvent = async (e_id) => {
  try {
    const res = await http.post("/event/getdata", {
      e_id: e_id,
    });

    return res.data;
  } catch (err) {
    console.error(err);
    return {
      success: false,
    };
  }
};

// 수정
const updateEvent = async (data) => {
  try {
    await http.post("/event/update", {
      e_id: data.e_id,
      e_title: data.e_title,
      e_content: data.e_content,
      e_startDate: data.e_startDate || null,
      e_endDate: data.e_endDate || null,
      e_type: data.e_type,
    });
    return {
      success: true,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
    };
  }
};

// 삭제
const deleteEvent = async (e_id) => {
  try {    
    await http.post("/eventCoupon/deleteByEvent", {e_id:e_id});
    await http.post("/event/delete", {e_id:e_id});
    return {
      success: true,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
    };
  }
};

const insertEventCoupon = async (data) => {
  try {
    await http.post("/eventCoupon/insert", data);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

const deleteEventCoupon = async (data) => {
  try {
    await http.post("/eventCoupon/delete", data);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

const selectCouponsByEvent = async (e_id) => {
  try {
    const res = await http.get(`/eventCoupon/event/${e_id}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

const EventService = {
  insertEvent,
  selectEventList,
  selectEvent,
  updateEvent,
  deleteEvent,
  insertEventCoupon,
  deleteEventCoupon,
  selectCouponsByEvent,
};

export default EventService;

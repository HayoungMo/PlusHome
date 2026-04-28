import http from "../http-common";

const fetchList = async () => {
  try {
    const res = await http.get("interior");

    console.log("응답 데이터:", res.data);
    return res.data;
  } catch (err) {
    console.error("에러:", err);
  }
};

const fetchArticle = async () => {
  try {
    const res = await http.post("interior/read", {
      c_id: "111",
      c_kind: "interior",
      c_name: "111",
    });

    console.log("응답 데이터:", res.data);
    return res.data;
  } catch (err) {
    console.error("에러:", err);
  }
};

const fetchExample = async () => {
  try {
    const res = await http.post("interior/example", {
      c_id: "111",
      c_kind: "interior",
      c_name: "111",
    });

    console.log("응답 데이터:", res.data);
    return res.data;
  } catch (err) {
    console.error("에러:", err);
  }
};

const AddInterior = async (data) => {
  try {
    const res = await http.post("/interior/add/interior", {
      c_id: "111",
      c_kind: "interior",
      c_name: "111",
      i_tag : data.tag,
      i_text : data.text
    });

    console.log("결과:", res.data);
  } catch (err) {
    console.error(err);
  }
};

const AddInteriorExample = async (data) => {
  try {
    const res = await http.post("/interior/add/example", {
      c_id: "111",
      c_kind: "interior",
      c_name: "111",
      ie_tag: data.tag,
      ie_tag2: data.tag2,
      ie_content: data.content
    });

    console.log("결과:", res.data);
  } catch (err) {
    console.error(data, err);
  }
};

const AddBooking = async (data) => {
  try {
    const res = await http.post("/interior/add/booking", {
      id: "111",
      c_id: "111",
      c_kind: "interior",
      c_name: "111",
      b_kind: data.kind,
      b_long: data.long,
      b_date: data.date,
      b_status: "pending",
      b_content: data.content
    });

    console.log("결과:", res.data);
  } catch (err) {
    console.error(err);
  }
};

const AddInvoice = async (data) => {
  try {
    const res = await http.post("/interior/add/invoice", {
      id: "111",
      c_id: "111",
      c_kind: "interior",
      c_name: "111",
      b_createddate: "2026-04-28 15:24:10",
      invoice_text: data.text,
      invoice_price: data.price,
    });

    console.log("결과:", res.data);
  } catch (err) {
    console.error(err);
  }
};

const InteriorService = {
  fetchExample,
  fetchArticle,
  fetchList,
  AddInterior,
  AddInteriorExample,
  AddBooking,
  AddInvoice
};

export default InteriorService;
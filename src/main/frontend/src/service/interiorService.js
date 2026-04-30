import http from "../http-common";

const fetchList = async () => {
  try {
    const res = await http.get("interior/lists");

    console.log("응답 데이터:", res.data);
    return res.data;
  } catch (err) {
    console.error("에러:", err);
  }
};


const fetchArticleList = async (data) => {
  try {
    const res = await http.get("interior/articlelists");

    console.log("응답 데이터:", res.data);
    return res.data;
  } catch (err) {
    console.error("에러:", err);
  }
};

const fetchArticle = async (data) => {
  try {
    const res = await http.post("interior/read", {
      c_id: data.c_id,
      c_kind: data.c_kind,
      c_name: data.c_name,
    });

    console.log("응답 데이터:", res.data);
    return res.data;
  } catch (err) {
    console.error("에러:", err);
  }
};

const fetchExample = async (data) => {
  console.log("들어온 데이터" , data);
  try {
    const res = await http.post("interior/example", {
      c_id: data.c_id,
      c_kind: data.c_kind,
      c_name: data.c_name,
    });

    console.log("응답 데이터:", res.data);
    return res.data;
  } catch (err) {
    console.error("에러:", err);
  }
};

const fetchBookingList = async (data) => {
  console.log("들어온 데이터", data);
  try {
    const res = await http.post("interior/bookinglists", {
      c_id: data.c_id,
      c_kind: data.c_kind,
      c_name: data.c_name,
    });

    console.log("응답 데이터:", res.data);
    return res.data;
  } catch (err) {
    console.error("에러:", err);
  }
};

const fetchInvoice = async (data) => {
  console.log("인보이스에 들어온 데이터", data);
  try {
    const res = await http.post("interior/invoice", {
      id: "comp01",
      c_id: data.c_id,
      c_kind: data.c_kind,
      c_name: data.c_name,
      b_createdDate: data.b_createdDate
    });

    console.log("응답 데이터:", res.data);
    return res.data;
  } catch (err) {
    console.error("에러:", err);
  }
};

const fetchInvoiceDetails = async (data) => {
  console.log("인보이스 디테일에 들어온 데이터", data);
  try {
    const res = await http.post("interior/invoicedetails", {
      id: "comp01",
      c_id: data.c_id,
      c_kind: data.c_kind,
      c_name: data.c_name,
      b_createdDate: data.b_createdDate,
      invoice_no: data.invoice_no,
      invoice_kind: data.invoice_kind,
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

    console.log("결과:");
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

    console.log("결과:");
  } catch (err) {
    console.error(data, err);
  }
};

const AddBooking = async (data) => {
  try {
    const res = await http.post("/interior/add/booking", {
      id: "comp01",
      c_id: data.c_id,
      c_kind: data.c_kind,
      c_name: data.c_name,
      b_kind: data.kind,
      b_long: data.long,
      b_date: data.date,
      b_status: "pending",
      b_content: data.content,
      b_answer: data.answers,
    });

    console.log("결과:");
    return res.data
  } catch (err) {
    console.error(err);
  }
};

const AddInvoice = async (data) => {
  console.log("들어온 데이터", data);
  try {
    const res = await http.post("/interior/add/invoice", {
      id: "comp01",
      c_id: data.c_id,
      c_kind: data.c_kind,
      c_name: data.c_name,
      b_createdDate: data.b_createdDate,
      invoice_no: data.invoice_no,
      details : data.details
    });

    console.log("결과: 좋음");
  } catch (err) {
    console.error(err);
  }
};

const AddInvoiceDetail = async (data) => {
  console.log("들어온 데이터", data);
  try {
    const res = await http.post("/interior/add/invoice", {
      id: "comp01",
      c_id: data.c_id,
      c_kind: data.c_kind,
      c_name: data.c_name,
      b_createdDate: data.b_createdDate,
      invoice_text: data.invoice_text,
      invoice_price: data.invoice_price
    });

    console.log("결과: 좋음");
  } catch (err) {
    console.error(err);
  }
};

const InteriorService = {
  fetchExample,
  fetchArticle,
  fetchArticleList,
  fetchList,
  fetchBookingList,
  fetchInvoice,
  fetchInvoiceDetails,
  AddInterior,
  AddInteriorExample,
  AddBooking,
  AddInvoice,
  AddInvoiceDetail,
};

export default InteriorService;
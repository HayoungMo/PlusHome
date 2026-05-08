import http from "../http-common";

const fetchBookingList = async (id) => {
  try {
    const res = await http.post("interior/bookinglists", {
       id: id,
      c_id: "",
      c_kind: "",
      c_name: "",
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
      id: data.id,
      c_id: data.c_id,
      c_kind: data.c_kind,
      c_name: data.c_name,
      b_createdDate: data.b_createdDate,
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
      id: data.id,
      c_id: data.c_id,
      c_kind: data.c_kind,
      c_name: data.c_name,
      b_createdDate: data.b_createdDate,
      invoice_no: data.invoice_no,
      invoice_qty: data.invoice_qty,
      invoice_kind: data.invoice_kind,
    });

    console.log("응답 데이터:", res.data);
    return res.data;
  } catch (err) {
    console.error("에러:", err);
  }
};

const fetchInteriorReview = async () => {
  try {
    const res = await http.post("interior/interiorreview", {
      id: localStorage.getItem("id"),
      c_id: "",
      c_kind: "",
      c_name: "",
      b_createdDate: "",
      invoice_kind: "Y",
    });

    console.log("응답 데이터:", res.data);
    return res.data;
  } catch (err) {
    console.error("에러:", err);
  }
};

const AddInteriorReview = async (data) => {
  console.log("인테리어 리뷰 들어온 데이터", data);
  try {
    const res = await http.post("/interior/add/review", {
      id: localStorage.getItem("id"),
      c_id: data.c_id,
      c_kind: data.c_kind,
      c_name: data.c_name,
      b_createdDate: data.b_createdDate,
      invoice_no: data.invoice_no,
      invoice_kind: data.invoice_kind,
      ir_content: data.ir_content,
    });

    console.log("결과: 좋음");
  } catch (err) {
    console.error(err);
  }
};

const UpdateInteriorReview = async (data) => {
  try {
    const res = await http.post("/interior/update/interiorreview", {
      id: data.id,
      c_id: data.c_id,
      c_kind: data.c_kind,
      c_name: data.c_name,
      b_createdDate: data.b_createdDate,
      invoice_no: data.invoice_no,
      invoice_kind: data.invoice_kind,
      ir_content: data.ir_content,
    });

    console.log("예약 수정 결과:", res.data);
    return res.data;
  } catch (err) {
    console.error("예약 수정 에러:", err);
  }
};

const DeleteInteriorReview = async (data) => {
  try {
    const res = await http.post("/interior/delete/interiorreview", {
      id: data.id,
      c_id: data.c_id,
      c_kind: data.c_kind,
      c_name: data.c_name,
      b_createdDate: data.b_createdDate,
      invoice_no: data.invoice_no,
      invoice_kind: data.invoice_kind,
    });
  } catch (err) {
    console.error("삭제 에러:", err);
  }
};


const InteriorUserService = {
  fetchBookingList,
  fetchInvoice,
  fetchInvoiceDetails,
  fetchInteriorReview,
  AddInteriorReview,
  UpdateInteriorReview,
  DeleteInteriorReview,
};

export default InteriorUserService;
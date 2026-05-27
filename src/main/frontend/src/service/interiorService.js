import http, { fileHttp } from "../http-common";

const aiResponse = async (data) => {
	console.log("ai 들어가는 데이터:", data);

	try {
		const res = await http.post("chatgpt/companyanalysis", data);

		console.log("ai 응답 데이터:", res.data);
		return res.data;
	} catch (err) {
		console.error("에러:", err);
	}
};

const aiResponselist = async (data) => {
	console.log("ai 들어가는 데이터:", data);
	try {
		const res = await http.post("chatgpt/recommend", data);

		console.log("ai 응답 데이터:", res.data);
		return res.data;
	} catch (err) {
		console.error("에러:", err);
	}
};

const fetchCompany = async (data) => {
	try {
		const res = await http.post("interior/getCompany", {
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

const fetchList = async () => {
	try {
		const res = await http.get("interior/lists");

		console.log("응답 데이터:", res.data);
		return res.data;
	} catch (err) {
		console.error("에러:", err);
	}
};

const fetchPagedList = async (params = {}) => {
	try {
		const res = await http.get("interior/lists/page", { params });

		console.log("응답 데이터", res.data);
		return res.data;
	} catch (err) {
		console.error("?에러:", err);
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
	console.log("들어온 데이터", data);
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

const fetchInteriorReview = async (data) => {
	console.log("인보이스 리뷰에 들어온 데이터", data);
	try {
		const res = await http.post("interior/companyreview", {
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

const fetchAllInteriorReview = async () => {
	try {
		const res = await http.get("interior/reviewlists");
		console.log("응답 데이터:", res.data);
		return res.data;
	} catch (err) {
		console.error("에러:", err);
	}
};

const fetchPagedInteriorReview = async (params = {}) => {
	try {
		const res = await http.get("interior/reviewlists/page", { params });
		console.log("응답 데이터:", res.data);
		return res.data;
	} catch (err) {
		console.error("에러:", err);
	}
};

const fetchAllInteriorExample = async () => {
	try {
		const res = await http.get("interior/examplelists");
		console.log("응답 데이터:", res.data);
		return res.data;
	} catch (err) {
		console.error("에러:", err);
	}
};

const fetchPagedInteriorExample = async (params = {}) => {
	try {
		const res = await http.get("interior/examplelists/page", { params });
		console.log("응답 데이터:", res.data);
		return res.data;
	} catch (err) {
		console.error("에러:", err);
	}
};

const fetchAllBookingList = async () => {
	try {
		const res = await http.get("interior/bookinglists");
		console.log("응답 데이터:", res.data);
		return res.data;
	} catch (err) {
		console.error("에러:", err);
	}
};

const AddInterior = async (data) => {
	console.log(data)
	try {
		const res = await http.post("/interior/add/interior", {
			c_id: data.c_id,
			c_kind: data.c_kind,
			c_name: data.c_name,
			i_tag: data.tag,
			i_text: data.text,
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

const AddInteriorExample = async (data) => {
	try {
		const res = await fileHttp.post("/interior/add/example", data);

		return {
			success: true,
			data: res.data,
		};
	} catch (err) {
		console.error(data, err);
		return {
			success: false,
		};
	}
};

const AddBooking = async (data) => {
	try {
		const res = await http.post("/interior/add/booking", {
      id: data.id,
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

		return {
			success: true,
			data: res.data,
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
		};
	}
};

const AddInvoice = async (data) => {
	console.log("들어온 데이터", data);
	try {
		const res = await http.post("/interior/add/invoice", {
			id: data.id,
			c_id: data.c_id,
			c_kind: data.c_kind,
			c_name: data.c_name,
			b_createdDate: data.b_createdDate,
			invoice_no: data.invoice_no,
			invoice_kind: data.invoice_kind,
			details: data.details,
		});

		return {
			success: true,
			data: res.data,
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
		};
	}
};

const AddInvoiceDetail = async (data) => {
	console.log("들어온 데이터", data);
	try {
		const res = await http.post("/interior/add/invoice", {
			id: data.id,
			c_id: data.c_id,
			c_kind: data.c_kind,
			c_name: data.c_name,
			b_createdDate: data.b_createdDate,
			invoice_text: data.invoice_text,
			invoice_qty: data.invoice_qty,
			invoice_price: data.invoice_price,
		});

		return {
			success: true,
			data: res.data,
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
		};
	}
};

const UpdateInterior = async (data) => {
	try {
		console.log(data);
		const res = await http.post("/interior/update/interior", {
			c_id: data.c_id,
			c_kind: data.c_kind,
			c_name: data.c_name,
			i_tag: data.tag,
			i_text: data.text,
			i_text_before: data.i_text_before,
		});

		console.log("수정 결과:", res.data);
		return {
			success: true,
			data: res.data,
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
		};
	}
};

const UpdateInteriorExample = async (data) => {
	try {
		const res = await http.post("/interior/update/example", {
			ie_index: data.ie_index,
			ie_tag: data.ie_tag,
			ie_tag2: data.ie_tag2,
			ie_content: data.ie_content,
		});

		console.log("수정 결과:", res.data);
		return {
			success: res.data?.success ?? true,
			message: res.data?.message,
			data: res.data,
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
		};
	}
};

const UpdateBooking = async (data) => {
	console.log("예약 수정 들어간 데이터:", data);
	try {
		const res = await http.post("/interior/update/booking", {
			id: data.id,
			c_id: data.c_id,
			c_kind: data.c_kind,
			c_name: data.c_name,
			b_createdDate: data.b_createdDate,
			b_kind: data.b_kind,
			b_date: data.b_date,
			b_long: data.b_long,
			b_status: data.b_status,
			b_content: data.b_content,
			b_answer: data.b_answer,
		});

		console.log("예약 수정 결과:", res.data);
		return {
			success: true,
			data: res.data,
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
		};
	}
};

const DeleteInterior = async (data) => {
	try {
		const res = await http.post("/interior/delete/interior", {
			c_id: data.c_id,
			c_kind: data.c_kind,
			c_name: data.c_name,
			i_tag: data.tag,
			i_text: data.text,
		});
		return {
			success: true,
			data: res.data,
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
		};
	}
};

const DeleteInteriorExample = async (data) => {
	try {
		const res = await http.post("/interior/delete/example", {
			ie_index: data.ie_index,
		});

		console.log("수정 결과:", res.data);
		return {
			success: res.data?.success ?? true,
			message: res.data?.message,
			data: res.data,
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
		};
	}
};

const selectWorkingAndDone = async (data) => {
	try {
		const res = await http.post("/interior/select/workingAndDone", {
			c_id: data,
		});

		console.log("수정 결과:", res.data);
		return res.data;
	} catch (err) {
		console.error("수정 에러:", err);
	}
};

const workingToDoneOrCancel = async (dto) => {
	try {
		console.log(dto);
		const res = await http.post("/interior/update/workingToDoneOrCancel", dto);
		return res.data;
	} catch (err) {
		console.error("수정 에러:", err);
	}
};

const getPDFData = async (param) => {
	try {
		const res = await http.post("/interior/select/getPDFData", param);
		return res.data;
	} catch (error) {
		console.error("getPDFData : ", error);
	}
};

const getInteriorExampleByCompanyId = async (params) => {
	try {
		const res = await http.post("/interior/select/getInteriorExampleByCompanyId", params);
		return res.data;
	} catch (error) {
		console.error("getPDFData : ", error);
	}
};

const insertInteriorSchedule = async (params) => {
	try {
		const res = await http.post("/interior/add/insertInteriorSchedule", {
			id: params.id,
			c_id: params.c_id,
			c_kind: params.c_kind,
			c_name: params.c_name,
			b_createdDate: params.b_createdDate,
			is_enddate: params.is_enddate,
			is_startdate: params.is_startdate,
		});
		return res.data;
	} catch (error) {
		console.error("insertInteriorSchedule : ", error);
	}
};

const getInteriorSchedule = async (c_dto) => {
	try {
		const res = await http.post("/interior/select/getInteriorSchedule", c_dto);
		return res.data;
	} catch (error) {
		console.error("insertInteriorSchedule : ", error);
	}
};

const updateScheduleEndDate = async (data) => {
	try {
		const res = await http.post("/interior/update/updateScheduleEndDate", data);
		return res.data;
	} catch (error) {
		console.error("insertInteriorSchedule : ", error);
	}
};

const InteriorService = {
	aiResponse,
	aiResponselist,
	fetchCompany,
	fetchExample,
	fetchArticle,
	fetchArticleList,
	fetchList,
	fetchPagedList,
	fetchBookingList,
	fetchInvoice,
	fetchInvoiceDetails,
	fetchInteriorReview,
	fetchAllInteriorReview,
	fetchPagedInteriorReview,
	fetchAllInteriorExample,
	fetchPagedInteriorExample,
	fetchAllBookingList,
	AddInterior,
	AddInteriorExample,
	AddBooking,
	AddInvoice,
	AddInvoiceDetail,
	UpdateInterior,
	UpdateInteriorExample,
	UpdateBooking,
	DeleteInterior,
	DeleteInteriorExample,
	selectWorkingAndDone,
	workingToDoneOrCancel,
	getPDFData,
	getInteriorExampleByCompanyId,
	insertInteriorSchedule,
	getInteriorSchedule,
	updateScheduleEndDate,
};

export default InteriorService;
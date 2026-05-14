import http, { fileHttp } from "../http-common";

const insertReview = async (data) => {
	try {
		const res = await http.post("/freview/insert", {
			id: data.id,
			f_code: data.f_code,
			fr_subject: data.subject,
			fr_star: data.star,
			fr_content: data.content,
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

// 조회
const selectReview = async (data) => {
	const res = await http.post("/freview/getLists", {
		id: data.id,
		f_code: data.f_code,
		fr_idx: data.fr_idx,
	});

	return {
		success: true,
		data: res.data,
	};
};

// 수정
const updateReview = async (data) => {
	await http.post("/freview/update", {
		id: data.id,
		f_code: data.f_code,
		fr_subject: data.fr_subject,
		fr_star: data.fr_star,
		fr_content: data.fr_content,
		fr_idx: data.fr_idx,
	});
	return {
		success: true,
	};
};

// 삭제
const deleteReview = async (data) => {
	await http.post("/freview/delete", {
		id: data.id,
		f_code: data.f_code,
	});
	return {
		success: true,
	};
};

const insertReplyOnDashboard = async ( reply, review ) => {
	try {
		const res = await http.post("/freview/insertReplyOnDashboard", {
			id: review.id,
			f_code: review.f_code,
			fr_subject: reply.fr_subject,
			fr_star: review.fr_star,
			fr_content: reply.fr_content,
			fr_idx: review.fr_idx * -1,
		});
		return res.data;
	} catch (err) {
		return {
			success: false,
			message: "저장 중 에러가 발생했습니다.",
		};
	}
};
const updateReplyOnDashboard = async (data) => {
	try {
		const res = await http.post("/freview/updateReplyOnDashboard", {
			id: data.id,
			f_code: data.f_code,
			fr_subject: data.fr_subject,
			fr_star: data.fr_star,
			fr_content: data.fr_content,
			fr_idx: data.fr_idx,
		});
		return res.data;
	} catch (error) {
		console.log(error);
		return {
			success: true,
			message: "수정 중 에러가 발생했습니다.",
		};
	}
};

const FurnitureReviewService = {
	insertReview,
	selectReview,
	updateReview,
	deleteReview,
	insertReplyOnDashboard,
	updateReplyOnDashboard,
};

export default FurnitureReviewService;

import http, { fileHttp } from "../http-common";

const insertReview = async (data) => {
  try {
    const res = await http.post("/freview/insert", {
      id: data.id,
      f_code: data.f_code,
      c_code: data.c_code,
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

const checkReviewByCart = async (c_code) => {
  const res = await http.get("/freview/check", {
    params: { c_code },
  });

  return res.data;
};

const FurnitureReviewService = {
  insertReview,
  selectReview,
  updateReview,
  deleteReview,
  checkReviewByCart
};

export default FurnitureReviewService;

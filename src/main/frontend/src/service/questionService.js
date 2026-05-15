import React from 'react';
import http from "../http-common";

const getQuestionList = async (f_code) => {
    const res = await http.get("/question/list", {
        params: {f_code}
    });
  
    return res.data;
};

const getQuestion = async (q_idx) => {
    const res = await http.get("/question/read",{
        params: { q_idx }
    });

    return res.data;
};

const writeQuestion = async (data) => {
    const res = await http.post("/question/write", data);
    return res.data;
};

const answerQuestion = async (data) => {
    const res = await http.post("/question/answer", data);
    return res.data;
};

const deleteAnswer = async (q_idx) => {
    const res = await http.post("/question/answer/delete", null, {
        params: { q_idx },
    });
    return res.data;
};

// 마이페이지에서 자신이 작성한 문의 확인하기
const getMyQuestions = async(id) => {
    const res = await http.get("/question/my", {
        params: {id}
    });
    return res.data;
};

const updateQuestion = async (data) => {
    const res = await http.post("/question/update", data);
    return res.data;
};

const deleteQuestion = async (q_idx) => {
    const res = await http.post("/question/delete",null, {
        params:{q_idx}
    });
    return res.data
};

const getCompanyQuestions = async (c_id) => {
    const res = await http.get("/question/company", {
        params: { c_id },
    });
    return res.data;
};


const questionService = {
    getQuestionList,
    getQuestion,
    writeQuestion,
    answerQuestion,
    updateQuestion,
    deleteQuestion,
    getMyQuestions,
    getCompanyQuestions,
    deleteAnswer,
};

export default questionService;
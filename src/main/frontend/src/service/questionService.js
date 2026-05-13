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

const writeQuesiotn = async (data) => {
    const res = await http.post("/question/write", data);
    return res.data;
};

const answerQuestion = async (data) => {
    const res = await http.post("/question/answer", data);
    return res.data;
};

const updateQuestion = async (data) => {
    const res = await http.post("/quesiton/update", data);
    return res.data;
};

const deleteQuestion = async (q_idx) => {
    const res = await http.post("/question/delete",null, {
        params:{q_idx}
    });
    return res.data
};


const questionService = {
    getQuestionList,
    getQuestion,
    writeQuesiotn,
    answerQuestion,
    updateQuestion,
    deleteQuestion,
};

export default questionService;
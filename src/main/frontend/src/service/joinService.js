import http from "../http-common";

const postJoin = async (data) => {
    try {
        console.log("Service: Sending POST request");
        const response = await http.post("/joinService/joinService", data);
        return response; // 필요한 데이터만 반환
    } catch (error) {
        console.error("API Error:", error);
        throw error; // 에러를 호출부로 전파
    }
};

//유저 데이터 조회 (GET)
const getUser = async (id) => {
    try {
        console.log("Service: Sending GET request");
        const response = await http.get("/joinService/joinService", {  });
        return response;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

// 객체로 묶어서 내보내기
const joinService = {
    postJoin,
    getUser,
};

export default joinService
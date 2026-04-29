import http from "../http-common";

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
const loginService = {
    getUser,
};

export default loginService
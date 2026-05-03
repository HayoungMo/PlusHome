import http from "../http-common";

//유저 데이터 조회 (GET)
const postLogin = async (id,pw) => {
    try {
        console.log("Service: Sending GET request");
        const res = await http.post("/user/login", { id,pw });
        return res.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

// 객체로 묶어서 내보내기
const loginService = {
    postLogin,
};

export default loginService
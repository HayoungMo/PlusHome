import http from "../http-common";

const postLogin = async (id,password) => {
    try {
        const response = await http.post("/loginService/loginService", {id,password});
        return response.data; // 필요한 데이터만 반환
    } catch (error) {
        console.error("API Error:", error);
        throw error; // 에러를 호출부로 전파
    }
};

// 객체로 묶어서 내보내기
const loginService = {
    postLogin,
};

export default loginService
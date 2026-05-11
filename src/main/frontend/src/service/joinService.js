import http from "../http-common";

//회원가입
const postJoin = async (data) => {
    try {
        console.log("Service: Sending POST request");
        console.log(data)
        const response = await http.post("/user/join", data);
        return response.data; // 필요한 데이터만 반환
    } catch (error) {
        console.error("API Error:", error);
        throw error; // 에러를 호출부로 전파
    }
};

//아이디 중복확인(Get)
const checkId = async(id) =>{
    const res = await http.get('/user/check-id',{params:{id}})
    return res.data
}

// 객체로 묶어서 내보내기
const joinService = {
    postJoin,
    checkId,
};

export default joinService
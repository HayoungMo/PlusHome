import http from "../http-common";
//
//아이디 찾기
const findId = async(data) =>{

    try {

    console.log("서비스에 데이터 넘어가욧!")
    console.log(data)

    const res = await http.post("user/find-Id",data)
    console.log(res.data)
    return res.data
        
    } catch (error) {
        console.log(error)
    }
}

    //비밀번호 찾기
    const findPw = async(data) =>{

    try {

    console.log("서비스에 데이터 넘겨주기")
    console.log(data)

    const res = await http.post("user/find-Pw",data)
    console.log(res.data)
    return res.data
        
    } catch (error) {
        console.log(error)
    }

}
    
//객체 묶어서 내보내기
const findService = {
    findId,
    findPw
};




export default findService
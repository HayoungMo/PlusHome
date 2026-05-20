import http, { fileHttp } from "../http-common";

const userGetAll = async (userType) => {

    console.log("서비스 호출")

	 try {
	 	console.log("UserInfo:")

	 	const res = await http.post("/dev/user/list",{
            type:userType
        })
	 		console.log(res);
	 		return res.data;
	
	 } catch (error) {
	 	console.error("API Error:", error);
	 	throw error;
	 }
    
};

const deleteUser = async (selectedUserList)=>{
    console.log("delete서비스 호출")

    try {
        const res = await http.post("/dev/delete",
            selectedUserList
        )
        console.log(res)
        return res.data
        
    } catch (error) {
        console.error("API Error:" , error)
    }
}

const restoreUser = async (selectedUserList) =>{
    console.log("restore 서비스 호출됨")
    
    try{
    const res = await http.post("/dev/restore",
        selectedUserList
    )
    console.log("restore 서비스 실행O")
    console.log(res)
    return res.data
    }catch (error) {
        console.log("API Error:", error)

    }
}

const updateUser =  async (selectedUserList) =>{
    console.log("update 서비스 호출됨")
    
    try{
    const res = await http.post("/dev/update/user",
        selectedUserList
    )
    console.log("updateUser 서비스 실행O")
    console.log(res)
    return res.data
    }catch (error) {
        console.log("API Error:", error)

    }
}

const updateCompany =  async (selectedUserList) =>{
    console.log("updateCompany 서비스 호출됨")
    
    try{
    const res = await http.post("/dev/update/company",
        selectedUserList
    )
    console.log("update 서비스 실행O")
    console.log(res)
    return res.data
    }catch (error) {
        console.log("API Error:", error)

    }
}

const getCatagoryStatistics = async(data)=>{

    try{
  
    const res = await http.post("/dev/statistics/category",data)
  
    console.log("카타고리 서비스 실행")
    console.log("카타고리 판매 리스트",res)
    
    return res.data
    }catch (error) {
        console.log("API Error:", error)

    }
    
}

const sendCode = async(data) => {

    console.log("서비스 도착했음")
    const res = await http.post(
        "/user/find/sendCode",
        data
    );

    return res.data;
}


const checkCode = async(data) => {

    const res = await http.post(
        "/user/find/checkCode",
        data
    );

    return res.data;
}

const userService = { userGetAll,deleteUser,restoreUser,updateUser,updateCompany, getCatagoryStatistics,sendCode,checkCode };

export default userService;
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
    console.log("update 서비스 호출됨")
    
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

const userService = { userGetAll,deleteUser,restoreUser };

export default userService;
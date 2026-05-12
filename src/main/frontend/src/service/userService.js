import http, { fileHttp } from "../http-common";

const userGetAll = async () => {

    console.log("서비스 호출")

	 try {
	 	console.log("UserInfo:")

	 	const res = await http.post("/dev/user/list")
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

const userService = { userGetAll,deleteUser };

export default userService;
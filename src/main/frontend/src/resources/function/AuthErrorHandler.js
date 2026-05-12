export const handleAuthError = (error, navigate) =>{
    if(error.response?.status !== 401){
        return false
    }

    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("id")

    alert("로그인이 만료되었습니다. 다시 로그인해주세요.")

    if (navigate){
        navigate('/login')
    }else{
        window.location.href = "/login"
    }

    return true
    
}
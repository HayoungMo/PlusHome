import tokenService from "./token";

const USER_KEY = "user"

const AuthService = {

    login(token,user){
        tokenService.setToken(token)

        localStorage.setItem(
            USER_KEY,
            JSON.stringify(user)
        )
    },

    Logout(){
        const user = localStorage.getItem(USER_KEY)

        return user ? JSON.parse(user) : null

    },



}
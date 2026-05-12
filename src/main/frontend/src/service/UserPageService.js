import http, { fileHttp } from "../http-common";

const API_BASE_URL = "/mypage";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

const getMyPageUser = () => {
  return http.get(API_BASE_URL, {
    headers: getAuthHeaders(),
  });
};

const updateMyPageUser = (userData) => {
  return http.put(API_BASE_URL, userData, {
    headers: getAuthHeaders(),
  });
};

const deleteMyPageUser = (password) => {
  return http.delete(API_BASE_URL, {
    headers: getAuthHeaders(),
    data: { password },
  });
};

const verifyMyPagePassword = (password) => {
  return http.post(
    `${API_BASE_URL}/verify-password`,
    { password },
    {
      headers: getAuthHeaders(),
    }
  );
};

const getProfileImage = () => {
  return http.get(`${API_BASE_URL}/profile-image`, {
    headers: getAuthHeaders(),
  });
};

const updateProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("profileImage", file);

  const res = await fileHttp.post(`${API_BASE_URL}/profile-image`, formData, {
    headers: getAuthHeaders(),
  });

  return res.data;
};

const deleteUser = async(id) => {
    try {
      const res = await http.post("/mypage/delete/user", {
        id: id,        
        joined :"N",
      });
    } catch (err) {
      console.error("삭제 에러:", err);
    }

}

const UserPageService = {
  getMyPageUser,
  updateMyPageUser,
  deleteMyPageUser,
  verifyMyPagePassword,
  getProfileImage,
  updateProfileImage,
  deleteUser,
};

export default UserPageService;
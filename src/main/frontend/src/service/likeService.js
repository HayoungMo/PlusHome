import http from "../http-common";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

const getMyFurnitureLikes = () => {
  return http.get("/like/furniture", {
    headers: getAuthHeaders(),
  });
};

const checkFurnitureLike = (f_code) => {
  return http.get(`/like/furniture/${f_code}`, {
    headers: getAuthHeaders(),
  });
};

const toggleFurnitureLike = (f_code) => {
  return http.post(`/like/furniture/${f_code}`, null, {
    headers: getAuthHeaders(),
  });
};

const LikeService = {
  getMyFurnitureLikes,
  checkFurnitureLike,
  toggleFurnitureLike,
};

export default LikeService;

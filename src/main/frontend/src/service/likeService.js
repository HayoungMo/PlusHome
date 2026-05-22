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

const getMyInteriorLikes = () => {
  return http.get("/like/interior", {
    headers: getAuthHeaders(),
  });
};

const checkFurnitureLike = (f_code) => {
  return http.get(`/like/furniture/${f_code}`, {
    headers: getAuthHeaders(),
  });
};

const checkInteriorLike = (like_code) => {
  return http.get(`/like/interior/${like_code}`, {
    headers: getAuthHeaders(),
  });
};

const toggleFurnitureLike = (f_code) => {
  return http.post(`/like/furniture/${f_code}`, null, {
    headers: getAuthHeaders(),
  });
};

const toggleInteriorLike = (like_code) => {
  return http.post(`/like/interior/${like_code}`, null, {
    headers: getAuthHeaders(),
  });
};

const LikeService = {
  getMyFurnitureLikes,
  getMyInteriorLikes,
  checkFurnitureLike,
  checkInteriorLike,
  toggleFurnitureLike,
  toggleInteriorLike,
};

export default LikeService;

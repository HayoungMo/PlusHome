import http from "../http-common";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

const createClaim = async (data) => {
  const res = await http.post("/claim/create", data, {
    headers: getAuthHeaders(),
  });

  return res.data;
};

const checkClaim = async (c_code) => {
  const res = await http.get("/claim/check", {
    params: { c_code },
    headers: getAuthHeaders(),
  });

  return res.data;
};

const getMyClaims = async () => {
  const res = await http.get("/claim/my", {
    headers: getAuthHeaders(),
  });

  return res.data;
};

const getAllClaims = async () => {
  const res = await http.get("/claim/admin", {
    headers: getAuthHeaders(),
  });

  return res.data;
};

const updateStatus = async (claim_code, claim_status) => {
  const res = await http.put(
    "/claim/status",
    {
      claim_code,
      claim_status,
    },
    {
      headers: getAuthHeaders(),
    }
  );

  return res.data;
};

const OrderClaimService = {
  createClaim,
  checkClaim,
  getMyClaims,
  getAllClaims,
  updateStatus,
};

export default OrderClaimService;

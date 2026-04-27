import http from "../http-common";

const fetchList = async () => {
  try {
    const res = await http.get("interior");

    console.log("응답 데이터:", res.data);
    return res.data;
  } catch (err) {
    console.error("에러:", err);
  }
};

const fetchArticle = async () => {
  try {
    const res = await http.post("interior/read", {
      c_id: "111",
      c_kind: "interior",
      c_name: "111",
    });

    console.log("응답 데이터:", res.data);
    return res.data;
  } catch (err) {
    console.error("에러:", err);
  }
};

const fetchExample = async () => {
  try {
    const res = await http.post("interior/example", {
      c_id: "111",
      c_kind: "interior",
      c_name: "111",
    });

    console.log("응답 데이터:", res.data);
    return res.data;
  } catch (err) {
    console.error("에러:", err);
  }
};

const testAdd = async (data) => {
  try {
    const res = await http.post("/interior/add", {
      c_id: "111",
      c_kind: "interior",
      c_name: "111",
      i_tag : data.tag,
      i_text : data.text
    });

    console.log("결과:", res.data);
  } catch (err) {
    console.error(err);
  }
};

const InteriorService = {
  fetchExample,
  fetchArticle,
  fetchList,
  testAdd
};

export default InteriorService;
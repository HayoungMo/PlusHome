import axios from "axios";
import { useState } from "react";
import http from "../http-common";
import InteriorService from "../service/interiorService";

//테스트용 파일
function InteriorList() {
    const [list, setList] = useState([]);

    const [article, setArticle] = useState([]);

    const [example, setExample] = useState([]); 

     const [form, setForm] = useState({
       c_id: "",
       c_kind: "",
       c_name: "",
     });

     const handleChange = (e) => {
       setForm({
         ...form,
         [e.target.name]: e.target.value,
       });
     };

     const handleSubmit = async (e) => {
       e.preventDefault(); // 🔥 페이지 새로고침 막기

       try {
         const res = await axios.post(
           "http://localhost:8080/api/interior/read",
           form,
         );
         console.log(res.data);
       } catch (err) {
         console.error(err);
       }
     };

    return (
      <div>
        <div>
          <button
            onClick={async () => {
              const data = await InteriorService.fetchList();
              setList(data);
            }}
          >
            데이터 조회
          </button>
        </div>

        <div>
          <h3>결과</h3>
          {list.map((item, idx) => (
            <div key={idx} style={{ borderBottom: "1px solid #ccc" }}>
              <p>id: {item.c_id}</p>
              <p>name: {item.c_name}</p>
              <p>kind: {item.c_kind}</p>
              <p>tel: {item.c_tel}</p>
              <p>addr: {item.c_addr}</p>
            </div>
          ))}
        </div>

        <div>
          <button
            onClick={async () => {
              const data = await InteriorService.fetchArticle();
              setArticle(data);
            }}
          >
            데이터 조회
          </button>
        </div>

        <div>
          <h3>상세 조회 결과</h3>
          {article.map((item, idx) => (
            <div key={idx} style={{ borderBottom: "1px solid #ccc" }}>
              <p>id: {item.c_id}</p>
              <p>name: {item.c_name}</p>
              <p>kind: {item.c_kind}</p>
              <p>tag: {item.i_tag}</p>
              <p>text: {item.i_text}</p>
            </div>
          ))}
        </div>

        <div>
          <button
            onClick={async () => {
              const data = await InteriorService.fetchExample();
              setExample(data);
            }}
          >
            데이터 조회
          </button>
        </div>

        <div>
          <h3>예시 조회 결과</h3>
          {example.map((item, idx) => (
            <div key={idx} style={{ borderBottom: "1px solid #ccc" }}>
              <p>id: {item.c_id}</p>
              <p>name: {item.c_name}</p>
              <p>kind: {item.c_kind}</p>
              <p>tag: {item.ie_tag}</p>
              <p>tag2: {item.ie_tag2}</p>
              <p>content: {item.ie_content}</p>
            </div>
          ))}
        </div>

        <form name="article" onSubmit={handleSubmit}>
          <div>
            <input type="text" name="tag" onAbortnChange={handleChange} />
            <input type="text" name="text" onChange={handleChange} />
            <input type="submit" onChange={handleChange} />
          </div>
        </form>
      </div>
    );

};

export default InteriorList;

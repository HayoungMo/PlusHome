import axios from "axios";
import { useState } from "react";
import http from "../http-common";
import InteriorService from "../service/interiorService";
import DatePickerMui from "../components/DatePickerMui";

//테스트용 파일
function InteriorList() {
    const [list, setList] = useState([]);

    const [article, setArticle] = useState([]);

    const [example, setExample] = useState([]); 

    const [form, setForm] = useState({
       c_id: "",
       c_kind: "",
       c_name: "",
       tag: "",
       text: "",
     });

     const [form2, setForm2] = useState({
       c_id: "",
       c_kind: "",
       c_name: "",
       tag: "",
       tag2: "",
       content: "",
     });

     const [form3, setForm3] = useState({
      id:"",
       c_id: "",
       c_kind: "",
       c_name: "",
       kind: "",
       long: "",
       date: "",
       content: ""
     });

     const handleChange = (e) => {
       setForm({
         ...form,
         [e.target.name]: e.target.value,
       });
     };
     const handleSubmit = async (e) => {
       e.preventDefault(); // 🔥 페이지 새로고침 막기
       InteriorService.testAddInterior(form);
     };

     const handleChange2 = (e) => {
       setForm2({
         ...form2,
         [e.target.name]: e.target.value,
       });
     };

     const handleSubmit2 = async (e) => {
       e.preventDefault(); // 🔥 페이지 새로고침 막기
       InteriorService.testAddInteriorExample(form2);
     };

      const handleChange3 = (e) => {
        setForm3({
          ...form3,
          [e.target.name]: e.target.value,
        });
      };

      const handleDateChange = (newValue) => {
        setForm3((prev) => ({
          ...prev,
          date: newValue,
        }));
      };

      const handleSubmit3 = async (e) => {
        e.preventDefault(); // 🔥 페이지 새로고침 막기
        InteriorService.testAddBooking(form3);
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
            <input type="text" name="tag" onChange={handleChange} />
            <input type="text" name="text" onChange={handleChange} />
            <input type="submit" />
          </div>
        </form>

        <form name="example" onSubmit={handleSubmit2}>
          <div>
            <input type="text" name="tag" onChange={handleChange2} />
            <input type="text" name="tag2" onChange={handleChange2} />
            <input type="text" name="content" onChange={handleChange2} />
            <input type="submit" />
          </div>
        </form>

        <form name="booking" onSubmit={handleSubmit3}>
          <div>
            <input type="text" name="kind" onChange={handleChange3} />
            <input type="text" name="long" onChange={handleChange3} />
            <DatePickerMui value={form3.date} onChange={handleDateChange} />
            <input type="text" name="content" onChange={handleChange3} />
            <input type="submit" />
          </div>
        </form>
      </div>
    );

};

export default InteriorList;

import { useState } from "react";

import InteriorService from "../service/interiorService";
import DatePickerMui from "../components/DatePickerMui";
import TextFieldMui from "../components/TextFieldMui";
import { Button } from "@mui/material";

//테스트용 파일
function InteriorCreated() {
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

     const [form4, setForm4] = useState({
       id: "",
       c_id: "",
       c_kind: "",
       c_name: "",
       text: "",
       price: ""
     });

     const handleChange = (e) => {
       setForm({
         ...form,
         [e.target.name]: e.target.value,
       });
     };
     const handleSubmit = async (e) => {
       e.preventDefault(); // 🔥 페이지 새로고침 막기
       InteriorService.AddInterior(form);
     };

     const handleChange2 = (e) => {
       setForm2({
         ...form2,
         [e.target.name]: e.target.value,
       });
     };

     const handleSubmit2 = async (e) => {
       e.preventDefault(); // 🔥 페이지 새로고침 막기
       InteriorService.AddInteriorExample(form2);
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
        InteriorService.AddBooking(form3);
      };

      const handleChange4 = (e) => {
        setForm4({
          ...form4,
          [e.target.name]: e.target.value,
        });
      };

      const handleSubmit4 = async (e) => {
        e.preventDefault(); // 🔥 페이지 새로고침 막기
        InteriorService.AddInvoice(form4);
      };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h5>인테리어 업체 추가</h5>
        <form name="article" onSubmit={handleSubmit}>
          <div>
            <TextFieldMui name="tag" label="tag" onChange={handleChange} />
            <TextFieldMui name="text" label="text" onChange={handleChange} />
            <Button type="submit" variant="contained">
              제출
            </Button>
          </div>
        </form>

        <h5>인테리어 시공 사례 추가</h5>
        <form name="example" onSubmit={handleSubmit2}>
          <div>
            <TextFieldMui name="tag" label="tag" onChange={handleChange2} />
            <TextFieldMui name="tag2" label="tag2" onChange={handleChange2} />
            <TextFieldMui
              name="content"
              label="content"
              onChange={handleChange2}
            />
            <Button type="submit" variant="contained">
              제출
            </Button>
          </div>
        </form>

        <h5>인테리어 상담 신청</h5>
        <form name="booking" onSubmit={handleSubmit3}>
          <div>
            <TextFieldMui name="kind" label="kind" onChange={handleChange3} />
            <TextFieldMui name="long" label="long" onChange={handleChange3} />
            <DatePickerMui value={form3.date} onChange={handleDateChange} />
            <TextFieldMui
              name="content"
              label="content"
              onChange={handleChange3}
            />
            <Button type="submit" label="submit" variant="contained">
              제출
            </Button>
          </div>
        </form>

        <h5>인테리어 견적 추가</h5>
        <form name="invoice" onSubmit={handleSubmit4}>
          <div>
            <TextFieldMui name="text" label="text" onChange={handleChange4} />
            <TextFieldMui name="price" label="price" onChange={handleChange4} />
            <Button type="submit" variant="contained">
              제출
            </Button>
          </div>
        </form>
      </div>
    );

};

export default InteriorCreated;

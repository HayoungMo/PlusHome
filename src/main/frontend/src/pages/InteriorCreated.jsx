import { useEffect, useState } from "react";

import InteriorService from "../service/interiorService";
import TextFieldMui from "../components/TextFieldMui";
import { Button } from "@mui/material";

//테스트용 파일
function InteriorCreated(/*{ company }*/) {
  const [company, setCompany] = useState({
    c_id: "com1",
    c_kind: "interior",
    c_name: "모던하우스",
  });

  const [form, setForm] = useState({
    c_id: company.c_id,
    c_kind: company.c_kind,
    c_name: company.c_name,
    tag: "",
    text: "",
  });

  const [form2, setForm2] = useState({
    c_id: company.c_id,
    c_kind: company.c_kind,
    c_name: company.c_name,
    tag: "",
    tag2: "",
    content: "",
  });

  const [form4, setForm4] = useState({
    text: "",
    price: "",
  });

  const [booking, setBooking] = useState([]);

  const [invoice, setInvoice] = useState([]);

  const [reload, setReload] = useState(0);

  const refresh = () => {
    setReload((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchBooking = async () => {
      const data = await InteriorService.fetchBookingList(company);
      setBooking(data);
    };

    fetchBooking();
  }, [reload]);

  useEffect(() => {
    const fetchInvoices = async () => {
      const results = [];

      for (const item of booking) {
        const data = await InteriorService.fetchInvoice(item);

        if (Array.isArray(data)) {
          results.push(...data);
        } else if (data) {
          results.push(data);
        }
      }
      const merged = results.flat();
      setInvoice(merged);
    };

    if (booking.length > 0) {
      fetchInvoices();
    } else {
      setInvoice([]);
    }
  }, [booking]);

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
    refresh();
  };

  const handleChange4 = (e) => {
    setForm4({
      ...form4,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit4 = async (e, item) => {
    e.preventDefault();

    const invoiceData = {
      id: item.id,
      c_id: item.c_id,
      c_kind: item.c_kind,
      c_name: item.c_name,
      b_createdDate: item.b_createdDate,
      invoice_text: form4.text,
      invoice_price: form4.price,
    };

    console.log("invoiceData:", invoiceData);

    await InteriorService.AddInvoice(invoiceData);
    refresh();
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

      <div>
        <h3>상담 조회 결과</h3>
        {booking.map((item, idx) => (
          <div key={idx}>
            <div>b_content: {item.b_content}</div>
            <div>
              <h3>인보이스 조회 결과</h3>
              {invoice.length === 0 ? (
                <div>등록된 견적이 없습니다.</div>
              ) : (
                invoice.map((inv, i) => (
                  <div key={i}>
                    <div>text: {inv.invoice_text}</div>
                    <div>price: {inv.invoice_price}</div>
                  </div>
                ))
              )}
            </div>

            <h5>인테리어 견적 추가</h5>
            <form name="invoice" onSubmit={(e) => handleSubmit4(e, item)}>
              <div>
                <TextFieldMui
                  name="text"
                  label="text"
                  onChange={handleChange4}
                />
                <TextFieldMui
                  name="price"
                  label="price"
                  onChange={handleChange4}
                />
                <Button type="submit" variant="contained">
                  제출
                </Button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InteriorCreated;

import { useEffect, useState } from "react";

import InteriorService from "../service/interiorService";
import TextFieldMui from "../components/TextFieldMui";
import { Button } from "@mui/material";
import ImageService from "../service/imageService";

//테스트용 파일
function InteriorCreated(/*{ company }*/) {
  const [company, setCompany] = useState({
    c_id: "comp02",
    c_kind: "interior",
    c_name: "감성인테리어",
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

  const [details, setDetails] = useState([{ text: "", price: "" }]);

  const [booking, setBooking] = useState([]);

  const [invoice, setInvoice] = useState([]);

  const [invoiceDetails, setInvoiceDetails] = useState([]);

  const [reload, setReload] = useState(0);

  const [sendList, setSendList] = useState([]);

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

    const fetchInvoiceDetails = async () => {
      const results = [];

      for (const item of invoice) {
        const data = await InteriorService.fetchInvoiceDetails(item);

        if (Array.isArray(data)) {
          results.push(...data);
        } else if (data) {
          results.push(data);
        }
      }
      const merged = results.flat();
      setInvoiceDetails(merged);
    };

    if (booking.length > 0) {
      fetchInvoices();
      if (invoice.length > 0) {
        fetchInvoiceDetails();
      } else {
        setInvoiceDetails([]);
      }
    } else {
      setInvoice([]);
    }
  }, [booking]);

  useEffect(() => {   

    const fetchInvoiceDetails = async () => {
      const results = [];

      for (const item of invoice) {
        const data = await InteriorService.fetchInvoiceDetails(item);

        if (Array.isArray(data)) {
          results.push(...data);
        } else if (data) {
          results.push(data);
        }
      }
      const merged = results.flat();
      setInvoiceDetails(merged);
    };

      if (invoice.length > 0) {
        fetchInvoiceDetails();
      } else {
        setInvoiceDetails([]);
      }

  }, [invoice]);

  useEffect(() => {
    const latestNo = getNextInvoiceNo() - 1;

    if (!latestNo) return;

    const latestDetails = invoiceDetails.filter((item)=> latestNo == item.invoice_no);

    if (latestDetails && latestDetails.length > 0) {
      setDetails(
        latestDetails.map((d) => ({
          text: d.invoice_text,
          price: d.invoice_price,
        })),
      );
    }
  }, [invoiceDetails]);

  const onClickAdd = () => {
      const insertForm = document.getElementsByName("imageInsertTestForm")[0];
      setSendList([
        ...sendList,
        {
          img_kind: insertForm.img_kind.value,
          img_tag: insertForm.img_tag.value,
          dir_a: insertForm.dir_a.value,
          dir_b: insertForm.dir_b.value,
          dir_c: insertForm.dir_c.value,
          dir_d: insertForm.dir_d.value,
          // dir_b: insertForm.dir_b.value,
          img_idx: insertForm.img_idx.value,
          file: insertForm.file.files[0],
        },
      ]);
    };
  
    const onClickInsert = () => {
      ImageService.insertImage(sendList);
    };


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

  const addDetail = () => {
    setDetails([...details, { text: "", price: "" }]);
  };

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;

    const newDetails = [...details];
    newDetails[index] = {
      ...newDetails[index],
      [name]: value,
    };

    setDetails(newDetails);
  };

  const getNextInvoiceNo = () => {
    if (!invoice || invoice.length === 0) {
      return 1;
    }

    const maxNo = Math.max(
      ...invoice.map((inv) => Number(inv.invoice_no)),
    );

    return maxNo + 1;
  };

  const handleSubmit4 = async (e, item) => {
    e.preventDefault();
    const nextInvoiceNo = getNextInvoiceNo();

    const invoiceData = {
      id: item.id,
      invoice_no: nextInvoiceNo,
      c_id: item.c_id,
      c_kind: item.c_kind,
      c_name: item.c_name,
      b_createdDate: item.b_createdDate,
      details: details.map((detail) => ({
        invoice_text: detail.text,
        invoice_price: Number(detail.price),
      })),
    };

    console.log("invoiceData:", invoiceData);

    await InteriorService.AddInvoice(invoiceData);

    refresh();
  };

  const normalizeAnswers = (answers) => {
    const parsedAnswers = JSON.parse(answers);
    return Object.entries(parsedAnswers).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => ({
          tag: key,
          value: v,
        }));
      }

      return {
        tag: key,
        value,
      };
    });
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
      <p>이미지 업로드</p>
      <form name="imageInsertTestForm">
        <input
          type="hidden"
          value="LOGO"
          name="img_kind"
          placeholder="IMG_KIND"
        />
        <input
          type="hidden"
          value="PROFILE"
          name="img_tag"
          placeholder="IMG_TAG"
        />
        <input
          type="hidden"
          value={company.c_id}
          name="dir_a"
          placeholder="DIR_A"
        />
        <input
          type="hidden"
          value={company.c_kind}
          name="dir_b"
          placeholder="DIR_B"
        />
        <input
          type="hidden"
          value={company.c_name}
          name="dir_c"
          placeholder="DIR_C"
        />
        <input type="hidden" value="LOGO" name="dir_d" placeholder="DIR_D" />
        {/* <input type="hidden" value="imgTest" name="dir_b" placeholder="DIR_B" /> */}
        <input type="hidden" name="img_idx" value="1" placeholder="IMG_IDX" />
        <input type="file" name="file" />
        <br />
        <input type="button" onClick={onClickAdd} value="Add" />
        <br />
        <input type="button" onClick={onClickInsert} value="Insert" />
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
            <div>
              <p>{item.b_content}</p>
              {normalizeAnswers(item.b_answer).map((record) => (
                <div>
                  tag: {record.tag}
                  /// value: {record.value}
                </div>
              ))}
            </div>

            {invoice.map((item, idx) => (
              <div>
                {item.invoice_no}///{item.invoice_kind}
                {invoiceDetails
                  .filter(
                    (record) =>
                      record.invoice_no === item.invoice_no &&
                      record.invoice_kind === item.invoice_kind,
                  )
                  .map((item) => (
                    <div>
                      {item.invoice_text}//{item.invoice_price}
                    </div>
                  ))}
              </div>
            ))}

            <h5>인테리어 견적 추가</h5>
            <form onSubmit={(e) => handleSubmit4(e, item)}>
              {details.map((detail, index) => (
                <div key={index}>
                  <TextFieldMui
                    name="text"
                    label="항목"
                    value={detail.text}
                    onChange={(e) => handleDetailChange(index, e)}
                  />

                  <TextFieldMui
                    name="price"
                    label="가격"
                    value={detail.price}
                    onChange={(e) => handleDetailChange(index, e)}
                  />
                </div>
              ))}

              <Button type="button" onClick={addDetail}>
                항목 추가
              </Button>

              <Button type="submit" variant="contained">
                견적서 제출
              </Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InteriorCreated;

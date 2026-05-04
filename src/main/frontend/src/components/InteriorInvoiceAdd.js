import React, { useEffect, useState } from 'react';
import InteriorService from '../service/interiorService';
import CheckboxMui from './CheckboxMui';
import TextFieldMui from './TextFieldMui';
import { Button } from '@mui/material';

const InteriorInvoiceAdd = ({company}) => {

    

  const [details, setDetails] = useState([{ text: "", qty:"" ,price: "" }]);

  const [booking, setBooking] = useState([]);

  const [invoice, setInvoice] = useState([]);

  const [invoiceDetails, setInvoiceDetails] = useState([]);

  const [kind, setKind] = useState({});

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

    const latestDetails = invoiceDetails.filter(
      (item) => latestNo == item.invoice_no,
    );

    if (latestDetails && latestDetails.length > 0) {
      setDetails(
        latestDetails.map((d) => ({
          text: d.invoice_text,
          qty: d.invoice_qty,
          price: d.invoice_price,
        })),
      );
    }
  }, [invoiceDetails]);

  const addDetail = () => {
    setDetails([...details, { text: "",qty: "" ,price: "" }]);
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

    const maxNo = Math.max(...invoice.map((inv) => Number(inv?.invoice_no)));

    return maxNo + 1;
  };

  const handleSubmit4 = async (e, item) => {
    e.preventDefault();
    const nextInvoiceNo = getNextInvoiceNo();

    const invoiceData = {
      id: item.id,
      invoice_no: nextInvoiceNo,
      invoice_kind: kind[item.b_createdDate] || "N",
      c_id: item.c_id,
      c_kind: item.c_kind,
      c_name: item.c_name,
      b_createdDate: item.b_createdDate,
      details: details.map((detail) => ({
        invoice_text: detail.text,
        invoice_qty: Number(detail.qty),
        invoice_price: Number(detail.price),
      })),
    };

    console.log("invoiceData:", invoiceData);

    await InteriorService.AddInvoice(invoiceData);

    refresh();
  };

  const normalizeAnswers = (answers) => {
    if (!answers) return []; // ⭐ 추가

    let parsedAnswers;
    try {
      parsedAnswers =
        typeof answers === "string" ? JSON.parse(answers) : answers;
    } catch (e) {
      return []; // JSON 깨져도 안전하게
    }

    return Object.entries(parsedAnswers || {}).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => ({
          tag: key,
          value: v,
        }));
      }

      return {
        tag: key,
        value: value ?? "", // ⭐ null 방지
      };
    });
  };
    return (
      <div>
        <h3>상담 조회 결과</h3>
        {Array.isArray(booking) && booking.length > 0 ? (
          booking.map((item, idx) => (
            <div key={idx}>
              <div>
                <p>{item.b_content}</p>
                {normalizeAnswers(item?.b_answer).map((record) => (
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
                        record?.invoice_no === item?.invoice_no &&
                        record?.invoice_kind === item?.invoice_kind,
                    )
                    .map((item) => (
                      <div>
                        {item.invoice_text}//{item.invoice_qty}//
                        {item.invoice_price}
                      </div>
                    ))}
                </div>
              ))}

              {(item.b_status === "pending" || item.b_status === "quoting")&& (
                <div>
                  <h5>인테리어 견적 추가</h5>
                  <form onSubmit={(e) => handleSubmit4(e, item)}>
                    <CheckboxMui
                      name="invoice_kind"
                      checked={(kind[item.b_createdDate] || "N") === "Y"}
                      onChange={(e) => {
                        setKind({
                          ...kind,
                          [item.b_createdDate]: e.target.checked ? "Y" : "N",
                        });
                      }}
                    />
                    {details.map((detail, index) => (
                      <div key={index}>
                        <TextFieldMui
                          name="text"
                          label="항목"
                          value={detail.text}
                          onChange={(e) => handleDetailChange(index, e)}
                        />

                        <TextFieldMui
                          name="qty"
                          label="개수"
                          value={detail.qty}
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
              )}
            </div>
          ))
        ) : (
          <p>상담 데이터가 없습니다.</p>
        )}
      </div>
    );
};

export default InteriorInvoiceAdd;
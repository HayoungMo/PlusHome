import React, { useEffect, useState } from "react";
import CouponService from "../service/couponService";
import AlertMui from "./AlertMui";
import TextFieldMui from "./TextFieldMui";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import NumberField from "./NumberFieldMui";
import DatePickerMui from "./DatePickerMui";
import CompanyService from "../service/companyService";
import SelectMui from "./SelectMui";

const CouponAdd = ({onCreated}) => {
  //쿠폰 발급 페이지
  const id = localStorage.getItem("id");
  const [companyList, setCompanyList] = useState();
  const [form, setForm] = useState({ 
    id: id,
    coupon_type: "all",
    coupon_catagory: "" 
  }); 
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const handleChange = (e) => {
    const {name, value} = e.target

    if(name === "coupon_type"){
      setForm((prev) => ({
        ...prev,
        coupon_type: value,
        coupon_catagory: "",
      }))
      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const makeEvent = (name, value) => ({
    target: {
      name,
      value,
    },
  });

  const tagOptions1 = [
    { value: "all", title: "전부 적용" },
    { value: "company", title: "회사별 적용" },
    { value: "catagory", title: "카테고리별 적용" },
  ];

  const categoryOptions = [
    { value: "bed", title: "침대" },
    { value: "sofa", title: "소파" },
    { value: "desk", title: "책상" },
    { value: "chair", title: "의자" },
    { value: "table", title: "식탁" },
    { value: "storage", title: "수납장" },
    { value: "light", title: "조명" },
    { value: "mattress", title: "매트리스" },
    { value: "dresser", title: "화장대" },
    { value: "closet", title: "옷장" },
    { value: "custom", title: "직접 입력" },
  ];
  
  useEffect(()=>{
    const fetchCompany = async() => {
      const result = await CompanyService.getLists();

      const optionList = result.map((item) => ({
        value: item.c_id + "_" + item.c_kind + "_" + item.c_name,
        title: item.c_name,
      }));

      setCompanyList(optionList);
    }
    fetchCompany();
  },[])

  const handleSubmit = async (e) => {
    const result = await CouponService.insertCouponDev(form);

    if (result.success) {
      setAlert({
        open: true,
        severity: "success",
        title: "등록 성공",
        text: "등록되었습니다.",
      });
      if(onCreated){
        onCreated(result.data);
      }
    } else {
      setAlert({
        open: true,
        severity: "error",
        title: `에러${result.status || ""}`,
        text: result.message || "등록 실패",
      });
    }
  };
  return (
    <div>
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() =>
          setAlert((prev) => ({
            ...prev,
            open: false,
          }))
        }
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={alert.severity}
          onClose={() =>
            setAlert((prev) => ({
              ...prev,
              open: false,
            }))
          }
          sx={{
            width: "400px",
            fontSize: "1rem",
            padding: "16px 20px",
            alignItems: "center",
          }}
        >
          <AlertTitle>{alert.title}</AlertTitle>
          {alert.text}
        </Alert>
      </Snackbar>
      <form name="coupon">
        <NumberField
          name="discount"
          label="할인률"
          min={0}
          max={100}
          onValueChange={(value) => handleChange(makeEvent("discount", value))}
        />
        <NumberField
          name="coupon_max"
          label="최대 할인 금액"
          min={0}
          onValueChange={(value) =>
            handleChange(makeEvent("coupon_max", value))
          }
        />
        <DatePickerMui
          name="coupon_end"
          label="유효 기간"
          value={form.coupon_end}
          onChange={(value) =>
            handleChange(makeEvent("coupon_end", value.format("YYYY-MM-DD")))
          }
        />
        <TextFieldMui
          name="coupon_info"
          label="쿠폰 정보"
          onChange={handleChange}
        />
        <SelectMui
          name="coupon_type"
          label="쿠폰 타입"
          value={form.coupon_type}
          onChange={handleChange}
          option={tagOptions1}
        />

        {form.coupon_type !== "all" && 
        <SelectMui 
        name="coupon_catagory" 
        label={form.coupon_type === "company" ? "회사 선택" : "카테고리 선택"}
        value={form.coupon_catagory || ""}
        onChange={handleChange}
        option={ form.coupon_type === "company" ? companyList : categoryOptions}
         />}

        <Button onClick={(e) => handleSubmit(e)}>발급</Button>
      </form>
    </div>
  );
};

export default CouponAdd;

import React, { useEffect, useState } from "react";
import CouponService from "../service/couponService";
import AlertMui from "./AlertMui";
import TextFieldMui from "./TextFieldMui";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import NumberField from "./NumberFieldMui";
import DatePickerMui from "./DatePickerMui";
import CompanyService from "../service/companyService";
import SelectMui from "./SelectMui";
import { furnitureCategoryOptions } from "./FurnitureCategorySelect";

const CouponAddDev= (data) => {

   const {selectedKeys, couponData, setCouponData,reloadFunc} = data

  //쿠폰 발급 페이지
  const [companyList, setCompanyList] = useState();
  const [form, setForm] = useState({ 
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

  const categoryOptions = furnitureCategoryOptions.f_catagory1;
  
  useEffect(()=>{
    const fetchCompany = async() => {
      const result = await CompanyService.getLists();

      const optionList = result.map((item) => ({
        value: item.c_id,
        //value: item.c_id + "_" + item.c_name + "_" + item.c_kind,
        title: item.c_name,
      }));

      setCompanyList(optionList);
    }
    fetchCompany();
  },[])

  const handleSubmit = async (e) => {

    const data = {
      ...form,
      userIds: selectedKeys
    }
    console.log("최종데이터:",data)
    console.log(data)
    const result = await CouponService.insertCoupon(data);

    if (result.success) {

      await reloadFunc?.()

      setAlert({
        open: true,
        severity: "success",
        title: "등록 성공",
        text: "등록되었습니다.",
      });

      setForm({
        coupon_type:"all",
        coupon_catagory:"",
        discount:null,
        coupon_max:null,
        coupon_info:"",
        coupon_end:"",

      })


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
          value={form.discount || null}
          label="할인률"
          min={0}
          max={100}
          onValueChange={(value) => handleChange(makeEvent("discount", value))}
        />
        <NumberField
          name="coupon_max"
          label="최대 할인 금액"
          value={form.coupon_max || null}
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
          value={form.coupon_info || ""}
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

export default CouponAddDev;

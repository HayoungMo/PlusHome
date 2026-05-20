import React, { useEffect, useState } from "react";
import EventService from "../service/eventService";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import DatePickerMui from "./DatePickerMui";
import TextFieldMui from "./TextFieldMui";
import ImageService from "../service/imageService";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SelectMui from "./SelectMui";
import CouponAdd from "./CouponAdd";
import CouponService from "../service/couponService";
import TableCheckBoxMui from "./TableCheckBoxMui";

const EventCreated = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const [sendList, setSendList] = useState([]);
  const [form, setForm] = useState({ e_id: randomNum });
  const [preview, setPreview] = useState([]);
  const [couponList, setCouponList] = useState([]);
  const [selectedCouponCodes, setSelectedCouponCodes] = useState([]);

  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const option = [
    { value: "notice", title: "공지사항" },
    { value: "event", title: "이벤트" },
  ];

  const isAvailableCoupon = (coupon) => {
    if (!coupon?.coupon_end) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return new Date(coupon.coupon_end) >= today;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,

      ...(name === "e_type" &&
        value !== "event" && {
          e_long: null, // 또는 dayjs().format("YYYY-MM-DD")
        }),
    });
  };

  useEffect(() => {
    const fetchCoupon = async () => {
      const result = await CouponService.selectCouponDev();
      if (!result.success) {
        return;
      }
      setCouponList((result.data || []).filter(isAvailableCoupon));
    };
    fetchCoupon();
  }, []);

  const handleCouponCreated = (newCoupon) => {
    if (!isAvailableCoupon(newCoupon)) return;

    setCouponList((prev) => [newCoupon, ...prev]);
    setSelectedCouponCodes((prev)=>[...prev, newCoupon.coupon_code])
  };

  const makeEvent = (name, value) => ({
    target: {
      name,
      value,
    },
  });
  const onClickAdd = () => {
    const insertForm2 = document.getElementsByName("imageInsertTestForm2")[0];
    setSendList([
      ...sendList,
      {
        img_kind: insertForm2.img_kind.value,
        img_tag: insertForm2.img_tag.value,
        dir_a: insertForm2.dir_a.value,
        dir_b: insertForm2.dir_b.value,
        //dir_c: insertForm2.dir_c.value,
        //dir_d: insertForm2.dir_d.value,
        // dir_e: insertForm.dir_e.value,
        img_idx: sendList.length,
        file: insertForm2.file.files[0],
      },
    ]);
    setPreview((prev) => [
      ...prev,
      URL.createObjectURL(insertForm2.file.files[0]),
    ]);
  };

  const onClickInsert = async () => {
    if (!sendList || sendList.length === 0) {
      console.log("보낼 이미지 없음");
      return {
        success: false,
        log: "보낼 이미지 없음",
      }; // 🚫 요청 안 보냄
    }
    try {
      await ImageService.insertImage(sendList);

      // 업로드 성공 후 초기화
      setSendList([]);
      return {
        success: true,
      };
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await EventService.insertEvent(form);

    if (!result.success) {
      setAlert({
        open: true,
        severity: "error",
        title: `에러${result.status || ""}`,
        text: result.message || "등록 실패",
      });
      return;
    }

    const selectedCouponObjects = couponList.filter((coupon) =>
      selectedCouponCodes.includes(coupon.coupon_code),
    );

    await Promise.all(
      selectedCouponObjects.map((coupon) =>
        EventService.insertEventCoupon({
          e_id: form.e_id,
          coupon_code: coupon.coupon_code,
          id: coupon.id,
        }),
      ),
    );

    await onClickInsert();

    setAlert({
      open: true,
      severity: "success",
      title: "등록 성공",
      text: "등록되었습니다.",
    });

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
      <form name="event">
        <SelectMui
          name="e_type"
          label="이벤트/공지사항"
          option={option}
          onChange={handleChange}
        />
        <TextFieldMui
          name="e_title"
          label="이벤트 제목"
          onChange={handleChange}
        />
        {form.e_type === "event" && (
          <DatePickerMui
            name="e_long"
            label="이벤트 기간"
            value={form.e_long}
            onChange={(value) =>
              handleChange(makeEvent("e_long", value.format("YYYY-MM-DD")))
            }
          />
        )}
        <TextFieldMui
          name="e_content"
          label="이벤트 정보"
          onChange={handleChange}
        />
        <Button onClick={(e) => handleSubmit(e)}>게시</Button>
      </form>
      {form.e_title && (
        <form name="imageInsertTestForm2">
          <p>시공사례 이미지 업로드</p>
          <input
            type="hidden"
            value="DEV"
            name="img_kind"
            placeholder="IMG_KIND"
          />
          <input
            type="hidden"
            value={
              sendList === null || sendList.length === 0 ? "THUMBNAIL" : "OTHER"
            }
            name="img_tag"
            placeholder="IMG_TAG"
          />
          <input
            type="hidden"
            value={form.e_id}
            name="dir_a"
            placeholder="DIR_A"
          />
          <input
            type="hidden"
            value={form.e_title}
            name="dir_b"
            placeholder="DIR_B"
          />
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
            추가할 파일
            <input
              type="file"
              hidden
              name="file"
              onChange={() => onClickAdd()}
            />
          </Button>
        </form>
      )}
      <CouponAdd onCreated={handleCouponCreated} />

      <TableCheckBoxMui
        rowData={couponList}
        col={[
          "coupon_code",
          "discount",
          "coupon_end",
          "coupon_max",
          "coupon_info",
        ]}
        checkedList={selectedCouponCodes}
        setCheckedList={setSelectedCouponCodes}
        rowKey="coupon_code"
      />
      {preview &&
        preview.map((item) => (
          <img
            src={item}
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
            alt=""
          />
        ))}
    </div>
  );
};

export default EventCreated;

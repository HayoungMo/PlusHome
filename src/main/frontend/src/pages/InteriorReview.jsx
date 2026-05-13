import React, { useEffect, useRef, useState } from "react";
import TextFieldMui from "../components/TextFieldMui";
import { Button } from "@mui/material";
import ImageService from "../service/imageService";
import InteriorUserService from "../service/interiorUserService";
import { useLocation, useNavigate } from "react-router-dom";
import DialogMui from "../components/DialogMui";
import FloatingActionButtonMui from "../components/FloatingActionButtonMui";
import AddIcon from "@mui/icons-material/Add";

const InteriorReview = () => {
  const [sendList, setSendList] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const invoice = location.state?.invoice;
  const [form, setForm] = useState({
    id: invoice.id,
    invoice_no: invoice.invoice_no,
    invoice_kind: invoice.invoice_kind,
    c_id: invoice.c_id,
    c_kind: invoice.c_kind,
    c_name: invoice.c_name,
    b_createdDate: invoice.b_createdDate,
  });

  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState([]);
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const fetchReview = async () => {
      const data = await InteriorUserService.fetchInteriorReview(form.id);

      if (data.length !== 0) {
        alert("이미 작성한 리뷰가 있습니다.");
        navigate("../interior/mypage");
      }
    };

    fetchReview();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    try {
      if (sendList.length === 0) {
        alert("등록 시 이미지가 최소 1개 있어야 합니다.");
        return;
      }
      await InteriorUserService.AddInteriorReview(form);
      await ImageService.insertImage(sendList);
      handleBack();
    } catch (error) {
      console.error(error);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

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
        dir_e: insertForm.dir_e.value,
        img_idx: sendList.length,
        file: insertForm.file.files[0],
      },
    ]);
    setPreview((prev) => [
      ...prev,
      URL.createObjectURL(insertForm.file.files[0]),
    ]);
  };

  return (
    <div>
      <form name="article">
        <div>
          <TextFieldMui
            name="ir_content"
            label="content"
            onChange={handleChange}
          />
          <Button onClick={handleOpen} variant="contained">
            제출
          </Button>
          <DialogMui
            open={open}
            onClose={handleClose}
            title="제출 확인"
            text="정말 제출하시겠습니까?"
            buttons={[
              {
                title: "취소",
                color: "inherit",
                onClick: handleClose,
              },
              {
                title: "제출",
                variant: "contained",
                onClick: (e) => {
                  console.log("제출");
                  handleSubmit(e);
                  handleClose();
                },
              },
            ]}
          />
        </div>
      </form>
      <p>이미지 업로드</p>
      <form name="imageInsertTestForm">
        <input
          type="hidden"
          value="I_REVIEW"
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
          value={invoice.c_id}
          name="dir_a"
          placeholder="DIR_A"
        />
        <input
          type="hidden"
          value={invoice.c_kind}
          name="dir_b"
          placeholder="DIR_B"
        />
        <input
          type="hidden"
          value={invoice.c_name}
          name="dir_c"
          placeholder="DIR_C"
        />
        <input
          type="hidden"
          value={invoice.id}
          name="dir_d"
          placeholder="DIR_D"
        />
        <input
          type="hidden"
          value={invoice.b_createdDate}
          name="dir_e"
          placeholder="DIR_E"
        />
        <input type="hidden" name="img_idx" value="1" placeholder="IMG_IDX" />
        <input type="file" name="file" />
        <br />
        <FloatingActionButtonMui
          icon={<AddIcon />}
          color="primary"
          onClick={() => onClickAdd()}
        />
      </form>
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

export default InteriorReview;

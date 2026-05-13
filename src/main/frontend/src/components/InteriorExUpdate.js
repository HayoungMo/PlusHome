import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import TextFieldMui from "./TextFieldMui";
import { Button } from "@mui/material";
import GetImgDir from "../resources/function/GetImgDir";
import ImageService from "../service/imageService";
import DialogMui from "./DialogMui";
import AlertMui from "./AlertMui";

const InteriorExUpdate = ({ company }) => {
  const [sendList, setSendList] = useState([]);
  const [example, setExample] = useState([]);

  const [open, setOpen] = useState(false);

  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [open1, setOpen1] = useState(false);

  const handleOpen1 = () => {
    setOpen1(true);
  };

  const handleClose1 = () => {
    setOpen1(false);
  };

  const [reload, setReload] = useState(0);

  const refresh = () => {
    setReload((prev) => prev + 1);
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;

    const newExample = [...example];
    newExample[index] = {
      ...newExample[index],
      [name === "tag" ? "ie_tag" : name === "tag2" ? "ie_tag2" : "ie_content"]:
        value,
    };

    setExample(newExample);
  };
  const handleSubmit = async (e, item) => {
    e.preventDefault();

    const result = await InteriorService.UpdateInteriorExample({
      c_id: company.c_id,
      c_kind: company.c_kind,
      c_name: company.c_name,
      tag: item.ie_tag,
      tag2: item.ie_tag2,
      content: item.ie_content,
    });
    if (result.success) {
      setAlert({
        open: true,
        severity: "success",
        title: "등록 성공",
        text: "등록되었습니다.",
      });
    } else {
      setAlert({
        open: true,
        severity: "error",
        title: `에러 (${result.status})`,
        text: result.message || "오류가 발생했습니다.",
      });
    }

    refresh();
  };

  const handleDelete = async (e, item) => {
    e.preventDefault();

    await InteriorService.DeleteInteriorExample({
      c_id: company.c_id,
      c_kind: company.c_kind,
      c_name: company.c_name,
      tag: item.ie_tag,
      tag2: item.ie_tag2,
    });

    item?.logo?.result
      .filter((record) => record.dir_d === item.ie_tag + "_" + item.ie_tag2)
      .map((record, i) => imageDelete([record.img_originalName]));
    refresh();
  };

  const imageUpload = async (e) => {
    const updateList = document.getElementsByClassName("updateFile");
    if (updateList.length === 0) {
      alert("Idiot");
      return;
    }
    let fileList = [];
    for (const element of updateList) {
      if (element.files.length !== 0) {
        fileList.push({ file: element.files[0], name: element.name });
      }
    }

    if (fileList.length === 0) {
      alert("dumb");
      return;
    }
    // await ImageService.updateImage(fileList, updateTest);
    await ImageService.updateImage(fileList);
  };

  const imageDelete = async (item) => {
    await ImageService.deleteImage(item);
  };

  const onClickAdd = () => {
    const insertForm2 = document.getElementsByName(
      "imageInteriorExampleInsertTestForm",
    )[0];
    setSendList([
      ...sendList,
      {
        img_kind: insertForm2.img_kind.value,
        img_tag: insertForm2.img_tag.value,
        dir_a: insertForm2.dir_a.value,
        dir_b: insertForm2.dir_b.value,
        dir_c: insertForm2.dir_c.value,
        dir_d: insertForm2.dir_d.value,
        // dir_e: insertForm.dir_e.value,
        img_idx: insertForm2.img_idx.value,
        file: insertForm2.file.files[0],
      },
    ]);
  };

  const onClickInsert = () => {
    if (!sendList || sendList.length === 0) {
      console.log("보낼 이미지 없음");
      return; // 🚫 요청 안 보냄
    }
    console.log(sendList);
    ImageService.insertImage(sendList);
  };

  useEffect(() => {
    const fetchExample = async () => {
      const data = await InteriorService.fetchExample(company);
      const companyList = Array.isArray(data) ? data : [];
      const listWithImages = await Promise.all(
        companyList.map(async (item) => {
          const logo = await GetImgDir({
            kind: "I_EXAMPLE",
            returnType: "list",
            a: item.c_id,
            b: item.c_kind,
            c: item.c_name,
            d: item.ie_tag + "_" + item.ie_tag2,
            view: false,
          });
          if (!logo?.result?.length) {
            return item;
          }
          return {
            ...item,
            logo,
          };
        }),
      );

      setExample(listWithImages);
    };
    fetchExample();
  }, [reload]);

  return (
    <div>
      {alert.open && (
        <AlertMui
          severity={alert.severity}
          title={alert.title}
          text={alert.text}
          autoHideDuration={3000}
          onClose={() =>
            setAlert((prev) => ({
              ...prev,
              open: false,
            }))
          }
        />
      )}
      <p>인테리어 시공 사례 수정 예시</p>
      {example.map((item, index) => (
        <div>
          {item?.logo?.result
            .filter(
              (record) => record.dir_d === item.ie_tag + "_" + item.ie_tag2,
            )
            .map((record, i) => (
              <div>
                <img src={record.img_name} alt={`${item.c_name} 예시`} />
                <form>
                  <input
                    type="file"
                    name={record.img_originalName}
                    className="updateFile"
                  />
                  <Button onClick={(e) => imageUpload(record, e)}>적용</Button>
                </form>
                <Button onClick={() => imageDelete([record.img_originalName])}>
                  삭제
                </Button>
              </div>
            ))}
          <p>시공사례 이미지 추가 업로드</p>
          <form name="imageInteriorExampleInsertTestForm">
            <input
              type="hidden"
              value="I_EXAMPLE"
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
              value={item.c_id}
              name="dir_a"
              placeholder="DIR_A"
            />
            <input
              type="hidden"
              value={item.c_kind}
              name="dir_b"
              placeholder="DIR_B"
            />
            <input
              type="hidden"
              value={item.c_name}
              name="dir_c"
              placeholder="DIR_C"
            />
            <input
              type="hidden"
              value={item.ie_tag + "_" + item.ie_tag2}
              name="dir_d"
              placeholder="DIR_D"
            />
            {/* <input type="hidden" value="imgTest" name="dir_b" placeholder="DIR_B" /> */}
            <input
              type="hidden"
              name="img_idx"
              value="1"
              placeholder="IMG_IDX"
            />
            <input type="file" name="file" />
            <br />
            <Button onClick={onClickAdd}>추가</Button>
            <Button onClick={onClickInsert}>제출</Button>
          </form>
          <form name="example">
            <div>
              <TextFieldMui name="tag" value={item.ie_tag} />
              <TextFieldMui name="tag2" value={item.ie_tag2} />
              <TextFieldMui
                name="content"
                value={item.ie_content}
                onChange={(e) => handleChange(index, e)}
              />
              <Button onClick={() => handleOpen()} variant="contained">
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
                      console.log("제출 실행");
                      handleSubmit(e, item);
                      handleClose();
                    },
                  },
                ]}
              />
              <Button
                onClick={(e) => {
                  handleOpen1();
                }}
                variant="contained"
              >
                삭제
              </Button>
              <DialogMui
                open={open1}
                onClose={handleClose1}
                title="삭제 확인"
                text="정말 삭제하시겠습니까?"
                buttons={[
                  {
                    title: "취소",
                    color: "inherit",
                    onClick: handleClose1,
                  },
                  {
                    title: "삭제",
                    color: "error",
                    variant: "contained",
                    onClick: (e) => {
                      console.log("삭제 실행");
                      handleDelete(e, item);
                      handleClose1();
                    },
                  },
                ]}
              />
            </div>
          </form>
        </div>
      ))}
    </div>
  );
};

export default InteriorExUpdate;

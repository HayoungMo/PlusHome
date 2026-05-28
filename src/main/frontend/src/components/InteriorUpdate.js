import React, { useEffect, useMemo, useState } from "react";
import InteriorService from "../service/interiorService";
import TextFieldMui from "./TextFieldMui";
import { Button } from "@mui/material";
import SelectMui from "./SelectMui";
import DialogMui from "./DialogMui";
import AlertMui from "./AlertMui";
import { regionData } from "../resources/function/RegionData";
import {
  formatInteriorAnswerLabel,
  formatInteriorAnswerValue,
} from "../resources/function/interiorAnswerFormat";

const InteriorUpdate = (props) => {
  const { interiorInfo, setOpenUpdateDialog, onSuccess } = props;

  const initInterior = {
    c_id: "",
    c_kind: "",
    c_name: "",
    i_tag: "",
    i_text: "",
  };

  const [interior, setInterior] = useState(initInterior);

  const { c_id, c_kind, c_name, i_tag, i_text, textRegion, textRegionDetail } =
    interior;

  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const handleUpdateConfirm = () => {
    setUpdateOpen((prev) => !prev);
  };

  const handleCloseConfirm = () => {
    setDeleteOpen((prev) => !prev);
  };

  const sidoOption = useMemo(() => {
    return Object.keys(regionData).map((item) => ({
      value: item,
      title: item,
    }));
  }, []);

  const sigunguOption = useMemo(() => {
    if (!interior.textRegion) return [];

    return regionData[interior.textRegion].map((item) => ({
      value: item,
      title: item,
    }));
  }, [interior.textRegion]);

  const toOptions = (values) =>
    values.map((value) => ({
      value,
      title: formatInteriorAnswerValue(value),
    }));

  const questionOptions = {
    housingType: toOptions(["apt", "villa", "house", "officetel"]),
    areaSize: toOptions(["10_20", "30", "40", "50"]),
    spaces: toOptions([
      "kitchen",
      "bath",
      "storage",
      "door",
      "window",
      "wallpaper",
      "lighting",
      "tile",
      "floor",
    ]),
    budget: toOptions(["1000", "2000", "3000", "5000", "10000"]),
    schedule: toOptions(["1m", "3m", "6m", "flex"]),
  };

  const questions = [
    {
      value: "housingType",
      title: formatInteriorAnswerLabel("housingType"),
      options: questionOptions.housingType,
    },
    {
      value: "areaSize",
      title: formatInteriorAnswerLabel("areaSize"),
      options: questionOptions.areaSize,
    },
    {
      value: "spaces",
      title: formatInteriorAnswerLabel("spaces"),
      options: questionOptions.spaces,
    },
    {
      value: "budget",
      title: formatInteriorAnswerLabel("budget"),
      options: questionOptions.budget,
    },
    {
      value: "schedule",
      title: formatInteriorAnswerLabel("schedule"),
      options: questionOptions.schedule,
    },
    {
      value: "location",
      title: formatInteriorAnswerLabel("location"),
    },
  ];

  const selectedQuestion = questions.find((q) => q.value === i_tag);

  const showAlert = (severity, title, text) => {
    setAlert({
      open: true,
      severity,
      title,
      text,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setInterior((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const sendForm =
      i_tag === "location"
        ? {
            ...interior,
            i_text: [interior.textRegion, interior.textRegionDetail]
              .filter(Boolean)
              .join(" "),
            i_text_before: interiorInfo.i_text,
          }
        : { ...interior, i_text_before: interiorInfo.i_text };

    if (!sendForm.i_text) {
      showAlert("warning", "선택 필요", "수정할 값을 선택해주세요.");
      return;
    }

    const result = await InteriorService.UpdateInterior({
      c_id: sendForm.c_id,
      c_kind: sendForm.c_kind,
      c_name: sendForm.c_name,
      tag: sendForm.i_tag,
      text: sendForm.i_text,
      i_text_before: sendForm.i_text_before,
    });

    if (result.success) {
      onSuccess();
      showAlert("success", "수정 성공", "수정되었습니다.");
    } else {
      showAlert(
        "error",
        `에러 (${result.status || ""})`,
        result.message || "오류가 발생했습니다.",
      );
    }
  };

  const handleDelete = async () => {
    await InteriorService.DeleteInterior({
      c_id,
      c_kind,
      c_name,
      tag: i_tag,
      text: i_text,
    });
    onSuccess();
  };

  useEffect(() => {
    setInterior(interiorInfo);
  }, [interiorInfo]);

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
      <div>
        <TextFieldMui
          name="i_tag"
          value={formatInteriorAnswerLabel(i_tag)}
        />
        {i_tag !== "location" ? (
          <SelectMui
            label="항목 선택"
            name="i_text"
            value={i_text}
            onChange={handleChange}
            option={selectedQuestion?.options || []}
            required
          />
        ) : (
          <>
            <SelectMui
              label="시/도"
              name="textRegion"
              value={textRegion}
              onChange={handleChange}
              option={sidoOption}
            />

            <SelectMui
              label="시/군/구"
              name="textRegionDetail"
              value={textRegionDetail}
              onChange={handleChange}
              option={sigunguOption}
              disabled={!textRegion}
            />
          </>
        )}
        <Button onClick={handleUpdateConfirm} variant="contained">
          제출
        </Button>
        <DialogMui
          open={updateOpen}
          onClose={handleUpdateConfirm}
          title="제출 확인"
          text="정말 제출하시겠습니까?"
          buttons={[
            {
              title: "취소",
              color: "inherit",
              onClick: handleUpdateConfirm,
            },
            {
              title: "제출",
              variant: "contained",
              onClick: () => {
                handleSubmit();
                handleUpdateConfirm();
              },
            },
          ]}
        />
        <Button onClick={handleCloseConfirm} variant="contained">
          삭제
        </Button>
        <DialogMui
          open={deleteOpen}
          onClose={handleCloseConfirm}
          title="삭제 확인"
          text="정말 삭제하시겠습니까?"
          buttons={[
            {
              title: "취소",
              color: "inherit",
              onClick: handleCloseConfirm,
            },
            {
              title: "삭제",
              color: "error",
              variant: "contained",
              onClick: () => {
                handleDelete();
                handleCloseConfirm();
              },
            },
          ]}
        />
        <Button
          onClick={() => setOpenUpdateDialog(false)}
          color="error"
          variant="contained"
        >
          수정 취소
        </Button>
      </div>
    </div>
  );
};

export default InteriorUpdate;

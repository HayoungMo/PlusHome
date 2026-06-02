import React, { useMemo, useState } from "react";
import { Button } from "@mui/material";
import InteriorService from "../service/interiorService";
import SelectMui from "./SelectMui";
import AlertMui from "./AlertMui";
import { regionData } from "../resources/function/RegionData";
import CheckboxMui from "./CheckboxMui";
import {
  formatInteriorAnswerLabel,
  formatInteriorAnswerValue,
} from "../resources/function/interiorAnswerFormat";
import "../css/InteriorForm.css";

const InteriorAdd = ({ company, setOpenAddDialog, onSuccess }) => {
  const [sendList, setSendList] = useState([]);
  const [form, setForm] = useState({
    c_id: company.c_id,
    c_kind: company.c_kind,
    c_name: company.c_name,
    tag: "",
    text: "",
  });
  const [selectedSpaces, setSelectedSpaces] = useState([]);

  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const sidoOption = useMemo(() => {
    return Object.keys(regionData).map((item) => ({
      value: item,
      title: item,
    }));
  }, []);

  const sigunguOption = useMemo(() => {
    if (!form.textRegion) return [];

    return regionData[form.textRegion].map((item) => ({
      value: item,
      title: item,
    }));
  }, [form.textRegion]);

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
      multi: true,
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

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "tag"
        ? {
            text: "",
            textRegion: "",
            textRegionDetail: "",
          }
        : {}),
    }));

    if (name === "tag") {
      setSelectedSpaces([]);
    }
  };

  const selectedQuestion = questions.find((q) => q.value === form.tag);
  const spaceOptions = questionOptions.spaces;
  const allSpacesSelected = selectedSpaces.length === spaceOptions.length;

  const handleSpaceChange = (value, checked) => {
    setSelectedSpaces((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value),
    );
  };

  const handleAllSpacesChange = (checked) => {
    setSelectedSpaces(checked ? spaceOptions.map((option) => option.value) : []);
  };

  const getExistingInterior = async () => {
    const existingInterior = await InteriorService.fetchArticle({
      c_id: form.c_id,
      c_kind: form.c_kind,
      c_name: form.c_name,
    });

    return Array.isArray(existingInterior) ? existingInterior : [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const existingList = await getExistingInterior();

    if (form.tag === "spaces") {
      if (selectedSpaces.length === 0) {
        showAlert("warning", "선택 필요", "공간을 하나 이상 선택해주세요.");
        return;
      }

      const existingSpaces = new Set(
        existingList
          .filter((item) => item.i_tag === "spaces")
          .map((item) => item.i_text),
      );

      const spacesToAdd = selectedSpaces.filter(
        (space) => !existingSpaces.has(space),
      );

      if (spacesToAdd.length === 0) {
        showAlert(
          "info",
          "추가할 공간 없음",
          "선택한 공간이 모두 이미 등록되어 있습니다.",
        );
        return;
      }

      const results = await Promise.all(
        spacesToAdd.map((space) =>
          InteriorService.AddInterior({
            ...form,
            text: space,
          }),
        ),
      );

      if (results.every((result) => result.success)) {
        onSuccess();
        showAlert(
          "success",
          "등록 성공",
          spacesToAdd.length === selectedSpaces.length
            ? "인테리어 공간 정보가 등록되었습니다."
            : "이미 등록된 공간을 제외하고 새 공간만 등록했습니다.",
        );
      } else {
        showAlert(
          "error",
          "등록 실패",
          "공간 정보 등록 중 오류가 발생했습니다.",
        );
      }

      setSendList([]);
      return;
    }

    const sendForm =
      form.tag === "location"
        ? {
            ...form,
            text: [form.textRegion, form.textRegionDetail]
              .filter(Boolean)
              .join(" "),
          }
        : form;

    if (!sendForm.tag || !sendForm.text) {
      showAlert("warning", "선택 필요", "항목과 값을 선택해주세요.");
      return;
    }

    const alreadyExists = existingList.some(
      (item) => item.i_tag === sendForm.tag && item.i_text === sendForm.text,
    );

    if (alreadyExists) {
      showAlert("info", "추가할 정보 없음", "선택한 정보가 이미 등록되어 있습니다.");
      return;
    }

    const result = await InteriorService.AddInterior(sendForm);
    if (result.success) {
      onSuccess();
      showAlert("success", "등록 성공", "인테리어 상세 정보가 등록되었습니다.");
    } else {
      showAlert(
        "error",
        `에러 (${result.status || ""})`,
        result.message || "오류가 발생했습니다.",
      );
    }
    setSendList([]);
  };

  return (
    <div className="interior-add-card">
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
      <div className="interior-add-head">
        <strong>인테리어 업체 정보 추가</strong>
        <span>업체 상세에 노출할 조건과 값을 선택해주세요.</span>
      </div>
      <form className="interior-add-form" name="article" onSubmit={handleSubmit}>
        <div className="interior-add-fields">
          <SelectMui
            name="tag"
            value={form.tag}
            onChange={handleChange}
            option={questions}
            required
          />
          {form.tag !== "location" ? (
            <>
              {selectedQuestion?.multi ? (
                <div className="interior-add-space-options">
                  <CheckboxMui
                    name="spaces-all"
                    label="전체 선택"
                    checked={allSpacesSelected}
                    onChange={(e) => handleAllSpacesChange(e.target.checked)}
                  />

                  {spaceOptions.map((option) => (
                    <CheckboxMui
                      key={option.value}
                      name={`spaces-${option.value}`}
                      label={option.title}
                      checked={selectedSpaces.includes(option.value)}
                      onChange={(e) =>
                        handleSpaceChange(option.value, e.target.checked)
                      }
                    />
                  ))}
                </div>
              ) : (
                <SelectMui
                  label="항목 선택"
                  name="text"
                  value={form.text}
                  onChange={handleChange}
                  option={selectedQuestion?.options || []}
                />
              )}
            </>
          ) : (
            <>
              <SelectMui
                label="시/도"
                name="textRegion"
                value={form.textRegion}
                onChange={handleChange}
                option={sidoOption}
              />

              <SelectMui
                label="시/군/구"
                name="textRegionDetail"
                value={form.textRegionDetail}
                onChange={handleChange}
                option={sigunguOption}
                disabled={!form.textRegion}
              />
            </>
          )}
          <div className="interior-add-actions">
            <Button
              onClick={() => setOpenAddDialog(false)}
              color="inherit"
              variant="outlined"
            >
              취소
            </Button>
            <Button type="submit" variant="contained">
              제출
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InteriorAdd;

import React, { useMemo, useState } from "react";
import TextFieldMui from "./TextFieldMui";
import { Button } from "@mui/material";
import ImageService from "../service/imageService";
import InteriorService from "../service/interiorService";
import SelectMui from "./SelectMui";
import AlertMui from "./AlertMui";
import FloatingActionButtonMui from "./FloatingActionButtonMui";
import AddIcon from "@mui/icons-material/Add";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import {regionData} from "../resources/function/RegionData";
import CheckboxMui from "./CheckboxMui";

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

  const [region, setRegion] = useState({
    sido: "",
    sigungu: "",
  });

  // 시/도 option
  const sidoOption = useMemo(() => {
    return Object.keys(regionData).map((item) => ({
      value: item,
      title: item,
    }));
  }, []);

  // 시/군/구 option
  const sigunguOption = useMemo(() => {
    if (!form.textRegion) return [];

    return regionData[form.textRegion].map((item) => ({
      value: item,
      title: item,
    }));
  }, [form.textRegion]);

  const questionOptions = {
    q1: [
      { value: "apt", title: "아파트" },
      { value: "villa", title: "빌라" },
      { value: "house", title: "단독주택" },
      { value: "officetel", title: "오피스텔" },
    ],
    q2: [
      { value: "10_20", title: "10~20평" },
      { value: "30", title: "30평대" },
      { value: "40", title: "40평대" },
      { value: "50", title: "50평 이상" },
    ],
    q3: [
      { value: "kitchen", title: "키친" },
      { value: "bath", title: "바스" },
      { value: "storage", title: "수납" },
      { value: "door", title: "중문/문" },
      { value: "window", title: "창문" },
      { value: "wallpaper", title: "벽지" },
      { value: "lighting", title: "조명" },
      { value: "tile", title: "타일" },
      { value: "floor", title: "마루" },
    ],
  };

  const questions = [
    {
      value: "housingType",
      title: "주택 종류",
      options: questionOptions.q1,
    },
    {
      value: "areaSize",
      title: "평수",
      options: questionOptions.q2,
    },
    {
      value: "spaces",
      title: "필요한 공간",
      options: questionOptions.q3,
      multi: true,
    },
    {
      value: "location",
      title: "출장 장소",
    },
  ];

  const [preview, setPreview] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
	
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "tag" ? { text: "" } : {}),
    }));

    if (name === "tag") {
      setSelectedSpaces([]);
    }
  };
  const selectedQuestion = questions.find((q) => q.value === form.tag);
  const spaceOptions = questionOptions.q3;
  const allSpacesSelected = selectedSpaces.length === spaceOptions.length;

  const handleSpaceChange = (value, checked) => {
    setSelectedSpaces((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value),
    );
  };

  const handleAllSpacesChange = (checked) => {
    setSelectedSpaces(checked ? spaceOptions.map((option) => option.value) : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 페이지 새로고침 막기
    if (form.tag === "spaces") {
      if (selectedSpaces.length === 0) {
        setAlert({
          open: true,
          severity: "warning",
          title: "선택 필요",
          text: "공간을 하나 이상 선택해 주세요.",
        });
        return;
      }

      const existingInterior = await InteriorService.fetchArticle({
        c_id: form.c_id,
        c_kind: form.c_kind,
        c_name: form.c_name,
      });

      const existingSpaces = new Set(
        (Array.isArray(existingInterior) ? existingInterior : [])
          .filter((item) => item.i_tag === "spaces")
          .map((item) => item.i_text),
      );

      const spacesToAdd = selectedSpaces.filter(
        (space) => !existingSpaces.has(space),
      );

      if (spacesToAdd.length === 0) {
        setAlert({
          open: true,
          severity: "info",
          title: "추가할 공간 없음",
          text: "선택한 공간이 모두 이미 등록되어 있습니다.",
        });
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
        setAlert({
          open: true,
          severity: "success",
          title: "등록 성공",
          text:
            spacesToAdd.length === selectedSpaces.length
              ? "인테리어 공간 정보가 등록되었습니다."
              : "이미 등록된 공간을 제외하고 새 공간만 등록했습니다.",
        });
      } else {
        setAlert({
          open: true,
          severity: "error",
          title: "등록 실패",
          text: "공간 정보 등록 중 오류가 발생했습니다.",
        });
      }

      setSendList([]);
      return;
    }

    const sendForm =
      form.tag === "location"
        ? {
            ...form,
            text: `${form.textRegion} ${form.textRegionDetail}`,
          }
        : form;

    const result = await InteriorService.AddInterior(sendForm);
    if (result.success) {
      onSuccess();
      setAlert({
        open: true,
        severity: "success",
        title: "등록 성공",
        text: "인테리어 상세 정보가 등록되었습니다.",
      });
    } else {
      setAlert({
        open: true,
        severity: "error",
        title: `에러 (${result.status})`,
        text: result.message || "오류가 발생했습니다.",
      });
    }
    setSendList([]);
  };

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
      <p>인테리어 업체 추가</p>
      <form name="article" onSubmit={handleSubmit}>
        <div>
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
                <div>
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
                  label="세부 선택"
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
          <Button
            onClick={() => setOpenAddDialog(false)}
            color="error"
            variant="contained"
          >
            취소
          </Button>
          <Button type="submit" variant="contained">
            제출
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InteriorAdd;

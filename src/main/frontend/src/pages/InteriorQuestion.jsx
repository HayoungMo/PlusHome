import React, { useState } from "react";
import SelectMui from "../components/SelectMui";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
const InteriorQuestion = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    housingType: "", // q1 - 주택 유형
    areaSize: "", // q2 - 평수
    houseCondition: "", // q3 - 집 상태
    purpose: "", // q4 - 인테리어 목적
    spaces: [], // q5 - 공사 범위 (복수)
    budget: "", // q6 - 예산
    schedule: "", // q7 - 시작 일정
  });

  const questionOptions = {
    // q1: 주택 종류
    q1: [
      { value: "apt", title: "아파트" },
      { value: "villa", title: "빌라" },
      { value: "house", title: "단독주택" },
      { value: "officetel", title: "오피스텔" },
    ],

    // q2: 평수
    q2: [
      { value: "10_20", title: "10~20평" },
      { value: "30", title: "30평대" },
      { value: "40", title: "40평대" },
      { value: "50", title: "50평 이상" },
    ],

    // q3: 집 상태
    q3: [
      { value: "new_empty", title: "신축 (공실)" },
      { value: "living", title: "거주 중" },
      { value: "temporary_empty", title: "시공 기간만 공실" },
    ],

    // q4: 인테리어 이유
    q4: [
      { value: "purchase", title: "집 구매 후" },
      { value: "existing", title: "기존 집 리모델링" },
      { value: "new_house", title: "새 집 입주" },
    ],

    // q5: 필요한 공간 (👉 복수 선택 고려 추천)
    q5: [
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

    // q6: 예산
    q6: [
      { value: "1000", title: "1000만원 이하" },
      { value: "2000", title: "1000~2000만원" },
      { value: "3000", title: "2000~3000만원" },
      { value: "5000", title: "3000~5000만원" },
      { value: "10000", title: "5000만원 이상" },
    ],

    // q7: 시작일
    q7: [
      { value: "1m", title: "1개월 이내" },
      { value: "3m", title: "3개월 이내" },
      { value: "6m", title: "6개월 이내" },
      { value: "flex", title: "일정 협의 가능" },
    ],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };


const handleCheckChange = (e) => {
  const { value, checked } = e.target;

  setData((prev) => ({
    ...prev,
    spaces: checked
      ? [...prev.spaces, value]
      : prev.spaces.filter((item) => item !== value),
  }));
};

  const handleNext = () => {
    navigate("/interior/list", {
      state: { answers: data },
    });
  };

  return (
    <div>
      <div>
        주택 종류
        <SelectMui
          label="주택 유형"
          name="housingType"
          value={data.housingType}
          onChange={handleChange}
          option={questionOptions.q1}
          width="100%"
        />
      </div>

      <div>
        평수
        <SelectMui
          label="평수"
          name="areaSize"
          value={data.areaSize}
          onChange={handleChange}
          option={questionOptions.q2}
          width="100%"
        />
      </div>

      <div>
        집 상태
        <SelectMui
          label="집 상태"
          name="houseCondition"
          value={data.houseCondition}
          onChange={handleChange}
          option={questionOptions.q3}
          width="100%"
        />
      </div>

      <div>
        인테리어 이유
        <SelectMui
          label="인테리어 이유"
          name="purpose"
          value={data.purpose}
          onChange={handleChange}
          option={questionOptions.q4}
          width="100%"
        />
      </div>

      <div>
        필요한 공간
        {questionOptions.q5.map((option) => (
          <label key={option.value} style={{ marginRight: "12px" }}>
            <input
              type="checkbox"
              value={option.value}
              checked={data.spaces.includes(option.value)}
              onChange={handleCheckChange}
            />
            {option.title}
          </label>
        ))}
      </div>

      <div>
        예산
        <SelectMui
          label="예산"
          name="budget"
          value={data.budget}
          onChange={handleChange}
          option={questionOptions.q6}
          width="100%"
        />
      </div>

      <div>
        희망 시작일
        <SelectMui
          label="희망 시작일"
          name="schedule"
          value={data.schedule}
          onChange={handleChange}
          option={questionOptions.q7}
          width="100%"
        />
      </div>
      <Button onClick={handleNext}>다음으로</Button>
    </div>
  );
};

export default InteriorQuestion;

export const interiorAnswerLabelMap = {
  housingType: "주거 유형",
  areaSize: "면적",
  houseCondition: "주택 상태",
  purpose: "인테리어 이유",
  spaces: "필요한 공간",
  budget: "예산",
  schedule: "희망 일정",
  location: "지역",
};

export const interiorAnswerValueMap = {
  apt: "아파트",
  villa: "빌라",
  house: "단독주택",
  officetel: "오피스텔",
  "10_20": "10~20평",
  30: "30평대",
  40: "40평대",
  50: "50평 이상",
  new_empty: "신축 공실",
  living: "거주 중",
  temporary_empty: "시공 기간만 공실",
  purchase: "집 구매 후",
  existing: "기존 집 리모델링",
  new_house: "새 집 입주",
  kitchen: "주방",
  livingroom: "거실",
  bath: "욕실",
  storage: "수납",
  door: "중문/문",
  window: "창문",
  wallpaper: "벽지",
  lighting: "조명",
  tile: "타일",
  floor: "마루",
  1000: "1000만원 이하",
  2000: "1000~2000만원",
  3000: "2000~3000만원",
  5000: "3000~5000만원",
  10000: "5000만원 이상",
  "1m": "1개월 이내",
  "3m": "3개월 이내",
  "6m": "6개월 이내",
  flex: "일정 협의 가능",
};

export const formatInteriorAnswerLabel = (key) =>
  interiorAnswerLabelMap[key] || key;

export const formatInteriorAnswerValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => interiorAnswerValueMap[item] || item).join(", ");
  }

  return interiorAnswerValueMap[value] || value;
};

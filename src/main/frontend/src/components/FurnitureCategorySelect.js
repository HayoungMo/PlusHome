import React from "react";
import SelectMui from "./SelectMui";

//카테고리 적용이 많아서 컴포넌트 파일로 빼둠

export const customCategoryValue = "custom";
export const customCategoryPrefix = "custom:";

export const furnitureCategoryFields = [
    "f_catagory1",
    "f_catagory2",
    "f_catagory3",
    "f_catagory4",
    "f_catagory5",
];

export const furnitureCategoryLabels = {
    f_catagory1: "상품종류",
    f_catagory2: "공간",
    f_catagory3: "스타일",
    f_catagory4: "소재/특징",
    f_catagory5: "대상/상황",
};

const makeOptions = (items) =>
    items.map(([value, title]) => ({ value, title }));

export const furnitureCategoryOptions = {
    f_catagory1: makeOptions([
        ["bed", "침대"],
        ["bedFrame", "침대프레임"],
        ["bunkBed", "이층침대"],
        ["mattress", "매트리스"],
        ["sofa", "소파"],
        ["sofaBed", "소파베드"],
        ["recliner", "리클라이너"],
        ["table", "식탁"],
        ["coffeeTable", "거실테이블"],
        ["sideTable", "사이드테이블"],
        ["lowTable", "좌식테이블"],
        ["desk", "책상"],
        ["computerDesk", "컴퓨터책상"],
        ["chair", "의자"],
        ["diningChair", "식탁의자"],
        ["officeChair", "사무용의자"],
        ["stool", "스툴"],
        ["bench", "벤치"],
        ["storage", "수납장"],
        ["drawer", "서랍장"],
        ["shelf", "선반"],
        ["bookcase", "책장"],
        ["cabinet", "캐비닛"],
        ["closet", "옷장"],
        ["dresser", "화장대"],
        ["tvStand", "TV장"],
        ["shoeCabinet", "신발장"],
        ["hanger", "행거"],
        ["mirror", "거울"],
        ["partition", "파티션"],
        ["rug", "러그"],
        ["curtain", "커튼"],
        ["light", "조명"],
    ]),
    f_catagory2: makeOptions([
        ["bedroom", "침실"],
        ["livingRoom", "거실"],
        ["kitchen", "주방"],
        ["study", "서재"],
        ["entrance", "현관"],
        ["kidsRoom", "아이방"],
        ["room", "방"],
        ["bathroom", "화장실"],
        [customCategoryValue, "직접 입력"],
    ]),
    f_catagory3: makeOptions([
        ["modern", "모던"],
        ["natural", "내추럴"],
        ["simple", "심플"],
        ["vintage", "빈티지"],
        ["antique", "앤틱"],
        ["nordic", "북유럽"],
        [customCategoryValue, "직접 입력"],
    ]),
    f_catagory4: makeOptions([
        ["wood", "원목"],
        ["fabric", "패브릭"],
        ["leather", "가죽"],
        ["steel", "철제"],
        ["foldable", "접이식"],
        ["storageType", "수납형"],
        ["lowType", "저상형"],
        [customCategoryValue, "직접 입력"],
    ]),
    f_catagory5: makeOptions([
        ["singleHousehold", "1인가구"],
        ["newlywed", "신혼"],
        ["family", "가족"],
        ["pet", "반려동물"],
        ["kids", "아이"],
        ["smallSpace", "소형공간"],
        [customCategoryValue, "직접 입력"],
    ]),
};

const legacyValueToCode = Object.values(furnitureCategoryOptions)
    .flat()
    .reduce((map, item) => {
        map[item.title] = item.value;
        return map;
    }, {});

const legacyCategoryAliases = {
    수납: "storage",
    테이블: "table",
    밥상: "table",
    쇼파: "sofa",
    장롱: "closet",
    붙박이장: "closet",
    화장대의자: "chair",
    티비장: "tvStand",
    TV다이: "tvStand",
    거실장: "tvStand",
    카페트: "rug",
    카펫: "rug",
    조명기구: "light",
    lighting: "light",
};

Object.assign(legacyValueToCode, legacyCategoryAliases);

export const getFurnitureCategorySelectOptions = (field) => [
    { value: "", title: `${furnitureCategoryLabels[field]} 선택` },
    ...(furnitureCategoryOptions[field] || []),
];

export const isSavedCustomCategory = (value) => {
    return String(value || "").startsWith(customCategoryPrefix);
};

export const getFurnitureCategorySaveValue = (value, customValue) => {
    if (value === customCategoryValue) {
        const text = String(customValue || "").trim();
        return text ? `${customCategoryPrefix}${text}` : "";
    }

    return value;
};

export const getFurnitureCategoryTitle = (value) => {
    const text = String(value || "");

    if (!text) return "";

    if (isSavedCustomCategory(text)) {
        return text.slice(customCategoryPrefix.length);
    }

    const option = Object.values(furnitureCategoryOptions)
        .flat()
        .find((item) => item.value === text);

    return option?.title || text;
};

export const getFurnitureCategoryCode = (value) => {
    const text = String(value || "").trim();

    return legacyValueToCode[text] || text;
};

export const getFurnitureCategoryFormState = (field, savedValue) => {
    const value = String(savedValue || "");

    if (!value) {
        return { value: "", customValue: "" };
    }

    if (isSavedCustomCategory(value)) {
        return {
            value: customCategoryValue,
            customValue: getFurnitureCategoryTitle(value),
        };
    }

    const normalizedValue = legacyValueToCode[value] || value;
    const optionValues = (furnitureCategoryOptions[field] || []).map(
        (item) => item.value
    );

    if (optionValues.includes(normalizedValue)) {
        return { value: normalizedValue, customValue: "" };
    }

    if (field === "f_catagory1") {
        return { value: "", customValue: "" };
    }

    return {
        value: customCategoryValue,
        customValue: value,
    };
};

const FurnitureCategorySelect = ({
    field,
    value,
    customValue,
    onChange,
    onCustomChange,
    width = "220px",
}) => {
    return (
        <div style={{ marginBottom: "10px" }}>
            <SelectMui
                label={furnitureCategoryLabels[field]}
                name={field}
                value={value || ""}
                option={getFurnitureCategorySelectOptions(field)}
                width={width}
                onChange={onChange}
            />

            {value === customCategoryValue && (
                <input
                    placeholder={`${furnitureCategoryLabels[field]} 직접 입력`}
                    value={customValue || ""}
                    onChange={(evt) => onCustomChange(evt.target.value)}
                    style={{
                        display: "block",
                        marginTop: "8px",
                        width,
                        height: "36px",
                        padding: "0 8px",
                    }}
                />
            )}
        </div>
    );
};

export default FurnitureCategorySelect;

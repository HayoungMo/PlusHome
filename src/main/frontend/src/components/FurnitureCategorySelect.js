import React from "react";
import SelectMui from "./SelectMui";

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
        ["sofa", "소파"],
        ["desk", "책상"],
        ["chair", "의자"],
        ["table", "식탁"],
        ["storage", "수납장"],
        ["light", "조명"],
        ["mattress", "매트리스"],
        ["dresser", "화장대"],
        ["closet", "옷장"],
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
    const text = String(value || "");

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

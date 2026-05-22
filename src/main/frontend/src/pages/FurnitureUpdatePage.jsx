import React, { useState, useEffect } from "react";
import FurnitureService from "../service/furnitureService";
import OptionsService from "../service/optionService";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getImgDirSimple } from "../resources/function/GetImgDir";
import SelectMui from "../components/SelectMui";

const FurnitureUpdatePage = ({ furniture = null, onSuccess }) => {
    const navigate = useNavigate();
    const params = useParams();

    const routeFCode = params.f_code;
    const f_code = routeFCode || furniture?.f_code;

    const [searchParams] = useSearchParams();
    const page = searchParams.get("page") || "1";
    
    //수정할때도 카테고리1~5를 select 할 수 있게. - 0522 모하영
    const categoryOptions = {
        f_catagory1: ["침대", "소파", "책상", "의자", "식탁", "수납장", "조명", "매트리스", "화장대", "옷장", "직접 입력"],
        f_catagory2: ["침실", "거실", "주방", "서재", "현관", "아이방", "방", "화장실", "직접 입력"],
        f_catagory3: ["모던", "내추럴", "심플", "빈티지", "앤틱", "북유럽", "직접 입력"],
        f_catagory4: ["원목", "패브릭", "가죽", "철제", "접이식", "수납형", "저상형", "직접 입력"],
        f_catagory5: ["1인가구", "신혼", "가족", "반려동물", "아이", "소형공간", "직접 입력"],
    };

    const categoryLabels = {
        f_catagory1: "상품종류",
        f_catagory2: "공간",
        f_catagory3: "스타일",
        f_catagory4: "소재/특징",
        f_catagory5: "대상/상황",
    };

    const categoryFields = [
        "f_catagory1",
        "f_catagory2",
        "f_catagory3",
        "f_catagory4",
        "f_catagory5",
    ];

    const makeCategorySelectOptions = (field) => [
        { value: "", title: `${categoryLabels[field]} 선택` },
        ...categoryOptions[field].map((item) => ({
            value: item,
            title: item,
        })),
    ];

    const routeCName = params.c_name;
    const c_name = routeCName || furniture?.c_name;

    const localUserData = localStorage.getItem("user");
    const userData = localUserData ? JSON.parse(localUserData) : {};
    const { id } = userData;

    const [data, setData] = useState({
        c_id: id,
        c_kind: "shop",
        c_name: c_name,
        f_name: "",
        f_price: "0",
        f_dprice: "0",
        f_catagory1: "",
        f_catagory2: "",
        f_catagory3: "",
        f_catagory4: "",
        f_catagory5: "",
        f_discount: "0",
        f_point: "0",
        f_count: "0",
        f_deliveryprice: "0"
    });

    //카테고리 - 0522 모하영
    const [customCategory, setCustomCategory] = useState({
        f_catagory1: "",
        f_catagory2: "",
        f_catagory3: "",
        f_catagory4: "",
        f_catagory5: "",
    });
    //helper 추가 - 0522 모하영
    const getCategoryValue = (field) => {
        return data[field] === "직접 입력"
            ? customCategory[field].trim()
            : data[field];
    };

    const setCategoryData = (furnitureData) => {
        const nextData = { ...furnitureData };
        const nextCustomCategory = {
            f_catagory1: "",
            f_catagory2: "",
            f_catagory3: "",
            f_catagory4: "",
            f_catagory5: "",
        };

        categoryFields.forEach((field) => {
            const value = furnitureData[field] || "";

            if (value && !categoryOptions[field].includes(value)) {
                nextData[field] = "직접 입력";
                nextCustomCategory[field] = value;
            }
        });

        setData(nextData);
        setCustomCategory(nextCustomCategory);
    };

    const [options, setOptions] = useState([]);
    const [deletedOptions, setDeletedOptions] = useState([]);

    const [thumbnail, setThumbnail] = useState(null);
    const [infoFiles, setInfoFiles] = useState([]);
    const [othersFiles, setOthersFiles] = useState([]);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    const [oldThumbnail, setOldThumbnail] = useState(null);
    const [oldInfoImages, setOldInfoImages] = useState([]);
    const [oldOthersImages, setOldOthersImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!f_code) return;

                const res = await FurnitureService.getFurnitureItem(f_code);
                setCategoryData(res);

                const optionRes = await OptionsService.getFurnitureOptions(f_code);
                setOptions(
                    (optionRes.data || []).map((option) => ({
                        ...option,
                        o_count: String(option.o_count || 0),
                        o_price: String(option.o_price || 0),
                        isNew: false,
                    }))
                );

                const imageList = res.imageList || [];

                const thumbnailImg = imageList.find(
                    (img) => img.img_tag === "THUMBNAIL"
                );

                setOldThumbnail(thumbnailImg || null);

                if (thumbnailImg) {
                    setThumbnailPreview(
                        getImgDirSimple({
                            kind: thumbnailImg.img_kind,
                            name: thumbnailImg.img_name,
                        })
                    );
                }

                setOldInfoImages(imageList.filter((img) => img.img_tag === "INFO"));
                setOldOthersImages(imageList.filter((img) => img.img_tag === "OTHERS"));
            } catch (error) {
                console.error(error);
                alert("데이터 불러오기 실패");
            }
        };

        loadData();
    }, [f_code]);

    useEffect(() => {
        const price = Number(data.f_price);
        const discount = Number(data.f_discount);

        const result =
            !isNaN(price) && !isNaN(discount)
                ? Math.floor(price - (price * discount) / 100)
                : 0;

        setData((prev) => ({
            ...prev,
            f_dprice: String(result),
        }));
    }, [data.f_price, data.f_discount]);

    const onChangeThumbnail = (evt) => {
        const file = evt.target.files[0];
        if (!file) return;

        setThumbnail(file);
        setThumbnailPreview(URL.createObjectURL(file));
    };

    const addDeletedImage = (img_name) => {
        setDeletedImages((prev) => {
            if (prev.includes(img_name)) return prev;
            return [...prev, img_name];
        });
    };

    const onChangeInfo = (evt) => {
        const files = Array.from(evt.target.files);

        oldInfoImages.forEach((img) => {
            addDeletedImage(img.img_name);
        });

        setOldInfoImages([]);

        setInfoFiles(
            files.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }))
        );
    };

    const onChangeOthers = (evt) => {
        const files = Array.from(evt.target.files);

        oldOthersImages.forEach((img) => {
            addDeletedImage(img.img_name);
        });

        setOldOthersImages([]);

        setOthersFiles(
            files.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }))
        );
    };

    const onDeleteOldInfoImage = (img) => {
        addDeletedImage(img.img_name);
        setOldInfoImages((prev) =>
            prev.filter((item) => item.img_name !== img.img_name)
        );
    };

    const onDeleteOldOthersImage = (img) => {
        addDeletedImage(img.img_name);
        setOldOthersImages((prev) =>
            prev.filter((item) => item.img_name !== img.img_name)
        );
    };

    const changeInput = (evt) => {
        const { name, value } = evt.target;

        const numberFields = ["f_price", "f_discount", "f_point","f_deliveryprice"];

        if (numberFields.includes(name)) {
            let numStr = value.replace(/[^0-9]/g, "");

            if (numStr === "") {
                setData((prev) => ({
                    ...prev,
                    [name]: "",
                }));
                return;
            }

            let num = Number(numStr);
            let updatedData = { ...data };

            if (name === "f_price") {
                if (num <= 0) num = 1;
                updatedData.f_price = String(num);
            }

            if (name === "f_discount") {
                if (num < 0) num = 0;
                if (num > 99) num = 99;
                updatedData.f_discount = String(num);
            }

            if (name === "f_point") {
                if (num < 0) num = 0;
                updatedData.f_point = String(num);
            }

            if (name === "f_deliveryprice") {
                if (num < 0) num = 0;
                updatedData.f_deliveryprice = String(num);
            }

            setData(updatedData);
            return;
        }

        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const changeOption = (index, evt) => {
        const { name, value } = evt.target;

        setOptions((prev) =>
            prev.map((option, i) => {
                if (i !== index) return option;

                if (["o_count", "o_price"].includes(name)) {
                    return {
                        ...option,
                        [name]: value.replace(/[^0-9]/g, ""),
                    };
                }

                return {
                    ...option,
                    [name]: value,
                };
            })
        );
    };

    const addOption = () => {
        setOptions((prev) => [
            ...prev,
            {
                o_select: "",
                o_text: "",
                o_count: "0",
                o_price: "0",
                o_important: "N",
                isNew: true,
            },
        ]);
    };

    const removeOption = (index) => {
        const target = options[index];

        if (target?.o_code) {
            setDeletedOptions((prev) => {
                if (prev.includes(target.o_code)) return prev;
                return [...prev, target.o_code];
            });
        }

        setOptions((prev) => prev.filter((_, i) => i !== index));
    };

    const onUpdate = async () => {
        try {
            if (!data.f_name) {
                alert("가구 이름을 입력해주세요.");
                return;
            }
            //업데이트 저장전에 검증하고 dto에 실제 값을 넣는다 -0522 모하영
            for (const field of categoryFields) {
                if (!getCategoryValue(field)) {
                    alert(`${categoryLabels[field]}을(를) 선택하거나 입력해주세요.`);
                    return;
                }
            }
            const optionList = options
                .filter(
                    (option) =>
                        option.o_select.trim() !== "" || option.o_text.trim() !== ""
                )
                .map((option) => ({
                    o_code: option.o_code,
                    f_code,
                    o_select: option.o_select.trim(),
                    o_text: option.o_text.trim(),
                    o_count: Number(option.o_count || 0),
                    o_price: Number(option.o_price || 0),
                    o_important: option.o_important,
                }));

            const totalOptionCount = optionList.reduce(
                (sum, option) => sum + Number(option.o_count || 0),
                0
            );

            const dto = {
                ...data,
                f_code,
                f_catagory1: getCategoryValue("f_catagory1"),
                f_catagory2: getCategoryValue("f_catagory2"),
                f_catagory3: getCategoryValue("f_catagory3"),
                f_catagory4: getCategoryValue("f_catagory4"),
                f_catagory5: getCategoryValue("f_catagory5"),
                f_price: Number(data.f_price),
                f_dprice: Number(data.f_dprice),
                f_discount: Number(data.f_discount),
                f_point: Number(data.f_point),
                f_count: totalOptionCount,
                f_deliveryprice: Number(data.f_deliveryprice || 0),
            };

            const sendData = {
                dto,
                thumbnail,
                infoFiles: infoFiles.map((i) => i.file),
                othersFiles: othersFiles.map((i) => i.file),
                deletedImages,
                options: optionList,
                deletedOptions,
            };

            await FurnitureService.updateFurniture(sendData);

            alert("수정 완료");

            if (onSuccess) {
                await onSuccess();
            } else {
                navigate(`/furniture/article/${f_code}?page=${page}`);
            }
        } catch (error) {
            console.error(error);
            alert("수정 실패");
        }
    };

    const onBack = () => {
        navigate("/furniture/list");
    };

    return (
        <div>
            <button onClick={onBack}>가구 리스트</button>

            <h3>가구 수정 페이지</h3>

            <label>가구 이름:</label>
            <input name="f_name" value={data.f_name} onChange={changeInput} />
            <br />

            <label>가구 가격:</label>
            <input name="f_price" value={data.f_price} onChange={changeInput} />
            <br />

            <p>할인가: {data.f_dprice}</p>

            <label>할인율:</label>
            <input name="f_discount" value={data.f_discount} onChange={changeInput} />
            <br />

            <p>기존 대표 이미지</p>
            {oldThumbnail && !thumbnail && (
                <img
                    src={getImgDirSimple({
                        kind: oldThumbnail.img_kind,
                        name: oldThumbnail.img_name,
                    })}
                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                    alt=""
                />
            )}

            <p>대표 이미지 교체</p>
            <input type="file" accept="image/*" onChange={onChangeThumbnail} />

            {thumbnail && thumbnailPreview && (
                <img
                    src={thumbnailPreview}
                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                    alt=""
                />
            )}

            <p>기존 상세 이미지</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                {oldInfoImages.map((img) => (
                    <div key={img.img_name}>
                        <img
                            src={getImgDirSimple({
                                kind: img.img_kind,
                                name: img.img_name,
                            })}
                            style={{ width: "120px", height: "120px", objectFit: "cover" }}
                            alt=""
                        />
                        <button type="button" onClick={() => onDeleteOldInfoImage(img)}>
                            삭제
                        </button>
                    </div>
                ))}
            </div>

            <p>새 상세 이미지</p>
            <input type="file" multiple onChange={onChangeInfo} />

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                {infoFiles.map((item, index) => (
                    <img
                        key={index}
                        src={item.preview}
                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                        alt=""
                    />
                ))}
            </div>

            <p>기존 이미지</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                {oldOthersImages.map((img) => (
                    <div key={img.img_name}>
                        <img
                            src={getImgDirSimple({
                                kind: img.img_kind,
                                name: img.img_name,
                            })}
                            style={{ width: "120px", height: "120px", objectFit: "cover" }}
                            alt=""
                        />
                        <button type="button" onClick={() => onDeleteOldOthersImage(img)}>
                            삭제
                        </button>
                    </div>
                ))}
            </div>

            <p>새 이미지</p>
            <input type="file" multiple onChange={onChangeOthers} />

            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "10px" }}>
                {othersFiles.map((item, index) => (
                    <img
                        key={index}
                        src={item.preview}
                        style={{ width: "220px", height: "120px", objectFit: "cover" }}
                        alt=""
                    />
                ))}
            </div>

            <br />
            <br />

            <div style={{ gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            {categoryFields.map((field) => (
                <div key={field}>
                    <SelectMui
                        label={categoryLabels[field]}
                        name={field}
                        value={data[field] || ""}
                        option={makeCategorySelectOptions(field)}
                        width="180px"
                        onChange={changeInput}
                    />

                    {data[field] === "직접 입력" && (
                        <input
                            placeholder={`${categoryLabels[field]} 직접 입력`}
                            value={customCategory[field]}
                            onChange={(evt) =>
                                setCustomCategory((prev) => ({
                                    ...prev,
                                    [field]: evt.target.value,
                                }))
                            }
                            style={{
                                marginTop: "8px",
                                width: "180px",
                                height: "36px",
                                padding: "0 8px",
                            }}
                        />
                    )}
                </div>
            ))}
        </div>

            <label>포인트:</label>
            <input name="f_point" value={data.f_point} onChange={changeInput} />
            <br />

            <label>배송비:</label>
            <input
                name="f_deliveryprice"
                value={data.f_deliveryprice || "0"}
                onChange={changeInput}
            />
            <br />  

            <p>
                전체 수량:{" "}
                {options.reduce((sum, option) => sum + Number(option.o_count || 0), 0)}
            </p>

            <hr />

            <h3>옵션 수정</h3>

            {options.map((option, index) => (
                <div
                    key={option.o_code || index}
                    style={{
                        border: "1px solid #ddd",
                        padding: "10px",
                        marginBottom: "10px",
                    }}
                >
                    <label>옵션명:</label>
                    <input
                        name="o_select"
                        value={option.o_select}
                        onChange={(evt) => changeOption(index, evt)}
                        placeholder="예: 색상"
                    />
                    <br />

                    <label>옵션값:</label>
                    <input
                        name="o_text"
                        value={option.o_text}
                        onChange={(evt) => changeOption(index, evt)}
                        placeholder="예: 화이트"
                    />
                    <br />

                    <label>옵션 재고:</label>
                    <input
                        name="o_count"
                        value={option.o_count}
                        onChange={(evt) => changeOption(index, evt)}
                    />
                    <br />

                    <label>추가 금액:</label>
                    <input
                        name="o_price"
                        value={option.o_price}
                        onChange={(evt) => changeOption(index, evt)}
                    />
                    <br />

                    <label>필수 옵션:</label>
                    <select
                        name="o_important"
                        value={option.o_important}
                        onChange={(evt) => changeOption(index, evt)}
                    >
                        <option value="Y">필수</option>
                        <option value="N">선택</option>
                    </select>

                    <br />

                    <button type="button" onClick={() => removeOption(index)}>
                        옵션 삭제
                    </button>
                </div>
            ))}

            <button type="button" onClick={addOption}>
                옵션 추가
            </button>

            <br />
            <button onClick={onUpdate}>수정</button>
        </div>
    );
};

export default FurnitureUpdatePage;

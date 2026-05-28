import React, { useState, useEffect } from "react";
import FurnitureService from "../service/furnitureService";
import OptionsService from "../service/optionService";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getImgDirSimple } from "../resources/function/GetImgDir";
import FurnitureCategorySelect, {
    furnitureCategoryFields,
    furnitureCategoryLabels,
    getFurnitureCategorySaveValue,
    getFurnitureCategoryFormState,
} from "../components/FurnitureCategorySelect";
import { Button, Checkbox, FormControlLabel, Snackbar } from "@mui/material";
import AlertMui from "../components/AlertMui";
import TextFieldMui from "../components/TextFieldMui";
import SelectMui from "../components/SelectMui";

const FurnitureUpdatePage = ({ furniture = null, onSuccess }) => {
    const navigate = useNavigate();
    const params = useParams();

    const routeFCode = params.f_code;
    const f_code = routeFCode || furniture?.f_code;

    const [searchParams] = useSearchParams();
    const page = searchParams.get("page") || "1";

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
        f_deliveryPrice: "0"
    });

    //카테고리 - 0522 모하영
    const [customCategory, setCustomCategory] = useState({
        f_catagory1: "",
        f_catagory2: "",
        f_catagory3: "",
        f_catagory4: "",
        f_catagory5: "",
    });
    //helper 추가 - 0522 모하영, 수정이유: 직접입력일때 책장으로 저장하는게 아니고 custom:책장으로 저장해야해서
    const getCategoryValue = (field) => {
        return getFurnitureCategorySaveValue(data[field], customCategory[field]);
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

        furnitureCategoryFields.forEach((field) => {
            const categoryState = getFurnitureCategoryFormState(
                field,
                furnitureData[field]
            );

            nextData[field] = categoryState.value;
            nextCustomCategory[field] = categoryState.customValue;
        });

        setData(nextData);
        setCustomCategory(nextCustomCategory);
    };

    const [options, setOptions] = useState([]);
    const [useOptions, setUseOptions] = useState(false);
    const [deletedOptions, setDeletedOptions] = useState([]);

    const [thumbnail, setThumbnail] = useState(null);
    const [infoFiles, setInfoFiles] = useState([]);
    const [othersFiles, setOthersFiles] = useState([]);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    const [oldThumbnail, setOldThumbnail] = useState(null);
    const [oldInfoImages, setOldInfoImages] = useState([]);
    const [oldOthersImages, setOldOthersImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);

    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        title: "",
        text: "",
    });

    const showAlert = ({ severity = "info", title = "", text = "" }) => {
        setAlert({ open: true, severity, title, text });
    };

    const closeAlert = () => {
        setAlert((prev) => ({ ...prev, open: false }));
    };

    const formatNumber = (value) => {
        const number = Number(String(value || "").replace(/[^0-9]/g, ""));
        if (!number) return "0";
        return number.toLocaleString();
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!f_code) return;

                const res = await FurnitureService.getFurnitureItem(f_code);
                setCategoryData(res);

                const optionRes = await OptionsService.getFurnitureOptions(f_code);

                const optionList = optionRes.data || [];

                setOptions(
                    optionList.map((option) => ({
                        ...option,
                        o_count: String(option.o_count || 0),
                        o_price: String(option.o_price || 0),
                        isNew: false,
                    }))
                );

                setUseOptions(optionList.length > 0);

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
                showAlert({
                    severity: "error",
                    title: "조회 실패",
                    text: "데이터를 불러오지 못했습니다.",
                });
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

        const numberFields = ["f_price", "f_discount", "f_point", "f_count", "f_deliveryPrice"];

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

            if (name === "f_count") {
                if (num < 0) num = 0;
                updatedData.f_count = String(num);
            }

            if (name === "f_deliveryPrice") {
                if (num < 0) num = 0;
                updatedData.f_deliveryPrice = String(num);
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
                showAlert({
                    severity: "warning",
                    title: "수정 불가",
                    text: "가구 이름을 입력해주세요.",
                });
                return;
            }
            //업데이트 저장전에 검증하고 dto에 실제 값을 넣는다 -0522 모하영
            for (const field of furnitureCategoryFields) {
                if (!getCategoryValue(field)) {
                    showAlert({
                    severity: "warning",
                    title: "수정 불가",
                    text: `${furnitureCategoryLabels[field]}을(를) 선택하거나 입력해주세요.`,
                });
                return;
                }
            }
            const optionList = useOptions
    ? options
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
            }))
        : [];

    const totalOptionCount = useOptions
        ? optionList.reduce((sum, option) => sum + Number(option.o_count || 0), 0)
        : Number(data.f_count || 0);

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
                f_deliveryPrice: Number(data.f_deliveryPrice || 0),
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

            showAlert({
                severity: "success",
                title: "수정 완료",
                text: "가구 정보가 수정되었습니다.",
            });

            if (onSuccess) {
                await onSuccess();
            } else {
                navigate(`/furniture/article/${f_code}?page=${page}`);
            }
        } catch (error) {
            console.error(error);
            showAlert({
                severity: "error",
                title: "수정 실패",
                text: "가구 수정에 실패했습니다.",
            });
        }
    };

    const onBack = () => {
        navigate("/furniture/list");
    };

    return (
        <div>
            <Snackbar
                open={alert.open}
                autoHideDuration={3000}
                onClose={closeAlert}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <div>
                    <AlertMui
                        severity={alert.severity}
                        title={alert.title}
                        text={alert.text}
                        onClose={closeAlert}
                        autoHideDuration={3000}
                    />
                </div>
            </Snackbar>

            <Button variant="outlined" onClick={onBack}>
                가구 리스트
            </Button>

            <h3>가구 수정 페이지</h3>

            <TextFieldMui
                name="f_name"
                label="가구 이름"
                value={data.f_name}
                onChange={changeInput}
                width="320px"
            />

            <TextFieldMui
                name="f_price"
                label="가구 가격"
                value={formatNumber(data.f_price)}
                onChange={changeInput}
                width="220px"
            />

            <p>할인가: {formatNumber(data.f_dprice)}원</p>

            <TextFieldMui
                name="f_discount"
                label="할인율"
                value={data.f_discount}
                onChange={changeInput}
                width="160px"
            />

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

            <p>기존 미리보기 이미지</p>
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
                        <Button
                            type="button"
                            variant="outlined"
                            color="error"
                            onClick={() => onDeleteOldInfoImage(img)}
                        >
                            삭제
                        </Button>
                    </div>
                ))}
            </div>

            <p>새 미리보기 이미지</p>
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

            <p>기존 상세 이미지</p>
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
                        <Button
                            type="button"
                            variant="outlined"
                            color="error"
                            onClick={() => onDeleteOldOthersImage(img)}
                        >
                            삭제
                        </Button>
                    </div>
                ))}
            </div>

            <p>새 상세 이미지</p>
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
                {furnitureCategoryFields.map((field) => (
                    <FurnitureCategorySelect
                        key={field}
                        field={field}
                        value={data[field]}
                        customValue={customCategory[field]}
                        onChange={changeInput}
                        onCustomChange={(value) =>
                            setCustomCategory((prev) => ({
                                ...prev,
                                [field]: value,
                            }))
                        }
                        width="180px"
                    />
                ))}
            </div>

            <TextFieldMui
                name="f_point"
                label="포인트"
                value={formatNumber(data.f_point)}
                onChange={changeInput}
                width="220px"
            />

            <TextFieldMui
                name="f_deliveryPrice"
                label="배송비"
                value={formatNumber(data.f_deliveryPrice || "0")}
                onChange={changeInput}
                width="220px"
            />

            <p>
                전체 수량:{" "}
                {useOptions
                    ? options.reduce((sum, option) => sum + Number(option.o_count || 0), 0)
                    : Number(data.f_count || 0)}
            </p>

            <hr />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={useOptions}
                        onChange={(evt) => {
                            const checked = evt.target.checked;
                            setUseOptions(checked);

                            if (checked && options.length === 0) {
                                setOptions([
                                    {
                                        o_select: "",
                                        o_text: "",
                                        o_count: "0",
                                        o_price: "0",
                                        o_important: "N",
                                        isNew: true,
                                    },
                                ]);
                            }
                        }}
                    />
                }
                label="옵션 사용"
            />

            {!useOptions && (
                <TextFieldMui
                    name="f_count"
                    label="재고 수량"
                    value={formatNumber(data.f_count)}
                    onChange={changeInput}
                    width="180px"
                />
            )}

            {useOptions && (
                <>
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
                            <TextFieldMui
                                name="o_select"
                                label="옵션명"
                                value={option.o_select}
                                onChange={(evt) => changeOption(index, evt)}
                                width="180px"
                            />

                            <TextFieldMui
                                name="o_text"
                                label="옵션값"
                                value={option.o_text}
                                onChange={(evt) => changeOption(index, evt)}
                                width="180px"
                            />

                            <TextFieldMui
                                name="o_count"
                                label="옵션 재고"
                                value={formatNumber(option.o_count)}
                                onChange={(evt) => changeOption(index, evt)}
                                width="160px"
                            />

                            <TextFieldMui
                                name="o_price"
                                label="추가 금액"
                                value={formatNumber(option.o_price)}
                                onChange={(evt) => changeOption(index, evt)}
                                width="180px"
                            />

                            <SelectMui
                                name="o_important"
                                label="필수 옵션"
                                value={option.o_important}
                                onChange={(evt) => changeOption(index, evt)}
                                width="160px"
                                option={[
                                    { title: "필수", value: "Y" },
                                    { title: "선택", value: "N" },
                                ]}
                            />

                            <br />

                            <Button
                                type="button"
                                variant="outlined"
                                color="error"
                                onClick={() => removeOption(index)}
                            >
                                옵션 삭제
                            </Button>
                        </div>
                    ))}

                    <Button type="button" variant="outlined" onClick={addOption}>
                        옵션 추가
                    </Button>
                </>
            )}

            <br />

            <Button variant="contained" onClick={onUpdate}>
                수정
            </Button>
        </div>
    );
};

export default FurnitureUpdatePage;

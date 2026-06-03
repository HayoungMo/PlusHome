import React, { useState, useEffect } from "react";
import FurnitureService from "../service/furnitureService";
import { useNavigate } from "react-router-dom";
import FurnitureCategorySelect, {
    furnitureCategoryFields,
    furnitureCategoryLabels,
    getFurnitureCategorySaveValue,
} from "../components/FurnitureCategorySelect";

import { Button, Snackbar } from "@mui/material";
import AlertMui from "../components/AlertMui";
import TextFieldMui from "../components/TextFieldMui";
import SelectMui from "../components/SelectMui";
import "../css/FurnitureAdd.css";

const FurnitureAddPage = ({ company: selectedCompany, onSuccess }) => {
	const localUserData = localStorage.getItem("user");
	const userData = localUserData ? JSON.parse(localUserData) : {};

	const { id, companyList = [] } = userData;

	const company =
		(selectedCompany?.c_kind === "shop" ? selectedCompany : null) ||
		companyList?.find((item) => item.c_kind === "shop") ||
		companyList?.[0];

	const navigate = useNavigate();

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

	const [data, setData] = useState({
		c_id: company?.c_id || id || "",
		c_kind: company?.c_kind || "shop",
		c_name: company?.c_name || "",
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

	useEffect(() => {
		setData((prev) => ({
			...prev,
			c_id: company?.c_id || id || "",
			c_kind: company?.c_kind || "shop",
			c_name: company?.c_name || "",
		}));
	}, [company?.c_id, company?.c_kind, company?.c_name, id]);

	//카테고리 - 0515 모하영 
	const [customCategory, setCustomCategory] = useState({
		f_catagory1: "",
		f_catagory2: "",
		f_catagory3: "",
		f_catagory4: "",
		f_catagory5: "",
	});

	const [options, setOptions] = useState([])
	
	const [useOptions, setUseOptions] = useState(false)

	const formatNumber = (value) => {
		const number = Number(String(value || "").replace(/[^0-9]/g, ""));
		if (!number) return "0";
		return number.toLocaleString();
	};

	useEffect(() => {
		const price = Number(data.f_price);
		const discount = Number(data.f_discount);

		const result =
			!isNaN(price) && !isNaN(discount)
				? Math.floor(price - (price * discount) / 100)
				: 0;

		setData((prev) => ({
			...prev,
			f_dprice: String(result)
		}));
	}, [data.f_price, data.f_discount]);

	const [thumbnail, setThumbnail] = useState(null);
	const [infoFiles, setInfoFiles] = useState([]);
	const [othersFiles, setOthersFiles] = useState([]);
	const [thumbnailPreview, setThumbnailPreview] = useState(null);

	const onChangeThumbnail = (evt) => {
		const file = evt.target.files[0];
		if (!file) return;

		setThumbnail(file);
		setThumbnailPreview(URL.createObjectURL(file));
	};

	const onChangeInfo = (evt) => {
		const files = Array.from(evt.target.files);

		const mapped = files.map((file) => ({
			file,
			preview: URL.createObjectURL(file)
		}));

		setInfoFiles(mapped);
	};

	const onChangeOthers = (evt) => {
		const files = Array.from(evt.target.files);

		const mapped = files.map((file) => ({
			file,
			preview: URL.createObjectURL(file)
		}));

		setOthersFiles(mapped);
	};

	const changeInput = (evt) => {
		const { name, value } = evt.target;

		const numberFields = [
			"f_price",
			"f_discount",
			"f_point",
			"f_count",
			"f_deliveryPrice"
		];

		if (numberFields.includes(name)) {
			let numStr = value.replace(/[^0-9]/g, "");

			if (numStr === "") {
				setData((prev) => ({
					...prev,
					[name]: ""
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
			[name]: value
		}));
	};

	//카테고리 값 - 0515 모하영 
	const getCategoryValue = (field) => {
		return getFurnitureCategorySaveValue(data[field], customCategory[field]);
	};


	const changeOption = (index, evt) => {
		const { name, value } = evt.target;

		setOptions((prev) =>
			prev.map((option, i) => {
				if (i !== index) return option;

				if (["o_count", "o_price"].includes(name)) {
					const numStr = value.replace(/[^0-9]/g, "");

					return {
						...option,
						[name]: numStr
					};
				}

				return {
					...option,
					[name]: value
				};
			})
		);
	};

	const addOption = () => {
		setUseOptions(true)

		setOptions((prev) => [
			...prev,
			{
				o_select: "",
				o_text: "",
				o_count: "0",
				o_price: "0",
				o_important: "N"
			}
		]);
	};

	const removeOption = (index) => {
		setOptions((prev) => {
			const next = prev.filter((_, i) => i !== index);
		
			if (next.length === 0){
				setUseOptions(false)
			}

			return next
		})
	};

	const onSubmit = async () => {
		try {
			if (!data.c_name) {
				showAlert({
					severity: "error",
					title: "등록 불가",
					text: "업체명을 찾지 못했습니다. 다시 로그인해주세요.",
				});
				console.log("userData", userData);
				return;
			}

			if (!thumbnail) {
				showAlert({
					severity: "warning",
					title: "등록 불가",
					text: "썸네일 이미지를 선택해주세요.",
				});
				return;
			}

			if (!data.f_name) {
				showAlert({
					severity: "warning",
					title: "등록 불가",
					text: "가구 이름을 입력해주세요.",
				});
				return;
			}
			// 0515 모하영 

			for(const field of furnitureCategoryFields) {
				if(!getCategoryValue(field)){
					showAlert({
					severity: "warning",
					title: "등록 불가",
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
					o_select: option.o_select.trim(),
					o_text: option.o_text.trim(),
					o_count: Number(option.o_count || 0),
					o_price: Number(option.o_price || 0),
					o_important: option.o_important
				}))
			: [];

			const totalOptionCount = useOptions
			? optionList.reduce(
				(sum, option) => sum + Number(option.o_count || 0),
				0
			)
			: Number(data.f_count || 0);

			if (useOptions && optionList.length === 0) {
				showAlert({
					severity: "warning",
					title: "등록 불가",
					text: "옵션을 사용하려면 옵션을 하나 이상 입력해주세요.",
				});
				return;
			}

			if (!useOptions && Number(data.f_count || 0) <= 0) {
				showAlert({
					severity: "warning",
					title: "등록 불가",
					text: "재고 수량을 입력해주세요.",
				});
				return;
			}

			const dto = {
				...data,
				c_id: data.c_id,
				c_kind: data.c_kind,
				c_name: data.c_name,
				f_catagory1: getCategoryValue("f_catagory1"), // 0515 모하영 밑의 5개 추가
				f_catagory2: getCategoryValue("f_catagory2"),
				f_catagory3: getCategoryValue("f_catagory3"),
				f_catagory4: getCategoryValue("f_catagory4"),
				f_catagory5: getCategoryValue("f_catagory5"),
				f_price: Number(data.f_price),
				f_dprice: Number(data.f_dprice),
				f_discount: Number(data.f_discount),
				f_point: Number(data.f_point),
				f_deliveryPrice: Number(data.f_deliveryPrice || 0),
				f_count: totalOptionCount
			};

			const sendData = {
				dto,
				thumbnail,
				infoFiles: infoFiles.map((i) => i.file),
				othersFiles: othersFiles.map((i) => i.file),
				options: optionList
			};

			await FurnitureService.insertFurniture(sendData);

			showAlert({
				severity: "success",
				title: "등록 완료",
				text: "가구가 등록되었습니다.",
			});

			if (onSuccess) {
				await onSuccess();
			} else {
				navigate(-1);
			}
		} catch (error) {
			console.error("에러:", error);
			showAlert({
				severity: "error",
				title: "등록 실패",
				text: "가구 등록에 실패했습니다.",
			});
		}
	};

	return (
  <div className="furniture-add-page">
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

    <section className="furniture-add-section">
		<div className="furniture-add-section-title">
			<h3>기본 정보</h3>
		</div>

		<div className="furniture-basic-table">
			<div className="furniture-thumbnail-field">
				<label className="furniture-thumbnail-upload">
					<input type="file" accept="image/*" hidden onChange={onChangeThumbnail} />

					{thumbnailPreview ? (
					<img src={thumbnailPreview} alt="대표 이미지 미리보기" />
					) : (
					<span>이미지 업로드</span>
					)}
				</label>

				<div className="furniture-upload-caption">
					<strong>대표 이미지 추가</strong>
				</div>
				</div>

			<div className="furniture-basic-inputs">
			<div className="furniture-basic-name-row">
				<TextFieldMui
				name="f_name"
				label="가구 이름"
				value={data.f_name}
				onChange={changeInput}
				width="100%"
				/>
			</div>

			<div className="furniture-basic-price-row">
				<div className="furniture-unit-field">
				<TextFieldMui
					name="f_price"
					label="판매 가격"
					value={formatNumber(data.f_price)}
					onChange={changeInput}
					width="100%"
				/>
				<span>원</span>
				</div>

				<div className="furniture-unit-field">
				<TextFieldMui
					name="f_discount"
					label="할인율"
					value={data.f_discount}
					onChange={changeInput}
					width="100%"
				/>
				<span>%</span>
				</div>
			</div>

			<div className="furniture-discount-bar">
				<span>할인 적용가</span>
				<strong>{formatNumber(data.f_dprice)}원</strong>
			</div>

			<div className="furniture-basic-sub-row">
				<div className="furniture-unit-field">
				<TextFieldMui
					name="f_point"
					label="적립 포인트"
					value={formatNumber(data.f_point)}
					onChange={changeInput}
					width="100%"
				/>
				<span>P</span>
				</div>

				<div className="furniture-unit-field">
				<TextFieldMui
					name="f_deliveryPrice"
					label="배송비"
					value={formatNumber(data.f_deliveryPrice)}
					onChange={changeInput}
					width="100%"
				/>
				<span>원</span>
				</div>

				<div className="furniture-unit-field">
					<TextFieldMui
						name="f_count"
						label={useOptions ? "재고 수량(옵션 합계)" : "재고 수량"}
						value={
						useOptions
							? formatNumber(
								options.reduce(
								(sum, option) => sum + Number(option.o_count || 0),
								0
								)
							)
							: formatNumber(data.f_count)
						}
						onChange={changeInput}
						width="100%"
						disabled={useOptions}
					/>
					<span>개</span>
					</div>
				</div>
			</div>
		</div>
		</section>

    <section className="furniture-add-section">
      <div className="furniture-add-section-title">
        <h3>카테고리 정보</h3>
      </div>

      <div className="furniture-category-grid">
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
            width="100%"
          />
        ))}
      </div>
    </section>

    <section className="furniture-add-section">
		<div className="furniture-add-section-title furniture-option-title">
			<h3>옵션 정보</h3>

			{!useOptions && (
			<Button type="button" variant="outlined" onClick={addOption}>
				+ 옵션 추가
			</Button>
			)}
		</div>

		{useOptions && (
			<div className="furniture-option-table-wrap">
			<div className="furniture-option-table">
				<div className="furniture-option-head">
				<span>옵션명</span>
				<span>옵션 설명</span>
				<span>재고 수량</span>
				<span>추가 금액</span>
				<span>필수 여부</span>
				<span>삭제</span>
				</div>

				{options.map((option, index) => (
				<div className="furniture-option-row" key={index}>
					<input
					className="furniture-option-input"
					name="o_select"
					placeholder="예: 색상"
					value={option.o_select}
					onChange={(evt) => changeOption(index, evt)}
					/>

					<input
					className="furniture-option-input"
					name="o_text"
					placeholder="예: 내추럴"
					value={option.o_text}
					onChange={(evt) => changeOption(index, evt)}
					/>

					<input
					className="furniture-option-input"
					name="o_count"
					value={formatNumber(option.o_count)}
					onChange={(evt) => changeOption(index, evt)}
					/>

					<input
					className="furniture-option-input"
					name="o_price"
					value={formatNumber(option.o_price)}
					onChange={(evt) => changeOption(index, evt)}
					/>

					<SelectMui
					name="o_important"
					label=""
					value={option.o_important}
					onChange={(evt) => changeOption(index, evt)}
					width="100%"
					option={[
						{ title: "필수", value: "Y" },
						{ title: "선택", value: "N" },
					]}
					/>

					<button
					type="button"
					className="furniture-option-remove"
					onClick={() => removeOption(index)}
					aria-label="옵션 삭제"
					>
					×
					</button>
				</div>
				))}

				<button
				type="button"
				className="furniture-option-add-row"
				onClick={addOption}
				>
				+
				</button>
			</div>
			</div>
		)}
		</section>

    <section className="furniture-add-section">
      <div className="furniture-add-section-title">
        <h3>이미지 정보</h3>
      </div>

      <div className="furniture-image-section">
        <div className="furniture-image-row">
          <div className="furniture-image-row-header">
            <h4>미리보기 이미지</h4>

            <label className="furniture-image-add-button">
              이미지 추가
              <input type="file" multiple hidden onChange={onChangeInfo} />
            </label>
          </div>

          <div className="furniture-image-strip">
            {infoFiles.map((item, index) => (
              <img key={index} src={item.preview} alt="미리보기 이미지" />
            ))}
          </div>
        </div>

        <div className="furniture-image-row">
          <div className="furniture-image-row-header">
            <h4>상세 이미지</h4>

            <label className="furniture-image-add-button">
              이미지 추가
              <input type="file" multiple hidden onChange={onChangeOthers} />
            </label>
          </div>

          <div className="furniture-image-strip">
            {othersFiles.map((item, index) => (
              <img key={index} src={item.preview} alt="상세 이미지" />
            ))}
          </div>
        </div>
      </div>
    </section>

	<section className="furniture-final-summary">
	<div className="furniture-final-summary-item">
		<span>할인 적용가</span>
		<strong>{formatNumber(data.f_dprice)}원</strong>
	</div>

	<div className="furniture-final-summary-item">
		<span>적립 포인트</span>
		<strong>{formatNumber(data.f_point)}P</strong>
	</div>

	<div className="furniture-final-summary-item">
		<span>재고 수량</span>
		<strong>
		{useOptions
			? options.reduce((sum, option) => sum + Number(option.o_count || 0), 0)
			: formatNumber(data.f_count)}
		개
		</strong>
	</div>

	<div className="furniture-final-summary-item">
		<span>배송비</span>
		<strong>{formatNumber(data.f_deliveryPrice)}원</strong>
	</div>
	</section>

    <div className="furniture-add-actions">
      <Button variant="outlined" onClick={() => navigate(-1)}>
        취소
      </Button>

      <Button variant="contained" onClick={onSubmit}>
        저장하기
      </Button>
    </div>
  </div>
);
};

export default FurnitureAddPage;

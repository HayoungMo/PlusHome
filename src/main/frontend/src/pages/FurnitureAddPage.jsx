import React, { useState, useEffect } from "react";
import FurnitureService from "../service/furnitureService";
import { useNavigate } from "react-router-dom";
import FurnitureCategorySelect, {
    furnitureCategoryFields,
    furnitureCategoryLabels,
    getFurnitureCategorySaveValue,
} from "../components/FurnitureCategorySelect";

import { Button, Checkbox, FormControlLabel, Snackbar } from "@mui/material";
import AlertMui from "../components/AlertMui";
import TextFieldMui from "../components/TextFieldMui";
import SelectMui from "../components/SelectMui";

const FurnitureAddPage = ({ onSuccess }) => {
	const localUserData = localStorage.getItem("user");
	const userData = localUserData ? JSON.parse(localUserData) : {};

	const { id, companyList } = userData;

	const company =
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

	//카테고리 - 0515 모하영 
	const [customCategory, setCustomCategory] = useState({
		f_catagory1: "",
		f_catagory2: "",
		f_catagory3: "",
		f_catagory4: "",
		f_catagory5: "",
	});

	const [options, setOptions] = useState([
		{
			o_select: "",
			o_text: "",
			o_count: "0",
			o_price: "0",
			o_important: "N"
		}
	]);
	
	const [useOptions, setUseOptions] = useState(true)

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
		setOptions((prev) => prev.filter((_, i) => i !== index));
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

			<h3>가구 등록 페이지</h3>

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

			<p>대표 이미지</p>
			<input type="file" accept="image/*" onChange={onChangeThumbnail} />

			{thumbnailPreview && (
				<img
					src={thumbnailPreview}
					style={{ width: "150px", height: "150px", objectFit: "cover" }}
					alt=""
				/>
			)}

			<p>미리보기 이미지</p>
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

			<p>상세 이미지</p>
			<input type="file" multiple onChange={onChangeOthers} />

			<div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
				{othersFiles.map((item, index) => (
					<img
						key={index}
						src={item.preview}
						style={{ width: "120px", height: "120px", objectFit: "cover" }}
						alt=""
					/>
				))}
			</div>

			<br />
			<br />

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
					width="220px"
				/>
			))}

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
				value={formatNumber(data.f_deliveryPrice)}
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
						onChange={(evt) => setUseOptions(evt.target.checked)}
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
					<h3>옵션 등록</h3>

					{options.map((option, index) => (
						<div
							key={index}
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

							{options.length > 1 && (
								<Button
									type="button"
									variant="outlined"
									color="error"
									onClick={() => removeOption(index)}
								>
									옵션 삭제
								</Button>
							)}
						</div>
					))}

					<Button type="button" variant="outlined" onClick={addOption}>
						옵션 추가
					</Button>
				</>
			)}

			<br />

			<Button variant="contained" onClick={onSubmit}>
				등록
			</Button>
		</div>
	);
};

export default FurnitureAddPage;

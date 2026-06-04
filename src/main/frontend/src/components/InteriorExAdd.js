import React, { useState } from "react";
import TextFieldMui from "./TextFieldMui";
import { Button } from "@mui/material";
import InteriorService from "../service/interiorService";
import ImageService from "../service/imageService";
import SelectMui from "./SelectMui";
import DialogMui from "./DialogMui";
import AlertMui from "./AlertMui";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const InteriorExAdd = ({ company, onReload }) => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { id } = userData;
	const { c_id = id, c_kind = "interior", c_name } = company;

	const [exampleImageList, setExampleImageList] = useState([]);
	const [imageFileList, setImageFileList] = useState([]);
	const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

	const handleOpen = () => {
		if (imageFileList.length === 0) {
			setAlert({
				open: true,
				severity: "warning",
				title: "이미지 필요",
				text: "시공 사례 이미지는 최소 1장 이상 필요합니다.",
			});
			return;
		}

		setSubmitDialogOpen(true);
	};

	const handleClose = () => {
		setSubmitDialogOpen(false);
	};

	const initExample = {
		c_id: c_id,
		c_kind: c_kind,
		c_name: c_name,
		ie_tag: "",
		ie_tag2: "",
		ie_content: "",
	};

	const [example, setExample] = useState(initExample);
	const [alert, setAlert] = useState({
		open: false,
		severity: "info",
		title: "",
		text: "",
	});

	const tagOptions1 = [
		{ value: "apt", title: "아파트" },
		{ value: "villa", title: "빌라" },
		{ value: "house", title: "단독주택" },
		{ value: "officetel", title: "오피스텔" },
	];
	const tagOptions2 = [
		{ value: "kitchen", title: "키친" },
		{ value: "bath", title: "바스" },
		{ value: "storage", title: "수납" },
		{ value: "door", title: "중문/문" },
		{ value: "window", title: "창문" },
		{ value: "wallpaper", title: "벽지" },
		{ value: "lighting", title: "조명" },
		{ value: "tile", title: "타일" },
		{ value: "floor", title: "마루" },
	];

	const onChangeHandle = (e) => {
		const { name, value } = e.target;
		setExample({ ...example, [name]: value });
	};

	const deleteInsertImage = (e, targetIndex) => {
		const filterList = exampleImageList.filter((data) => data.img_idx !== targetIndex);
		const newList = filterList.map((record, index) => {
			return { ...record, img_idx: index };
		});
		const newFileList = imageFileList.filter((_, index) => index !== targetIndex);

		setExampleImageList(newList);
		setImageFileList(newFileList);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (imageFileList.length === 0) {
			setAlert({
				open: true,
				severity: "warning",
				title: "이미지 필요",
				text: "시공 사례 이미지는 최소 1장 이상 필요합니다.",
			});
			return;
		}

		const formData = new FormData();

		const sendDataExampleDto = { ...example, c_id: c_id, c_kind: c_kind, c_name: c_name };
		debugger;
		formData.append(
			"dto",
			new Blob([JSON.stringify(sendDataExampleDto)], {
				type: "application/json",
			}),
		);

		formData.append(
			"imageDtos",
			new Blob([JSON.stringify(exampleImageList)], { type: "application/json" }),
		);

		imageFileList.forEach((file) => {
			formData.append("files", file);
		});

		const result = await InteriorService.AddInteriorExample(formData);
		const isSuccess = result.success && result.data?.success !== false;

		if (isSuccess) {
			onReload?.();
			setAlert({
				open: true,
				severity: "success",
				title: "등록 성공",
				text: result.data?.message || "시공 사례가 등록되었습니다.",
			});
			setExampleImageList([]);
			setImageFileList([]);
			setExample(initExample);
		} else {
			setAlert({
				open: true,
				severity: "error",
				title: "등록 실패",
				text: result.data?.message || "시공 사례 등록 중 오류가 발생했습니다.",
			});
		}
	};

	const onClickAddImage = () => {
		const imageForm = document.getElementsByName("exampleImageInsert")[0];
		const file = imageForm.file.files?.[0];
		if (!file) {
			return;
		}

		setExampleImageList([
			...exampleImageList,
			{
				img_kind: "I_EXAMPLE",
				img_tag:
					exampleImageList === null || exampleImageList.length === 0
						? "THUMBNAIL"
						: "OTHER",
				dir_a: c_id,
				dir_b: c_kind,
				dir_c: c_name,
				img_idx: exampleImageList.length,
				preview: URL.createObjectURL(file),
			},
		]);
		setImageFileList([...imageFileList, file]);
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
			<hr />
			<h2>인테리어 시공 사례 추가</h2>
			<form name="example" onSubmit={handleSubmit}>
				<div>
					<SelectMui
						name="ie_tag"
						value={example.ie_tag}
						onChange={onChangeHandle}
						option={tagOptions1}
						required
					/>
					<SelectMui
						name="ie_tag2"
						value={example.ie_tag2}
						onChange={onChangeHandle}
						option={tagOptions2}
						required
					/>
					{example.ie_tag && example.ie_tag2 && (
						<TextFieldMui
							name="ie_content"
							label="ie_content"
							onChange={onChangeHandle}
							multiline={true}
							minRows={5}
							maxRows={5}
							width="500px"
						/>
					)}
					{example.ie_tag && example.ie_tag2 && (
						<div>
							<Button onClick={() => handleOpen()} variant="contained">
								제출
							</Button>
							<DialogMui
								open={submitDialogOpen}
								onClose={handleClose}
								title="제출 확인"
								text="정말 제출하시겠습니까?"
								buttons={[
									{
										title: "취소",
										color: "inherit",
										onClick: handleClose,
									},
									{
										title: "제출",
										variant: "outlined",
										onClick: (e) => {
											console.log("제출 실행");
											handleSubmit(e);
											handleClose();
										},
									},
								]}
							/>
						</div>
					)}
				</div>
			</form>
			{example.ie_tag && example.ie_tag2 && (
				<form name="exampleImageInsert">
					<p>시공사례 이미지 업로드</p>
					<Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
						추가할 파일
						<input type="file" hidden name="file" onChange={() => onClickAddImage()} />
					</Button>
				</form>
			)}
			{exampleImageList &&
				exampleImageList.map((item) => (
					<div>
						<img
							src={item.preview}
							style={{ width: "150px", height: "150px", objectFit: "cover" }}
							alt=""
						/>
						<Button
							variant="outlined"
							color="error"
							onClick={(e) => deleteInsertImage(e, item.img_idx)}>
							X
						</Button>
					</div>
				))}
		</div>
	);
};

export default InteriorExAdd;

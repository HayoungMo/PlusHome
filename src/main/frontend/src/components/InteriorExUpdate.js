import React, { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import InteriorService from "../service/interiorService";
import TextFieldMui from "./TextFieldMui";
import SelectMui from "./SelectMui";
import ImageService from "../service/imageService";
import DialogMui from "./DialogMui";
import AlertMui from "./AlertMui";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";

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

const InteriorExUpdate = ({ selectedExample, imageList = [], onReload }) => {
	const [insertImageList, setInsertImageList] = useState([]);
	const [updateImageFileMap, setUpdateImageFileMap] = useState({});
	const [deleteImageNameList, setDeleteImageNameList] = useState([]);
	const [exampleList, setExampleList] = useState([]);
	const updateImageFileMapRef = useRef(updateImageFileMap);
	const insertImageListRef = useRef(insertImageList);

	const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [alert, setAlert] = useState({
		open: false,
		severity: "info",
		title: "",
		text: "",
	});

	const resetImageEditState = () => {
		Object.values(updateImageFileMap).forEach((record) => {
			if (record.previewUrl) {
				URL.revokeObjectURL(record.previewUrl);
			}
		});
		insertImageList.forEach((record) => URL.revokeObjectURL(record.previewUrl));
		setUpdateImageFileMap({});
		setDeleteImageNameList([]);
		setInsertImageList([]);
	};

	const onChangeExample = (index, e) => {
		const { name, value } = e.target;

		const newExampleList = [...exampleList];
		newExampleList[index] = {
			...newExampleList[index],
			[name]: value,
		};

		setExampleList(newExampleList);
	};

	const getImagePreview = (record) => {
		return updateImageFileMap[record.img_name]?.previewUrl || record.img_dir || record.img_name;
	};

	const isDeleteTarget = (imgName) => {
		return deleteImageNameList.includes(imgName);
	};

	const onChangeUpdateImage = (record, e) => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		const previewUrl = URL.createObjectURL(file);
		setUpdateImageFileMap((prev) => {
			if (prev[record.img_name]?.previewUrl) {
				URL.revokeObjectURL(prev[record.img_name].previewUrl);
			}

			return {
				...prev,
				[record.img_name]: {
					file,
					previewUrl,
				},
			};
		});
		setDeleteImageNameList((prev) => prev.filter((imgName) => imgName !== record.img_name));
	};

	const onClickToggleDeleteImage = (record) => {
		const exampleImageList = exampleList[0]?.logo?.result || [];
		const thumbnailImageName = exampleImageList[0]?.img_name;

		if (record.img_name === thumbnailImageName) {
			setAlert({
				open: true,
				severity: "warning",
				title: "삭제 불가",
				text: "첫 번째 이미지는 썸네일로 사용되어 삭제할 수 없습니다.",
			});
			return;
		}

		setDeleteImageNameList((prev) => {
			if (prev.includes(record.img_name)) {
				return prev.filter((imgName) => imgName !== record.img_name);
			}

			return [...prev, record.img_name];
		});

		setUpdateImageFileMap((prev) => {
			if (!prev[record.img_name]) {
				return prev;
			}

			if (prev[record.img_name].previewUrl) {
				URL.revokeObjectURL(prev[record.img_name].previewUrl);
			}

			const newMap = { ...prev };
			delete newMap[record.img_name];
			return newMap;
		});
	};

	const onChangeInsertImage = (e) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) {
			return;
		}

		const newImages = files.map((file, index) => ({
			id: `${Date.now()}-${index}-${file.name}`,
			file,
			previewUrl: URL.createObjectURL(file),
		}));

		setInsertImageList((prev) => [...prev, ...newImages]);
		e.target.value = "";
	};

	const onClickRemoveInsertImage = (imageId) => {
		setInsertImageList((prev) => {
			const removeTarget = prev.find((record) => record.id === imageId);
			if (removeTarget) {
				URL.revokeObjectURL(removeTarget.previewUrl);
			}

			return prev.filter((record) => record.id !== imageId);
		});
	};

	const processImageChanges = async (item) => {
		const exampleImageList = item?.logo?.result || [];
		const remainingImageCount = exampleImageList.filter(
			(record) => !deleteImageNameList.includes(record.img_name),
		).length;

		if (remainingImageCount + insertImageList.length === 0) {
			setAlert({
				open: true,
				severity: "warning",
				title: "이미지 필요",
				text: "시공 사례 이미지는 최소 1장 이상 필요합니다.",
			});
			return false;
		}

		const updateImageList = Object.entries(updateImageFileMap)
			.filter(([imgName]) => !deleteImageNameList.includes(imgName))
			.map(([imgName, record]) => ({
				file: record.file,
				name: imgName,
			}));

		if (deleteImageNameList.length > 0) {
			await ImageService.deleteImage(deleteImageNameList);
		}

		if (updateImageList.length > 0) {
			await ImageService.updateImage(updateImageList);
		}

		if (insertImageList.length > 0) {
			const insertList = insertImageList.map((record, index) => ({
				img_kind: "I_EXAMPLE",
				img_tag: remainingImageCount + index === 0 ? "THUMBNAIL" : "OTHER",
				dir_a: item.c_id,
				dir_b: item.c_kind,
				dir_c: item.c_name,
				dir_d: item.ie_index,
				img_idx: remainingImageCount + index,
				file: record.file,
			}));

			await ImageService.insertImage(insertList);
		}

		return true;
	};

	const onClickUpdateExample = async (e, item) => {
		e.preventDefault();

		const result = await InteriorService.UpdateInteriorExample({
			ie_index: item.ie_index,
			ie_tag: item.ie_tag,
			ie_tag2: item.ie_tag2,
			ie_content: item.ie_content,
		});

		if (!result.success) {
			setAlert({
				open: true,
				severity: "error",
				title: `에러 (${result.status})`,
				text: result.message || "오류가 발생했습니다.",
			});
			return;
		}

		try {
			const imageResult = await processImageChanges(item);
			if (!imageResult) {
				return;
			}

			setAlert({
				open: true,
				severity: "success",
				title: "수정 성공",
				text: result.message || "수정되었습니다.",
			});
			resetImageEditState();
			onReload?.();
		} catch (error) {
			console.error(error);
			setAlert({
				open: true,
				severity: "error",
				title: "이미지 처리 실패",
				text: "기본 정보는 수정되었지만 이미지 처리 중 오류가 발생했습니다.",
			});
		}
	};

	const onClickDeleteExample = async (e, item) => {
		e.preventDefault();

		const result = await InteriorService.DeleteInteriorExample({
			ie_index: item.ie_index,
		});

		if (!result.success) {
			setAlert({
				open: true,
				severity: "error",
				title: `에러 (${result.status})`,
				text: result.message || "오류가 발생했습니다.",
			});
			return;
		}

		const deleteImageNames = item?.logo?.result?.map((record) => record.img_name) || [];
		if (deleteImageNames.length > 0) {
			await ImageService.deleteImage(deleteImageNames);
		}

		resetImageEditState();
		onReload?.();
	};

	useEffect(() => {
		if (!selectedExample?.c_id) {
			setExampleList([]);
			return;
		}

		setExampleList([
			{
				...selectedExample,
				logo: {
					result: Array.isArray(imageList) ? imageList : [],
				},
			},
		]);
	}, [selectedExample, imageList]);

	useEffect(() => {
		updateImageFileMapRef.current = updateImageFileMap;
	}, [updateImageFileMap]);

	useEffect(() => {
		insertImageListRef.current = insertImageList;
	}, [insertImageList]);

	useEffect(() => {
		Object.values(updateImageFileMapRef.current).forEach((record) => {
			if (record.previewUrl) {
				URL.revokeObjectURL(record.previewUrl);
			}
		});
		insertImageListRef.current.forEach((record) => URL.revokeObjectURL(record.previewUrl));
		setUpdateImageFileMap({});
		setDeleteImageNameList([]);
		setInsertImageList([]);
	}, [selectedExample?.ie_index]);

	useEffect(() => {
		return () => {
			Object.values(updateImageFileMapRef.current).forEach((record) => {
				if (record.previewUrl) {
					URL.revokeObjectURL(record.previewUrl);
				}
			});
			insertImageListRef.current.forEach((record) => URL.revokeObjectURL(record.previewUrl));
		};
	}, []);

	return (
		<div className="interior-ex-update">
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
			<div className="interior-ex-update-head">
				<h3>시공 사례 수정</h3>
				<p>선택한 사례의 정보와 이미지를 수정합니다.</p>
			</div>
			{exampleList.map((item, index) => {
				const exampleImageList = item?.logo?.result || [];

				return (
					<div
						key={`${item.c_id}-${item.ie_index}`}
						className="interior-ex-update-card">
						<form name="example" className="interior-ex-update-form">
							<div className="interior-ex-update-selects">
								<SelectMui
									name="ie_tag"
									label="공간 유형"
									option={tagOptions1}
									value={item.ie_tag}
									onChange={(e) => onChangeExample(index, e)}
									width="100%"
								/>
								<SelectMui
									name="ie_tag2"
									label="시공 영역"
									option={tagOptions2}
									value={item.ie_tag2}
									onChange={(e) => onChangeExample(index, e)}
									width="100%"
								/>
							</div>

							<div className="interior-ex-update-content">
								<TextFieldMui
									name="ie_content"
									label="시공 내용"
									value={item.ie_content}
									onChange={(e) => onChangeExample(index, e)}
									multiline={true}
									rows={4}
									width="100%"
								/>
							</div>
						</form>

						<div className="interior-ex-update-image-grid">
							{exampleImageList.map((record, imageIndex) => {
								const markedDelete = isDeleteTarget(record.img_name);
								const changed = Boolean(updateImageFileMap[record.img_name]);
								const canDeleteImage = imageIndex > 0;

								return (
									<div
										key={`${record.img_name}-${imageIndex}`}
										className={`interior-ex-update-image-card${markedDelete ? " delete-target" : ""}${changed ? " changed" : ""}`}>
										<img
											src={getImagePreview(record)}
											alt={`${item.c_name} 시공사례`}
										/>
										<div className="interior-ex-update-image-status">
											{markedDelete ? "삭제 예정" : changed ? "교체 예정" : "등록 이미지"}
										</div>
										<div className="interior-ex-update-image-controls">
											<Button component="label" type="button" variant="outlined" size="small" disabled={markedDelete}>
												이미지 교체
												<input
													type="file"
													hidden
													name={record.img_name}
													className="updateFile"
													disabled={markedDelete}
													onChange={(e) => onChangeUpdateImage(record, e)}
												/>
											</Button>
											{canDeleteImage && (
												<Button
													type="button"
													variant="outlined"
													size="small"
													startIcon={<DeleteIcon />}
													color={markedDelete ? "inherit" : "error"}
													onClick={() => onClickToggleDeleteImage(record)}>
													{markedDelete ? "취소" : "삭제"}
												</Button>
											)}
										</div>
									</div>
								);
							})}

							{insertImageList.map((record) => (
								<div
									key={record.id}
									className="interior-ex-update-image-card insert-target">
									<img
										src={record.previewUrl}
										alt="추가 예정 이미지"
									/>
									<div className="interior-ex-update-image-status">
										추가 예정 이미지
									</div>
									<div className="interior-ex-update-image-controls">
										<Button
											type="button"
											variant="outlined"
											size="small"
											startIcon={<DeleteIcon />}
											color="error"
											onClick={() => onClickRemoveInsertImage(record.id)}>
											삭제
										</Button>
									</div>
								</div>
							))}
							{exampleImageList.length === 0 && insertImageList.length === 0 && (
								<div className="interior-ex-update-image-empty">등록된 이미지가 없습니다.</div>
							)}
						</div>

						<div className="interior-ex-update-upload">
							<Button component="label" type="button" variant="contained" startIcon={<FileUploadIcon />}>
								추가할 파일
								<input type="file" hidden multiple onChange={onChangeInsertImage} />
							</Button>
						</div>

						<div className="interior-ex-update-actions">
							<Button
								type="button"
								color="error"
								variant="contained"
								startIcon={<DeleteIcon />}
								onClick={() => setDeleteDialogOpen(true)}>
								사례 삭제
							</Button>
							<Button
								type="button"
								color="primary"
								variant="contained"
								startIcon={<FileUploadIcon />}
								onClick={() => setUpdateDialogOpen(true)}>
								수정 저장
							</Button>
						</div>

						<DialogMui
							open={updateDialogOpen}
							onClose={() => setUpdateDialogOpen(false)}
							title="제출 확인"
							text="정말 제출하시겠습니까?"
							buttons={[
								{
									title: "취소",
									color: "inherit",
									onClick: () => setUpdateDialogOpen(false),
								},
								{
									title: "제출",
									variant: "outlined",
									onClick: (e) => {
										onClickUpdateExample(e, item);
										setUpdateDialogOpen(false);
									},
								},
							]}
						/>
						<DialogMui
							open={deleteDialogOpen}
							onClose={() => setDeleteDialogOpen(false)}
							title="삭제 확인"
							text="정말 삭제하시겠습니까?"
							buttons={[
								{
									title: "취소",
									color: "inherit",
									onClick: () => setDeleteDialogOpen(false),
								},
								{
									title: "삭제",
									color: "error",
									variant: "contained",
									onClick: (e) => {
										onClickDeleteExample(e, item);
										setDeleteDialogOpen(false);
									},
								},
							]}
						/>
					</div>
				);
			})}
		</div>
	);
};

export default InteriorExUpdate;

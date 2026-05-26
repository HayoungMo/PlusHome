import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import TextFieldMui from "./TextFieldMui";
import { Button } from "@mui/material";
import SelectMui from "./SelectMui";
import DialogMui from "./DialogMui";
import AlertMui from "./AlertMui";
import FloatingActionButtonMui from "./FloatingActionButtonMui";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DeleteIcon from "@mui/icons-material/Delete";

const InteriorUpdate = (props) => {
	const { interiorInfo, setOpenUpdateDialog, onSuccess } = props;

	console.log(interiorInfo);

	const initInterior = {
		c_id: "",
		c_kind: "",
		c_name: "",
		i_tag: "",
		i_text: "",
	};

	const [interior, setInterior] = useState(initInterior);

	const { c_id, c_kind, c_name, i_tag, i_text } = interior;

	const [updateOpen, setUpdateO] = useState(false);
	const [deleteOpen, setdeleteOpen] = useState(false);

	const [alert, setAlert] = useState({
		open: false,
		severity: "info",
		title: "",
		text: "",
	});

	const handleUpdateConfirm = () => {
		setUpdateO(!updateOpen);
	};

	const handleCloseConfirm = () => {
		setdeleteOpen(!deleteOpen);
	};

	const questionOptions = {
		q1: [
			{ value: "apt", title: "아파트" },
			{ value: "villa", title: "빌라" },
			{ value: "house", title: "단독주택" },
			{ value: "officetel", title: "오피스텔" },
		],
		q2: [
			{ value: "10_20", title: "10~20평" },
			{ value: "30", title: "30평대" },
			{ value: "40", title: "40평대" },
			{ value: "50", title: "50평 이상" },
		],
		q3: [
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
	};

	const questions = [
		{
			value: "housingType",
			title: "주택 종류",
			options: questionOptions.q1,
		},
		{
			value: "areaSize",
			title: "평수",
			options: questionOptions.q2,
		},
		{
			value: "spaces",
			title: "필요한 공간",
			options: questionOptions.q3,
			multi: true,
		},
		{
			value: "location",
			title: "출장 장소",
			options: questionOptions.q3,
			multi: true,
		},
	];

	const handleChange = (e) => {
		const { name, value } = e.target;

		const valueKey = name === "tag" ? "i_tag" : "i_text";

		setInterior({ ...interiorInfo, [valueKey]: value });
	};
	const handleSubmit = async () => {
		const result = await InteriorService.UpdateInterior({
			c_id: c_id,
			c_kind: c_kind,
			c_name: c_name,
			tag: i_tag,
			text: i_text,
			i_text_before:interiorInfo.i_text,
		});

		if (result.success) {
			onSuccess();
			setAlert({
				open: true,
				severity: "success",
				title: "등록 성공",
				text: "등록되었습니다.",
			});
		} else {
			setAlert({
				open: true,
				severity: "error",
				title: `에러 (${result.status})`,
				text: result.message || "오류가 발생했습니다.",
			});
		}
	};

	const handleDelete = async () => {
		await InteriorService.DeleteInterior({
			c_id: c_id,
			c_kind: c_kind,
			c_name: c_name,
			tag: i_tag,
		});
		onSuccess();
	};

	useEffect(() => {
		setInterior(interiorInfo);
	}, [interiorInfo]);

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
			<div>
				<TextFieldMui name="tag" value={i_tag} />
				{i_tag && i_tag !== "location" ? (
					<SelectMui
						label="세부 선택"
						name="text"
						value={i_text}
						onChange={(e) => handleChange(e)}
						option={questions.find((q) => q.value === i_tag)?.options || []}
						required
					/>
				) : (
					<TextFieldMui
						name="text"
						value={i_text}
						onChange={(e) => handleChange(e)}
						required
					/>
				)}
				<Button onClick={() => handleUpdateConfirm()} variant="contained">
					제출
				</Button>
				<DialogMui
					open={updateOpen}
					onClose={handleUpdateConfirm}
					title="제출 확인"
					text="정말 제출하시겠습니까?"
					buttons={[
						{
							title: "취소",
							color: "inherit",
							onClick: () => handleUpdateConfirm(),
						},
						{
							title: "제출",
							variant: "contained",
							onClick: () => {
								console.log("제출 실행");
								handleSubmit();
								handleUpdateConfirm();
							},
						},
					]}
				/>
				<Button onClick={handleCloseConfirm} variant="contained">
					삭제
				</Button>
				<DialogMui
					open={deleteOpen}
					onClose={handleCloseConfirm}
					title="삭제 확인"
					text="정말 삭제하시겠습니까?"
					buttons={[
						{
							title: "취소",
							color: "inherit",
							onClick: () => handleCloseConfirm(),
						},
						{
							title: "삭제",
							color: "error",
							variant: "contained",
							onClick: () => {
								console.log("삭제 실행");
								handleDelete();
								handleCloseConfirm();
							},
						},
					]}
				/>
				<Button
					onClick={() => setOpenUpdateDialog(false)}
					color="error"
					variant="contained">
					수정 취소
				</Button>
			</div>
		</div>
	);
};

export default InteriorUpdate;

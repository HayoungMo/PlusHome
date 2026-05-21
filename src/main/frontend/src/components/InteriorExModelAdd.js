import React, { useState } from "react";
import { Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FloatingActionButtonMui from "./FloatingActionButtonMui";
import ImageService from "./../service/imageService";
import InteriorModelViewer from "./InteriorModelViewer";

const InteriorExModelAdd = (props) => {
	const { company, setAlertInfo, setAlertOpen, onReload } = props;
	const { c_id, c_kind, c_name } = company;

	const [previewDir, setPreviewDir] = useState(null);

	const onClickSaveModelData = async () => {
		const modelGLB = document.getElementsByName("modelFileInput")?.[0].files?.[0];
		if (!modelGLB) {
			return;
		}

		const dto = [
			{
				img_kind: "I_EXAMPLE",
				img_tag: "MODEL",
				dir_a: c_id,
				dir_b: c_kind,
				dir_c: c_name,
				dir_d: "LOGO",
				img_idx: 0,
				file: modelGLB,
			},
		];

		const result = await ImageService.insertImage(dto);

		if (result.data.success) {
			setAlertInfo({
				severity: result.data.success ? "success" : "error",
				title: result.data.success ? "등록 성공" : "등록 실패",
				text: result.data.success
					? "Model 데이터 등록에 성공하였습니다"
					: "Model 데이터 등록에 실패하였습니다",
			});
			setAlertOpen(true);
			onReload?.();
		}
	};

	return (
		<div>
			<h3>시공사례 3D 모델 업로드</h3>
			<div>
				<p>Preview</p>
				<InteriorModelViewer src={previewDir} />
			</div>

			<Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
				추가할 파일
				<input
					type="file"
					hidden
					name="modelFileInput"
					onChange={(e) => {
						const file = e.target.files?.[0];
						const previewUrl = URL.createObjectURL(file);
						setPreviewDir(previewUrl);
					}}
				/>
			</Button>
			<Button variant="contained" color="primary" onClick={onClickSaveModelData}>
				저장
			</Button>
		</div>
	);
};

export default InteriorExModelAdd;

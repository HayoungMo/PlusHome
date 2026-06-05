import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ImageService from "./../service/imageService";
import InteriorModelViewer from "./InteriorModelViewer";

const InteriorExModelAdd = (props) => {
	const { company, setAlertInfo, setAlertOpen, onReload } = props;
	const { c_id, c_kind, c_name } = company;

	const [modelFile, setModelFile] = useState(null);
	const previewDir = modelFile?.previewUrl || null;

	const showAlert = ({ severity, title, text }) => {
		setAlertInfo({
			severity,
			title,
			text,
		});
		setAlertOpen(true);
	};

	const onChangeModelFile = (e) => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		const previewUrl = URL.createObjectURL(file);
		setModelFile((prev) => {
			if (prev?.previewUrl) {
				URL.revokeObjectURL(prev.previewUrl);
			}

			return {
				file,
				previewUrl,
			};
		});
	};

	const onClickSaveModelData = async () => {
		if (!modelFile?.file) {
			showAlert({
				severity: "warning",
				title: "파일 필요",
				text: "등록할 3D 모델 파일을 선택해주세요.",
			});
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
				file: modelFile.file,
			},
		];

		const result = await ImageService.insertImage(dto);

		const isSuccess = result?.data?.success;
		showAlert({
			severity: isSuccess ? "success" : "error",
			title: isSuccess ? "등록 성공" : "등록 실패",
			text: isSuccess
				? "Model 데이터 등록에 성공하였습니다"
				: result?.data?.message || "Model 데이터 등록에 실패하였습니다",
		});

		if (isSuccess) {
			if (modelFile.previewUrl) {
				URL.revokeObjectURL(modelFile.previewUrl);
			}
			setModelFile(null);
			onReload?.();
		}
	};

	useEffect(() => {
		return () => {
			if (modelFile?.previewUrl) {
				URL.revokeObjectURL(modelFile.previewUrl);
			}
		};
	}, [modelFile]);

	return (
		<div className="interior-ex-model-add">
			<div className="interior-ex-model-add-layout">
				<div className="interior-ex-model-preview">
					{previewDir ? (
						<InteriorModelViewer src={previewDir} />
					) : (
						<div className="interior-ex-model-preview-empty">3D 모델 미리보기</div>
					)}
				</div>
				<div className="interior-ex-model-upload">
					<div className="interior-ex-model-file-info">
						<strong>{modelFile?.file?.name || "선택된 파일 없음"}</strong>
						<span>GLB 또는 GLTF 파일을 업로드합니다.</span>
					</div>
					<div className="interior-ex-model-buttons">
						<Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
							추가할 파일
							<input
								type="file"
								hidden
								name="modelFileInput"
								accept=".glb,.gltf"
								onChange={onChangeModelFile}
							/>
						</Button>
						<Button
							variant="contained"
							color="primary"
							startIcon={<FileUploadIcon />}
							onClick={onClickSaveModelData}>
							저장
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InteriorExModelAdd;

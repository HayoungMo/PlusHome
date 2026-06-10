import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ImageService from "./../service/imageService";
import InteriorModelViewer from "./InteriorModelViewer";

const InteriorExModelUpdate = (props) => {
	const { model, setAlertInfo, setAlertOpen, onReload, onCancel } = props;
	const [updateModelFile, setUpdateModelFile] = useState(null);

	const modelPreview = updateModelFile?.previewUrl || model?.img_dir || null;

	const showAlert = ({ severity, title, text }) => {
		setAlertInfo({
			severity,
			title,
			text,
		});
		setAlertOpen(true);
	};

	const onChangeUpdateModelFile = (e) => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		const previewUrl = URL.createObjectURL(file);
		setUpdateModelFile((prev) => {
			if (prev?.previewUrl) {
				URL.revokeObjectURL(prev.previewUrl);
			}

			return {
				file,
				previewUrl,
			};
		});
	};

	const onClickUpdateModelData = async () => {
		if (!model?.img_name) {
			showAlert({
				severity: "error",
				title: "수정 실패",
				text: "수정할 모델 데이터를 찾지 못했습니다.",
			});
			return;
		}

		if (!updateModelFile?.file) {
			showAlert({
				severity: "warning",
				title: "파일 필요",
				text: "교체할 3D 모델 파일을 선택해주세요.",
			});
			return;
		}

		try {
			const result = await ImageService.updateImage([
				{
					file: updateModelFile.file,
					name: model.img_name,
				},
			]);

			const isSuccess = result?.success !== false;
			showAlert({
				severity: isSuccess ? "success" : "error",
				title: isSuccess ? "수정 성공" : "수정 실패",
				text: isSuccess
					? "Model 데이터가 수정되었습니다."
					: result?.error || "Model 데이터 수정에 실패했습니다.",
			});

			if (isSuccess) {
				if (updateModelFile.previewUrl) {
					URL.revokeObjectURL(updateModelFile.previewUrl);
				}
				setUpdateModelFile(null);
				onReload?.();
			}
		} catch (err) {
			console.error(err);
			showAlert({
				severity: "error",
				title: "수정 실패",
				text: "Model 데이터 수정 중 오류가 발생했습니다.",
			});
		}
	};

	useEffect(() => {
		setUpdateModelFile((prev) => {
			if (prev?.previewUrl) {
				URL.revokeObjectURL(prev.previewUrl);
			}
			return null;
		});
	}, [model?.img_name]);

	useEffect(() => {
		return () => {
			if (updateModelFile?.previewUrl) {
				URL.revokeObjectURL(updateModelFile.previewUrl);
			}
		};
	}, [updateModelFile]);

	return (
		<div className="interior-ex-model-update">
			<div className="interior-ex-model-add-layout interior-ex-model-update-layout">
				<div className="interior-ex-model-top-actions">
					<Button
						variant="outlined"
						color="inherit"
						onClick={onCancel}>
						취소
					</Button>
					<Button
						variant="contained"
						color="primary"
						startIcon={<FileUploadIcon />}
						disabled={!updateModelFile?.file}
						onClick={onClickUpdateModelData}>
						수정
					</Button>
				</div>
				<div className="interior-ex-model-preview">
					{modelPreview ? (
						<InteriorModelViewer
							src={modelPreview}
							width="100%"
							height="300px"
							border="0"
						/>
					) : (
						<div className="interior-ex-model-preview-empty">3D 모델 미리보기</div>
					)}
				</div>
				<div className="interior-ex-model-upload">
					<div className="interior-ex-model-file-info">
						<strong title={updateModelFile?.file?.name || model?.img_name || ""}>
							{updateModelFile?.file?.name || model?.img_name || "선택된 파일 없음"}
						</strong>
						<span>GLB 또는 GLTF 파일로 교체합니다.</span>
					</div>
					<div className="interior-ex-model-buttons">
						<Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
							교체할 파일
							<input
								type="file"
								hidden
								name="modelUpdateFileInput"
								accept=".glb,.gltf"
								onChange={onChangeUpdateModelFile}
							/>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InteriorExModelUpdate;

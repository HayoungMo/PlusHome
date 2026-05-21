import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ImageService from "./../service/imageService";
import InteriorModelViewer from "./InteriorModelViewer";

const InteriorExModelUpdate = (props) => {
	const { model, setAlertInfo, setAlertOpen, onReload } = props;
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
		<div>
			<h3>시공사례 3D 모델 수정</h3>
			<div>
				<p>Preview</p>
				<InteriorModelViewer src={modelPreview} />
			</div>

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
			<Button
				variant="contained"
				color="primary"
				startIcon={<FileUploadIcon />}
				onClick={onClickUpdateModelData}>
				수정
			</Button>
		</div>
	);
};

export default InteriorExModelUpdate;

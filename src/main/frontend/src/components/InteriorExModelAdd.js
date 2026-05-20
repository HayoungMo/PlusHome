import React, { useState } from "react";
import FloatingActionButtonMui from "./FloatingActionButtonMui";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ImageService from "../service/imageService";
import { CloudUploadIcon } from "@mui/icons-material/CloudUpload";
import { Button } from "@mui/material";

const InteriorExModelAdd = ({ company }) => {
	const [sendList3, setSendList3] = useState([]);
	const onClickAdd3 = () => {
		const insertForm3 = document.getElementsByName("imageInsertTestForm3")[0];
		setSendList3([
			...sendList3,
			{
				img_kind: insertForm3.img_kind.value,
				img_tag: insertForm3.img_tag.value,
				dir_a: insertForm3.dir_a.value,
				dir_b: insertForm3.dir_b.value,
				dir_c: insertForm3.dir_c.value,
				dir_d: insertForm3.dir_d.value,
				// dir_e: insertForm.dir_e.value,
				img_idx: sendList3.length,
				file: insertForm3.file.files[0],
			},
		]);
	};

	const onClickInsert3 = async () => {
		if (!sendList3 || sendList3.length === 0) {
			console.log("보낼 이미지 없음");
			return; // 🚫 요청 안 보냄
		}

		try {
			await ImageService.insertImage(sendList3);
			// 업로드 성공 후 초기화
			setSendList3([]);
		} catch (err) {
			console.error(err);
		}
	};
	return (
		<div>
			<p>시공사례 3d 모델 업로드</p>
			<form name="imageInsertTestForm3">
				<input type="hidden" value="LOGO" name="img_kind" placeholder="IMG_KIND" />
				<input type="hidden" value="MODEL" name="img_tag" placeholder="IMG_TAG" />
				<input type="hidden" value={company.c_id} name="dir_a" placeholder="DIR_A" />
				<input type="hidden" value={company.c_kind} name="dir_b" placeholder="DIR_B" />
				<input type="hidden" value={company.c_name} name="dir_c" placeholder="DIR_C" />
				<input type="hidden" value="LOGO" name="dir_d" placeholder="DIR_D" />
				{/* <input type="hidden" value="imgTest" name="dir_b" placeholder="DIR_B" /> */}
				<input type="hidden" name="img_idx" value="1" placeholder="IMG_IDX" />
				<Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
					추가할 파일
					<input type="file" hidden name="file" onChange={() => onClickAdd3()} />
				</Button>
				<FloatingActionButtonMui
					icon={<FileUploadIcon />}
					color="secondary"
					onClick={() => onClickInsert3()}
				/>
			</form>
		</div>
	);
};

export default InteriorExModelAdd;

import React, { useEffect, useState } from "react";
import ImageService from "../service/imageService";
import GetImgDlr from "../resources/function/GetImgDlr";

const ImageGetTest = () => {
	const [image, setImage] = useState(null);

	const [sendList, setSendList] = useState([]);

	const onClickGetImgDlr = async () => {
		const testOne = await GetImgDlr({
			kind: "U_PROFILE",
			returnType: "one",
			d: "test1",
			view: true,
		});
		const testList = await GetImgDlr({
			kind: "F_REVIEW",
			returnType: "list",
			a: "00116598",
			d: "test1",
		});
		setImage(testOne);
		console.log(testOne);
		console.log(testList);
	};

	const onClickAdd = () => {
		const insertForm = document.getElementsByName("imageInsertTestForm")[0];
		setSendList([
			...sendList,
			{
				img_kind: insertForm.img_kind,
				img_tag: insertForm.img_tag,
				dir_a: insertForm.dir_a,
				img_idx: insertForm.img_idx,
				file: insertForm.file.files[0],
			},
		]);
	};

	const onClickInsert = () => {
		ImageService.insertImage(sendList);
	};

	return (
		<div>
			<h2>IMAGE</h2>
			<div>
				<input type="button" value="ONE" onClick={onClickGetImgDlr} />
				<img src={image} alt="" />
				<form name="imageInsertTestForm">
					<input type="text" value="DEV" name="img_kind" placeholder="IMG_KIND" />
					<input type="text" value="TEST" name="img_tag" placeholder="IMG_TAG" />
					<input type="text" value="devUser" name="dir_a" placeholder="DIR_A" />
					<input type="text" name="img_idx" placeholder="IMG_IDX" />
					<input type="file" name="file" />
					<br />
					<input type="button" onClick={onClickAdd} value="Add" />
					<br />
					<input type="button" onClick={onClickInsert} value="Insert" />
				</form>
			</div>
		</div>
	);
};

export default ImageGetTest;

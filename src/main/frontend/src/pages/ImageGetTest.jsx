import React, { useEffect, useState } from "react";
import ImageService from "../service/imageService";
import GetImgDlr from "../resources/function/GetImgDlr";

const ImageGetTest = () => {
	const [image, setImage] = useState(null);
	const [imageList, setImageList] = useState([]);

	const [sendList, setSendList] = useState([]);

	const onClickGetImgDlr = async () => {
		const testOne = await GetImgDlr({
			kind: "U_PROFILE",
			returnType: "one",
			d: "test3",
			view: false,
		});
		const testList = await GetImgDlr({
			kind: "DEV",
			returnType: "list",
			a: "devUser",
			b: "test",
		});
		setImage(testOne);
		setImageList(testList);
		console.log(testOne);
		console.log(testList);
	};

	const onClickAdd = () => {
		const insertForm = document.getElementsByName("imageInsertTestForm")[0];
		setSendList([
			...sendList,
			{
				img_kind: insertForm.img_kind.value,
				img_tag: insertForm.img_tag.value,
				dir_d: insertForm.dir_d.value,
				// dir_b: insertForm.dir_b.value,
				img_idx: insertForm.img_idx.value,
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
				<form name="imageInsertTestForm">
					<input type="text" value="U_PROFILE" name="img_kind" placeholder="IMG_KIND" />
					<input type="text" value="PROFILE" name="img_tag" placeholder="IMG_TAG" />
					<input type="text" value="test3" name="dir_d" placeholder="DIR_D" />
					{/* <input type="text" value="imgTest" name="dir_b" placeholder="DIR_B" /> */}
					<input type="text" name="img_idx" placeholder="IMG_IDX" />
					<input type="file" name="file" />
					<br />
					<input type="button" onClick={onClickAdd} value="Add" />
					<br />
					<input type="button" onClick={onClickInsert} value="Insert" />
				</form>
				<br />
				<br />
				<img src={image?.img_name} alt="" />
				{imageList?.map((record, index) => {
					return <img key={index} src={record.img_name} alt={index} />;
				})}
			</div>
		</div>
	);
};

export default ImageGetTest;

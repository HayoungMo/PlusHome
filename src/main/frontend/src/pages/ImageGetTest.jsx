import React, { useEffect, useState } from "react";
import ImageService from "../service/imageService";
import GetImgDir, { getImgDirSimple } from "../resources/function/GetImgDir";

const ImageGetTest = () => {
	const [image, setImage] = useState(null);
	const [imageList, setImageList] = useState([]);
	const [deleteList, setDeleteList] = useState([]);

	const [sendList, setSendList] = useState([]);

	const [selectElement, setSelectElement] = useState([]);

	const onClickGetImgDlr = async () => {
		const testOne = await GetImgDir({
			kind: "U_PROFILE",
			returnType: "one",
			d: "test3",
			view: false,
		});
		const testList = await GetImgDir({
			kind: "DEV",
			returnType: "list",
			a: "devUser",
			b: "test",
			orgList: [{ id: "devUser", event_name: "test" }],
		});
		setImage(testOne.result);
		setImageList(testList.result[0].imgList);
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

	const onClickSelect = async () => {
		const insertForm = document.getElementsByName("imageInsertTestForm")[0];
		const sendObject = {
			range: "ALL",
			kind: insertForm.img_kind.value,
		};
		const result = await ImageService.getImageData(sendObject);
		console.log(result);
		setSelectElement(result);
	};

	const onClickUpdateImage = async () => {
		const updateList = document.getElementsByClassName("updateFile");
		if (updateList.length === 0) {
			alert("Idiot");
			return;
		}
		let fileList = [];
		console.log(updateList);
		for (const element of updateList) {
			if (element.files.length !== 0)
				fileList.push({ file: element.files[0], name: element.name });
		}

		if (fileList.length === 0) {
			alert("dumb");
			return;
		}
		await ImageService.updateImage(fileList);
		// debugger;
	};

	const onClickDeleteImage = async () => {
		await ImageService.deleteImage(deleteList);
	};

	return (
		<div>
			<h2>IMAGE</h2>
			<div>
				<input type="button" value="ONE" onClick={onClickGetImgDlr} />
				<input type="button" value="SELECT" onClick={onClickSelect} />
				<form name="imageInsertTestForm">
					<br />
					<input type="text" name="img_kind" placeholder="IMG_KIND" />
					<br />
					<input type="text" value="PROFILE" name="img_tag" placeholder="IMG_TAG" />
					<br />
					<input type="text" value="test3" name="dir_d" placeholder="DIR_D" />
					<br />
					{/* <input type="text" value="imgTest" name="dir_b" placeholder="DIR_B" /> */}
					<br />
					<input type="text" name="img_idx" placeholder="IMG_IDX" />
					<br />
					<input type="file" name="file" />
					<br />
					<input type="button" onClick={onClickAdd} value="Add" />
					<br />
					<input type="button" onClick={onClickInsert} value="Insert" />
					<input type="button" onClick={onClickUpdateImage} value="update" />
					<input type="button" onClick={onClickDeleteImage} value="delete" />
				</form>
				<br />
				<br />
				<img src={image?.img_name} alt="" />
				{imageList?.map((record, index) => {
					return <img key={index} src={record.img_name} alt={index} />;
				})}
				{selectElement?.map((record) => (
					<div
						key={record.img_name}
						style={{
							display: "flex",
							marginBottom: "15px",
							marginLeft: "30px",
							justifyContent: "space-evenly",
							width: "600px",
							padding: "15px",
							border: " 1px solid",
							alignItems: "center",
						}}>
						<img
							width={100}
							src={getImgDirSimple({
								kind: record.img_kind,
								name: record.img_name,
							})}
							alt=""
						/>
						{record.dir_a},{record.dir_b},{record.img_idx},{record.img_kind},
						{record.img_tag}
						{/* <input type="file" name={record.img_name} className="updateFile" /> */}
						<input
							type="button"
							value="delete"
							onClick={(e) => {
								setDeleteList([...deleteList, record.img_name]);
							}}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default ImageGetTest;

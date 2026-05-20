import React, { useEffect, useMemo, useState } from "react";
import InteriorService from "../service/interiorService";
import InteriorUserService from "../service/interiorUserService";
import TableMui from "./../components/TableMui";
import TextFieldMui from "../components/TextFieldMui";
import AlertMui from "../components/AlertMui";
import { getImgDirSimple } from "../resources/function/GetImgDir";

const InteriorReviewControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;

	const [intreiorReviewList, setIntreiorReviewList] = useState([]);
	const [selectedIntreiorReview, setSelectedIntreiorReview] = useState(null);
	const [selectedIntreiorReviewImage, setSelectedIntreiorReviewImage] = useState([]);
	const [alertOpen, setAlertOpen] = useState(false);
	const [alertInfo, setAlertInfo] = useState(false);

	const emptyList = useMemo(() => [], []);

	const intreiorMuiDisplayList = useMemo(() => {
		if (!intreiorReviewList || intreiorReviewList.length === 0) return emptyList;

		const rowIndexList = intreiorReviewList?.map((record, index) => {
			return { ...record.review, index };
		});

		return rowIndexList;
	}, [intreiorReviewList, emptyList]);

	const onlyImageList = useMemo(() => {
		if (!intreiorReviewList || intreiorReviewList.length === 0) return emptyList;

		let resultList = [];

		intreiorReviewList?.map((record, index) => {
			if (record.image.length !== 0) {
				record.image.forEach((element) => {
					resultList.push({ ...element, index });
				});
			}
		});

		return resultList;
	}, [intreiorReviewList, emptyList]);

	const reloadData = async () => {
		const result = await InteriorUserService.getInteriorReviewByCompanyId({ c_id: id });

		if (result.success === false) {
			setAlertInfo({ severity: "error", text: result.message });
			setAlertOpen(true);
		} else if (result.listSize === 0) {
			setAlertInfo({ severity: "info", text: result.message });
			setAlertOpen(true);
		} else {
			const reviewData = result.reviewList.map((record) => ({
				...record,
				image: (record.image || []).map((img) => ({
					...img,
					img_dir: getImgDirSimple({ kind: img.img_kind, name: img.img_name }),
				})),
			}));
			console.log(reviewData);
			setSelectedIntreiorReviewImage([]);
			setSelectedIntreiorReview(null);
			setIntreiorReviewList(reviewData);
		}
	};

	useEffect(() => {
		reloadData();
	}, [id]);

	useEffect(() => {
		setSelectedIntreiorReview(null);
		setSelectedIntreiorReviewImage([]);
	}, [intreiorMuiDisplayList]);

	useEffect(() => {
		if (!selectedIntreiorReview) {
			setSelectedIntreiorReviewImage([]);
			return;
		}
		const imageList = onlyImageList?.filter(
			(data) => data.index === selectedIntreiorReview.index,
		);
		console.log(imageList);
		setSelectedIntreiorReviewImage(imageList || []);
	}, [selectedIntreiorReview]);

	return (
		<div>
			<h2>리뷰</h2>
			<TableMui
				rowData={intreiorMuiDisplayList}
				col={["index", "id", "invoice_no", "ir_createdDate", "c_content"]}
				selectedRow={selectedIntreiorReview}
				setSelectedRow={setSelectedIntreiorReview}
			/>

			{Array.isArray(selectedIntreiorReviewImage) &&
				selectedIntreiorReviewImage.length !== 0 &&
				selectedIntreiorReviewImage.map((record) => {
					return <img width={200} src={record.img_dir} alt="" />;
				})}
			{selectedIntreiorReview && (
				<TextFieldMui
					name="ir_content"
					value={selectedIntreiorReview.ir_content}
					multiline={true}
					minRows={4}
					maxRows={4}
				/>
			)}
			{alertOpen && (
				<AlertMui
					severity={alertInfo?.severity}
					variant="standard"
					title={alertInfo?.title}
					text={alertInfo?.text}
					onClose={() => setAlertOpen(false)}
					autoHideDuration={3000}
					icon={true}
				/>
			)}
		</div>
	);
};

export default InteriorReviewControl;

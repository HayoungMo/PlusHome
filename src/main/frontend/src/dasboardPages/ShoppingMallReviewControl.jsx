import React, { useEffect, useMemo, useState } from "react";
import SelectMui from "./../components/SelectMui";
import TableMui from "./../components/TableMui";
import FurnitureService from "./../service/furnitureService";
import FurnitureReviewService from "../service/furnitureReviewService";
import { getImgFurnitureList } from "../resources/function/GetImgDir";
import RatingMui from "../components/RatingMui";
import FurnitureReview from "../components/FurnitureReview";
import { Button } from "@mui/material";
import TextFieldMui from "./../components/TextFieldMui";
import DialogMui from "../components/DialogMui";
import AlertMui from "../components/AlertMui";

const ShoppingMallReviewControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { addr, birth, code, email, gender, id, name, tel, type, companyList = [] } = userData;

	const shopListState = useMemo(() => {
		const shopList = companyList.filter((data) => data.c_kind === "shop");

		return [{ c_id: id, c_name: "all" }, ...shopList];
	}, [companyList]);

	const initReviewAndReply = {
		c_id: "",
		f_code: "",
		f_name: "",
		fr_content: "",
		fr_createdDate: "",
		fr_idx: 0,
		fr_star: "",
		fr_subject: "",
		id: "",
	};

	const initAlertInfo = {
		severity: "",
		title: "",
		text: "",
	};

	const [alertInfo, setAlertInfo] = useState(initAlertInfo);
	const [furnitureList, setFurnitureList] = useState([]);
	const [reviewList, setReviewList] = useState([]);
	const [replyList, setReplyList] = useState([]);
	const [selectFurniture, setSelectFurniture] = useState("all");
	const [selectdFurnitureInfo, setSelectdFurnitureInfo] = useState(null);
	const [selectedReview, setSelectedReview] = useState(initReviewAndReply);
	const [selectedReply, setSelectedReply] = useState(initReviewAndReply);
	const [alertOpen, setAlertOpen] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [startValue, setStartValue] = useState(0);

	const displayFurnitureList = useMemo(() => {
		const shopList = furnitureList.map((record) => {
			return { ...record, value: record.f_code, title: record.f_name };
		});
		return [
			{
				c_id: "",
				c_kind: "",
				c_name: "",
				f_catagory1: "",
				f_catagory2: "",
				f_catagory3: "",
				f_catagory4: "",
				f_catagory5: "",
				f_code: "",
				f_count: "",
				f_createdDate: "",
				f_deliveryPrice: "",
				f_discount: "",
				f_dprice: "",
				f_name: "전체 보기",
				f_point: "",
				f_price: "",
				f_viewCount: "",
				imageList: "",
				value: "all",
				title: "전체 보기",
			},
			...shopList,
		];
	}, [furnitureList]);

	const displayReviewList = useMemo(() => {
		if (selectFurniture === "all") {
			return reviewList;
		}

		return reviewList.filter((data) => String(data.f_code) === String(selectFurniture));
	}, [reviewList, selectFurniture]);

	const initTotalInfo = {
		star: 0,
		qty: 0,
		price: 0,
	};

	const totalReviewInfo = useMemo(() => {
		if (displayReviewList.length === 0) return initTotalInfo;

		const totals = displayReviewList.reduce(
			(acc, review) => {
				acc.starSum += Number(review.fr_star || 0);
				acc.qtySum += Number(review.qty || 0);
				acc.priceSum += Number(review.payment || 0);
				return acc;
			},
			{ starSum: 0, qtySum: 0, priceSum: 0 },
		);

		const star = Number((totals.starSum / displayReviewList.length).toFixed(2));

		return {
			star,
			qty: totals.qtySum,
			price: totals.priceSum,
		};
	}, [displayReviewList]);

	const reLoadData = async () => {
		console.log("===== reLoadData =====");
		const result = await FurnitureService.getFurnitureByUserId(id);

		const withThumbnail = await getImgFurnitureList(result.furnitureList);

		console.log(withThumbnail);

		setFurnitureList(withThumbnail);

		const selectReviewList = [];
		const selectReplyList = [];

		for (const element of result.furnitureList) {
			const res = await FurnitureReviewService.selectReview({ f_code: element.f_code });
			if (res.data && Array.isArray(res.data)) {
				res.data.forEach((review) => {
					if (Number(review.fr_idx) < 0) {
						selectReplyList.push(review);
					} else {
						selectReviewList.push(review);
					}
				});
			}
		}
		setReviewList(selectReviewList);
		setReplyList(selectReplyList);
	};

	const cancelWriteReply = () => {
		setSelectedReply(initReviewAndReply);
		setSelectedReview(initReviewAndReply);
	};

	const onChageReplyText = (e) => {
		const { name, value } = e.target;
		setSelectedReply({ ...selectedReply, [name]: value });
	};

	const handleReplySave = async () => {
		const saveType = selectedReply.fr_idx !== 0;
		// fr_idx 가 0 = 수정 아니면 저장
		try {
			const result = saveType
				? await FurnitureReviewService.updateReplyOnDashboard(selectedReply)
				: await FurnitureReviewService.insertReplyOnDashboard(
						selectedReply,
						selectedReview,
					);
			if (result.success) {
				setAlertInfo({
					severity: "success",
					title: "저장 성공",
					text: result.message,
				});
			} else {
				setAlertInfo({
					severity: "error",
					title: "저장 실패",
					text: result.message,
				});
			}
			console.log(result);
		} catch (error) {
			setAlertInfo({
				severity: "error",
				title: "에러 발생",
				text: error,
			});
			console.log(error);
		}
		setSelectedReply(initReviewAndReply);
		setSelectedReview(initReviewAndReply);
		reLoadData();
		setConfirmOpen(!confirmOpen);
		setAlertOpen(!alertOpen);
	};

	const dialogUpdateConfirmButtonList = [
		{
			title: "Cancel",
			color: "error",
			variant: "outlined",
			onClick: () => setConfirmOpen(!confirmOpen),
		},
		{
			title: "Save",
			color: "primary",
			variant: "outlined",
			onClick: () => handleReplySave(),
		},
	];

	useEffect(() => {
		reLoadData();
	}, [id]);

	useEffect(() => {
		setSelectedReview(initReviewAndReply);
		if (selectFurniture === "all") return setSelectdFurnitureInfo(null);

		const selectedFurnitureInfo = displayFurnitureList.filter(
			(data) => data.f_code === selectFurniture,
		);

		setSelectdFurnitureInfo(selectedFurnitureInfo[0]);
	}, [selectFurniture]);

	useEffect(() => {
		if (replyList.length === 0) return setSelectedReply(initReviewAndReply);

		const replyIndex = selectedReview.fr_idx * -1;

		const findReply =
			replyList.find((element) => element.fr_idx === replyIndex) || initReviewAndReply;

		console.log(selectedReview)

		setSelectedReply(findReply);
	}, [selectedReview]);

	return (
		<div>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					height: "fit-content",
					marginBottom: "15px",
					marginTop: "5px",
				}}>
				<SelectMui
					label="상품 선택"
					value={selectFurniture}
					onChange={(e) => {
						console.log("SelectMui : " + e.target.value);
						setSelectFurniture(e.target.value);
					}}
					option={displayFurnitureList || []}
					width="180px"
				/>
				<TextFieldMui value={totalReviewInfo.star} label="별점 평균" />
				<TextFieldMui value={totalReviewInfo.qty} label="구매 물품 수" />
				<TextFieldMui value={totalReviewInfo.price} label="총 금액" />
			</div>
			{selectdFurnitureInfo !== null && (
				<div>
					{selectdFurnitureInfo?.f_name} |
					<div>
						<img
							width={100}
							src={selectdFurnitureInfo?.thumbnail}
							alt={selectdFurnitureInfo?.f_name}
						/>
					</div>
				</div>
			)}
			<TableMui
				rowData={displayReviewList}
				col={["id", "fr_star", "fr_subject", "f_name", "c_id", "f_code"]}
				selectedRow={selectedReview}
				setSelectedRow={setSelectedReview}
				defaultRowPerPage={5}
				resetPageKey={selectFurniture}
				pagination
			/>
			선택한 리뷰
			{selectedReview.fr_idx !== 0 && (
				<div>
					<FurnitureReview
						key={selectedReview.fr_idx !== 0 ? selectedReview.fr_idx : null}
						fr_idx={selectedReview.fr_idx !== 0 ? selectedReview.fr_idx : null}
						f_code={selectedReview.f_code}
					/>
				</div>
			)}
			{selectedReview.fr_idx !== 0 && (
				<div>
					<div>
						<TextFieldMui
							name="fr_subject"
							label="답변 제목"
							value={selectedReply.fr_subject}
							onChange={onChageReplyText}
						/>
					</div>
					<div>
						<TextFieldMui
							name="fr_content"
							label="답변 내용"
							multiline={true}
							minRows={4}
							maxRows={4}
							value={selectedReply.fr_content}
							onChange={onChageReplyText}
						/>
					</div>
					<div>
						<Button variant="contained" color="error" onClick={cancelWriteReply}>
							작성 취소
						</Button>
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								setConfirmOpen(!confirmOpen);
							}}>
							{selectedReply.fr_idx !== 0 ? "답변 수정" : "답변 달기"}
						</Button>
					</div>
				</div>
			)}
			{confirmOpen && (
				<DialogMui
					open={confirmOpen}
					onClose={() => setConfirmOpen(!confirmOpen)}
					title="리뷰 답변"
					text="답변을 저장하시겠습니까?"
					buttons={dialogUpdateConfirmButtonList}
				/>
			)}
			{alertOpen && (
				<AlertMui
					severity={alertInfo?.severity}
					variant="standard"
					title={alertInfo?.title}
					text={alertInfo?.text}
					onClose={() => setAlertOpen(!alertOpen)}
					autoHideDuration={3000}
					icon={true}
				/>
			)}
		</div>
	);
};

export default ShoppingMallReviewControl;

import React, { useEffect, useMemo, useState } from "react";
import DateRangeFilter from "../components/DateRangeFilter";
import RatingMui from "../components/RatingMui";
import SelectMui from "./../components/SelectMui";
import TableMui from "./../components/TableMui";
import FurnitureService from "./../service/furnitureService";
import FurnitureReviewService from "../service/furnitureReviewService";
import { getImgFurnitureList } from "../resources/function/GetImgDir";
import FurnitureReview from "../components/FurnitureReview";
import { Button, Chip } from "@mui/material";
import TextFieldMui from "./../components/TextFieldMui";
import DialogMui from "../components/DialogMui";
import AlertMui from "../components/AlertMui";
import "../css/DashboardShoppingMall.css";
import dayjs from "dayjs";

const ShoppingMallReviewControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { id, companyList = [] } = userData;

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
	const [selectCompany, setSelectCompany] = useState("all");
	const [selectFurniture, setSelectFurniture] = useState("all");
	const [selectdFurnitureInfo, setSelectdFurnitureInfo] = useState(null);
	const [selectedReview, setSelectedReview] = useState(initReviewAndReply);
	const [selectedReply, setSelectedReply] = useState(initReviewAndReply);
	const [alertOpen, setAlertOpen] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
	const isDateRangeInvalid =
		dateRange.startDate &&
		dateRange.endDate &&
		dayjs(dateRange.startDate).isAfter(dayjs(dateRange.endDate));

	const shopCompanyOptions = useMemo(() => {
		const shopList = companyList
			.filter((data) => data.c_kind === "shop")
			.reduce((acc, company) => {
				if (!company.c_name || acc.some((item) => item.value === company.c_name)) {
					return acc;
				}

				return [...acc, { title: company.c_name, value: company.c_name }];
			}, []);

		return [{ title: "전체 보기", value: "all" }, ...shopList];
	}, [companyList]);

	const furnitureByCode = useMemo(() => {
		return new Map(furnitureList.map((record) => [String(record.f_code), record]));
	}, [furnitureList]);

	const filteredFurnitureList = useMemo(() => {
		if (selectCompany === "all") return furnitureList;

		return furnitureList.filter((record) => record.c_name === selectCompany);
	}, [furnitureList, selectCompany]);

	const displayFurnitureList = useMemo(() => {
		const shopList = filteredFurnitureList.map((record) => {
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
	}, [filteredFurnitureList]);

	const displayReviewList = useMemo(() => {
		return reviewList.filter((data) => {
			const reviewDate = dayjs(data.fr_createdDate || data.fr_createddate);
			const reviewFurniture = furnitureByCode.get(String(data.f_code));
			const reviewCompanyName = data.c_name || reviewFurniture?.c_name;
			const matchCompany = selectCompany === "all" || reviewCompanyName === selectCompany;
			const matchFurniture =
				selectFurniture === "all" || String(data.f_code) === String(selectFurniture);
			const matchStart =
				!dateRange.startDate ||
				(reviewDate.isValid() && !reviewDate.isBefore(dayjs(dateRange.startDate), "day"));
			const matchEnd =
				!dateRange.endDate ||
				(reviewDate.isValid() && !reviewDate.isAfter(dayjs(dateRange.endDate), "day"));

			return matchCompany && matchFurniture && !isDateRangeInvalid && matchStart && matchEnd;
		});
	}, [
		reviewList,
		furnitureByCode,
		selectCompany,
		selectFurniture,
		dateRange,
		isDateRangeInvalid,
	]);

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

	const formatWon = (value) => `${Number(value || 0).toLocaleString()}원`;

	const reLoadData = async () => {
		console.log("===== reLoadData =====");
		const result = await FurnitureService.getFurnitureByUserId(id);

		if (!result || !result?.furnitureList) return;

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
				title: "오류 발생",
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
			title: "취소",
			color: "error",
			variant: "outlined",
			onClick: () => setConfirmOpen(!confirmOpen),
		},
		{
			title: "저장",
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

		const selectedFurnitureInfo = filteredFurnitureList.filter(
			(data) => data.f_code === selectFurniture,
		);

		setSelectdFurnitureInfo(selectedFurnitureInfo[0] || null);
	}, [filteredFurnitureList, selectFurniture]);

	useEffect(() => {
		setSelectedReview(initReviewAndReply);
	}, [selectCompany, selectFurniture, dateRange]);

	useEffect(() => {
		if (replyList.length === 0) return setSelectedReply(initReviewAndReply);

		const replyIndex = selectedReview.fr_idx * -1;

		const findReply =
			replyList.find((element) => element.fr_idx === replyIndex) || initReviewAndReply;

		console.log(selectedReview);

		setSelectedReply(findReply);
	}, [selectedReview]);

	return (
		<div className="shopping-mall-review-page">
			<div className="shopping-mall-review-header">
				<div>
					<h3>리뷰 관리</h3>
					<p>상품별 고객 리뷰를 확인하고 기업 답글을 등록합니다.</p>
				</div>
				<div className="shopping-mall-review-summary">
					<Chip label={`리뷰 ${displayReviewList.length}건`} variant="outlined" />
					<Chip
						label={`평균 ${totalReviewInfo.star}점`}
						color="primary"
						variant="outlined"
					/>
					<Chip label={`구매 ${totalReviewInfo.qty}건`} variant="outlined" />
				</div>
			</div>

			<section className="shopping-mall-review-card">
				<div className="shopping-mall-review-toolbar">
					<div className="shopping-mall-review-filter-main">
						<SelectMui
							size="small"
							label="회사 선택"
							value={selectCompany}
							onChange={(e) => {
								setSelectCompany(e.target.value);
								setSelectFurniture("all");
								setSelectdFurnitureInfo(null);
								setSelectedReview(initReviewAndReply);
								setSelectedReply(initReviewAndReply);
							}}
							option={shopCompanyOptions}
							width="180px"
						/>
						<SelectMui
							size="small"
							label="상품 선택"
							value={selectFurniture}
							onChange={(e) => {
								setSelectFurniture(e.target.value);
							}}
							option={displayFurnitureList || []}
							width="220px"
						/>
						<DateRangeFilter
							value={dateRange}
							onChange={setDateRange}
							isInvalid={Boolean(isDateRangeInvalid)}
							className="shopping-mall-review-date-range"
						/>
					</div>
					<div className="shopping-mall-review-metrics">
						<div className="shopping-mall-review-metric-card">
							<span>별점 평균</span>
							<div className="shopping-mall-review-rating-value">
								<RatingMui
									value={totalReviewInfo.star}
									precision={0.1}
									size="small"
									readOnly
								/>
								<strong>{totalReviewInfo.star.toFixed(2)}</strong>
							</div>
						</div>
						<div className="shopping-mall-review-metric-card">
							<span>구매 물품 수</span>
							<strong>{Number(totalReviewInfo.qty || 0).toLocaleString()}건</strong>
						</div>
						<div className="shopping-mall-review-metric-card">
							<span>총 금액</span>
							<strong>{formatWon(totalReviewInfo.price)}</strong>
						</div>
					</div>
				</div>

				{selectdFurnitureInfo !== null && (
					<div className="shopping-mall-review-product">
						<div className="shopping-mall-review-product-thumb">
							<img
								src={selectdFurnitureInfo?.thumbnail}
								alt={selectdFurnitureInfo?.f_name}
							/>
						</div>
						<div>
							<strong>{selectdFurnitureInfo?.f_name}</strong>
							<span>{selectdFurnitureInfo?.c_name}</span>
						</div>
					</div>
				)}

				<div className="shopping-mall-review-table">
					{displayReviewList?.length > 0 ? (
						<TableMui
							rowData={displayReviewList}
							col={["id", "fr_star", "fr_subject", "f_name", "c_id", "f_code"]}
							columns={[
								"작성자",
								"별점",
								"리뷰 제목",
								"상품명",
								"업체 ID",
								"상품 코드",
							]}
							selectedRow={selectedReview}
							setSelectedRow={setSelectedReview}
							defaultRowPerPage={5}
							resetPageKey={`${selectCompany}-${selectFurniture}-${dateRange.startDate}-${dateRange.endDate}`}
							pagination
						/>
					) : (
						<div className="shopping-mall-empty-state">
							선택한 조건에 해당하는 리뷰가 없습니다.
						</div>
					)}
				</div>
			</section>

			{selectedReview.fr_idx !== 0 && (
				<section className="shopping-mall-review-detail">
					<div className="shopping-mall-review-detail-head">
						<div>
							<h4>선택한 리뷰</h4>
							<p>고객 리뷰 내용을 확인하고 답글을 작성하세요.</p>
						</div>
						<Chip
							label={`${selectedReview.fr_star || 0}점`}
							color="primary"
							variant="outlined"
						/>
					</div>

					<div className="shopping-mall-review-preview">
						<FurnitureReview
							key={selectedReview.fr_idx !== 0 ? selectedReview.fr_idx : null}
							fr_idx={selectedReview.fr_idx !== 0 ? selectedReview.fr_idx : null}
							f_code={selectedReview.f_code}
						/>
					</div>

					<div className="shopping-mall-review-reply">
						<TextFieldMui
							name="fr_subject"
							label="답글 제목"
							value={selectedReply.fr_subject}
							onChange={onChageReplyText}
							width="100%"
						/>
						<TextFieldMui
							name="fr_content"
							label="답글 내용"
							multiline={true}
							minRows={4}
							maxRows={4}
							value={selectedReply.fr_content}
							onChange={onChageReplyText}
							width="100%"
						/>
					</div>

					<div className="shopping-mall-review-actions">
						<Button variant="contained" color="error" onClick={cancelWriteReply}>
							작성 취소
						</Button>
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								setConfirmOpen(!confirmOpen);
							}}>
							{selectedReply.fr_idx !== 0 ? "답글 수정" : "답글 쓰기"}
						</Button>
					</div>
				</section>
			)}

			{confirmOpen && (
				<DialogMui
					open={confirmOpen}
					onClose={() => setConfirmOpen(!confirmOpen)}
					title="리뷰 답글"
					text="답글을 저장하시겠습니까?"
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

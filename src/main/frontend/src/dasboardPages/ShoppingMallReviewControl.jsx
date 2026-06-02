import React, { useEffect, useMemo, useState } from "react";
import DateRangeFilter from "../components/DateRangeFilter";
import RatingMui from "../components/RatingMui";
import SelectMui from "./../components/SelectMui";
import TableMui from "./../components/TableMui";
import FurnitureService from "./../service/furnitureService";
import FurnitureReviewService from "../service/furnitureReviewService";
import GetImgDir, { getImgFurnitureList } from "../resources/function/GetImgDir";
import { Button, Chip } from "@mui/material";
import TextFieldMui from "./../components/TextFieldMui";
import DialogMui from "../components/DialogMui";
import AlertMui from "../components/AlertMui";
import ImageViewer from "../components/ImageViewer";
import "../css/DashboardShoppingMall.css";
import dayjs from "dayjs";
import Loading from "../components/Loading";

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

	const [isLoading, setIsLoading] = useState(true);
	const [loadingText, setLoadingText] = useState("리뷰 목록을 불러오는 중입니다...");
	const [alertInfo, setAlertInfo] = useState(initAlertInfo);
	const [furnitureList, setFurnitureList] = useState([]);
	const [reviewList, setReviewList] = useState([]);
	const [replyList, setReplyList] = useState([]);
	const [selectCompany, setSelectCompany] = useState("all");
	const [selectFurniture, setSelectFurniture] = useState("all");
	const [selectdFurnitureInfo, setSelectdFurnitureInfo] = useState(null);
	const [selectedReview, setSelectedReview] = useState(initReviewAndReply);
	const [selectedReply, setSelectedReply] = useState(initReviewAndReply);
	const [selectedReviewImages, setSelectedReviewImages] = useState([]);
	const [reviewViewerOpen, setReviewViewerOpen] = useState(false);
	const [reviewViewerIndex, setReviewViewerIndex] = useState(0);
	const [alertOpen, setAlertOpen] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
	const [appliedSelectCompany, setAppliedSelectCompany] = useState("all");
	const [appliedSelectFurniture, setAppliedSelectFurniture] = useState("all");
	const [appliedDateRange, setAppliedDateRange] = useState({ startDate: "", endDate: "" });
	const hasSelectedReview = Number(selectedReview?.fr_idx || 0) > 0;
	const isDateRangeInvalid =
		dateRange.startDate &&
		dateRange.endDate &&
		dayjs(dateRange.startDate).isAfter(dayjs(dateRange.endDate));
	const isAppliedDateRangeInvalid =
		appliedDateRange.startDate &&
		appliedDateRange.endDate &&
		dayjs(appliedDateRange.startDate).isAfter(dayjs(appliedDateRange.endDate));

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
			const matchCompany =
				appliedSelectCompany === "all" || reviewCompanyName === appliedSelectCompany;
			const matchFurniture =
				appliedSelectFurniture === "all" ||
				String(data.f_code) === String(appliedSelectFurniture);
			const matchStart =
				!appliedDateRange.startDate ||
				(reviewDate.isValid() &&
					!reviewDate.isBefore(dayjs(appliedDateRange.startDate), "day"));
			const matchEnd =
				!appliedDateRange.endDate ||
				(reviewDate.isValid() && !reviewDate.isAfter(dayjs(appliedDateRange.endDate), "day"));

			return (
				matchCompany &&
				matchFurniture &&
				!isAppliedDateRangeInvalid &&
				matchStart &&
				matchEnd
			);
		});
	}, [
		reviewList,
		furnitureByCode,
		appliedSelectCompany,
		appliedSelectFurniture,
		appliedDateRange,
		isAppliedDateRangeInvalid,
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

	const reviewViewerImages = selectedReviewImages.map((image) => ({
		src: image.img_name,
		alt: selectedReview.fr_subject || "리뷰 이미지",
	}));

	const openReviewViewer = (index = 0) => {
		if (reviewViewerImages.length === 0) return;
		setReviewViewerIndex(index);
		setReviewViewerOpen(true);
	};

	const reLoadData = async (showLoading = true) => {
		console.log("===== reLoadData =====");

		if (showLoading) {
			setIsLoading(true);
			setLoadingText("리뷰 목록을 불러오는 중입니다...");
		}

		try {
			const result = await FurnitureService.getFurnitureByUserId(id);

			if (!result || !result?.furnitureList) {
				setFurnitureList([]);
				setReviewList([]);
				setReplyList([]);
				return;
			}

			const withThumbnail = await getImgFurnitureList(result.furnitureList);

			setFurnitureList(withThumbnail);

			const selectReviewList = [];
			const selectReplyList = [];

			for (const element of result.furnitureList) {
				const res = await FurnitureReviewService.selectReview({
					f_code: element.f_code,
				});

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
		} catch (error) {
			console.error(error);

			setAlertInfo({
				severity: "error",
				title: "조회 실패",
				text: "리뷰 목록을 불러오는 중 오류가 발생했습니다.",
			});
			setAlertOpen(true);

			setFurnitureList([]);
			setReviewList([]);
			setReplyList([]);
		} finally {
			if (showLoading) {
				setIsLoading(false);
			}
		}
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

		setIsLoading(true);
		setLoadingText("답글을 저장하는 중입니다...");

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

			setSelectedReply(initReviewAndReply);
			setSelectedReview(initReviewAndReply);

			setLoadingText("리뷰 목록을 다시 불러오는 중입니다...");
			await reLoadData(false);
		} catch (error) {
			console.error(error);

			setAlertInfo({
				severity: "error",
				title: "오류 발생",
				text: "답글 저장 중 오류가 발생했습니다.",
			});
		} finally {
			setConfirmOpen(false);
			setAlertOpen(true);
			setIsLoading(false);
		}
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
		if (appliedSelectFurniture === "all") return setSelectdFurnitureInfo(null);

		const selectedFurnitureInfo = furnitureList.filter(
			(data) => data.f_code === appliedSelectFurniture,
		);

		setSelectdFurnitureInfo(selectedFurnitureInfo[0] || null);
	}, [furnitureList, appliedSelectFurniture]);

	useEffect(() => {
		setSelectedReview(initReviewAndReply);
	}, [appliedSelectCompany, appliedSelectFurniture, appliedDateRange]);

	useEffect(() => {
		if (replyList.length === 0) return setSelectedReply(initReviewAndReply);

		const replyIndex = selectedReview.fr_idx * -1;

		const findReply =
			replyList.find((element) => element.fr_idx === replyIndex) || initReviewAndReply;

		console.log(selectedReview);

		setSelectedReply(findReply);
	}, [selectedReview]);

	useEffect(() => {
		let ignore = false;

		const fetchSelectedReviewImages = async () => {
			setSelectedReviewImages([]);
			setReviewViewerOpen(false);
			setReviewViewerIndex(0);

			if (!hasSelectedReview || !selectedReview.c_code || !selectedReview.id) return;

			try {
				const imageResult = await GetImgDir({
					kind: "F_REVIEW",
					returnType: "list",
					a: selectedReview.c_code,
					d: selectedReview.id,
					view: false,
				});

				if (!ignore) {
					setSelectedReviewImages(imageResult?.result || []);
				}
			} catch (error) {
				console.error("리뷰 이미지 조회 실패", error);
				if (!ignore) {
					setSelectedReviewImages([]);
				}
			}
		};

		fetchSelectedReviewImages();

		return () => {
			ignore = true;
		};
	}, [hasSelectedReview, selectedReview.fr_idx, selectedReview.c_code, selectedReview.id]);

	const handleSearch = () => {
		setAppliedSelectCompany(selectCompany);
		setAppliedSelectFurniture(selectFurniture);
		setAppliedDateRange(dateRange);
	};

	return (
		<div className="shopping-mall-review-page">
			<div className="shopping-mall-review-header">
				<div>
					<h3>리뷰 관리</h3>
					<p>상품별 고객 리뷰를 확인하고 기업 답글을 등록합니다.</p>
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
						<Button variant="contained" onClick={handleSearch}>
							검색
						</Button>
					</div>
					<div className="shopping-mall-review-metrics">
						<div className="shopping-mall-review-metric-card">
							<span>총 리뷰</span>
							<strong>{displayReviewList.length.toLocaleString()}건</strong>
						</div>
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
					{isLoading ? (
						<Loading message={loadingText} />
					) : displayReviewList?.length > 0 ? (
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
							resetPageKey={`${appliedSelectCompany}-${appliedSelectFurniture}-${appliedDateRange.startDate}-${appliedDateRange.endDate}`}
							pagination
						/>
					) : (
						<div className="shopping-mall-empty-state">
							선택한 조건에 해당하는 리뷰가 없습니다.
						</div>
					)}
				</div>
			</section>

			{hasSelectedReview && (
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
						<div className="shopping-mall-review-preview-main">
							<div className="shopping-mall-review-preview-title">
								<strong>{selectedReview.fr_subject || "제목 없음"}</strong>
								<RatingMui
									value={Number(selectedReview.fr_star || 0)}
									precision={0.5}
									readOnly
								/>
							</div>
							<div className="shopping-mall-review-preview-meta">
								<span>작성자 {selectedReview.id || "-"}</span>
								<span>{selectedReview.fr_createdDate || selectedReview.fr_createddate || "-"}</span>
							</div>
							<p>{selectedReview.fr_content || "내용이 없습니다."}</p>
						</div>

						{selectedReviewImages.length > 0 ? (
							<div className="shopping-mall-review-preview-images">
								{selectedReviewImages.map((image, index) => (
									<button
										type="button"
										key={`${image.img_name}-${index}`}
										onClick={() => openReviewViewer(index)}>
										<img
											src={image.img_name}
											alt={selectedReview.fr_subject || "리뷰 이미지"}
										/>
									</button>
								))}
							</div>
						) : (
							<div className="shopping-mall-review-preview-empty">
								등록된 리뷰 이미지가 없습니다.
							</div>
						)}
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
			<ImageViewer
				open={reviewViewerOpen}
				images={reviewViewerImages}
				startIndex={reviewViewerIndex}
				title={selectedReview.fr_subject}
				content={selectedReview.fr_content}
				date={selectedReview.fr_createdDate || selectedReview.fr_createddate}
				writer={selectedReview.id}
				star={selectedReview.fr_star}
				reply={selectedReply.fr_idx !== 0 ? selectedReply : null}
				onClose={() => setReviewViewerOpen(false)}
			/>
		</div>
	);
};

export default ShoppingMallReviewControl;

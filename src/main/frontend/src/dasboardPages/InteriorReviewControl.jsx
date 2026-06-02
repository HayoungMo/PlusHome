import React, { useEffect, useMemo, useState } from "react";
import InteriorUserService from "../service/interiorUserService";
import DateRangeFilter from "../components/DateRangeFilter";
import FilterBar from "../components/FilterBar";
import TableMui from "./../components/TableMui";
import TextFieldMui from "../components/TextFieldMui";
import AlertMui from "../components/AlertMui";
import { getImgDirSimple } from "../resources/function/GetImgDir";
import { Button, Chip } from "@mui/material";
import dayjs from "dayjs";
import Loading from "../components/Loading";
import "../css/DashboardInterior.css";

const InteriorReviewControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { id, companyList = [] } = userData;

	const [intreiorReviewList, setIntreiorReviewList] = useState([]);
	const [selectedIntreiorReview, setSelectedIntreiorReview] = useState(null);
	const [selectedIntreiorReviewImage, setSelectedIntreiorReviewImage] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingText, setLoadingText] = useState("인테리어 리뷰 목록을 불러오는 중입니다...");
	const [alertOpen, setAlertOpen] = useState(false);
	const [alertInfo, setAlertInfo] = useState(false);
	const [filterBarState, setFilterBarState] = useState({});
	const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
	const [appliedFilterBarState, setAppliedFilterBarState] = useState({});
	const [appliedDateRange, setAppliedDateRange] = useState({ startDate: "", endDate: "" });

	const emptyList = useMemo(() => [], []);
	const selectedCompanyName = appliedFilterBarState.c_name || "all";
	const reviewFilterList = useMemo(
		() =>
			[
				{
					key: "c_name",
					title: "업체",
					options: companyList
						.filter((company) => company.c_kind === "interior")
						.map((company) => ({
							title: company.c_name,
							value: company.c_name,
						})),
				},
			].filter((filter) => filter.options.length > 0),
		[companyList],
	);
	const isDateRangeInvalid =
		dateRange.startDate &&
		dateRange.endDate &&
		dayjs(dateRange.startDate).isAfter(dayjs(dateRange.endDate));
	const isAppliedDateRangeInvalid =
		appliedDateRange.startDate &&
		appliedDateRange.endDate &&
		dayjs(appliedDateRange.startDate).isAfter(dayjs(appliedDateRange.endDate));
	const handleSearch = () => {
		setAppliedFilterBarState(filterBarState);
		setAppliedDateRange(dateRange);
	};

	const intreiorMuiDisplayList = useMemo(() => {
		if (!intreiorReviewList || intreiorReviewList.length === 0) return emptyList;

		const rowIndexList = intreiorReviewList
			?.filter((record) => {
				const reviewDate = dayjs(record.review?.ir_createdDate);
				const matchCompany =
					selectedCompanyName === "all" || record.review?.c_name === selectedCompanyName;
				const matchStart =
					!appliedDateRange.startDate ||
					(reviewDate.isValid() &&
						!reviewDate.isBefore(dayjs(appliedDateRange.startDate), "day"));
				const matchEnd =
					!appliedDateRange.endDate ||
					(reviewDate.isValid() &&
						!reviewDate.isAfter(dayjs(appliedDateRange.endDate), "day"));

				return matchCompany && !isAppliedDateRangeInvalid && matchStart && matchEnd;
			})
			.map((record, index) => {
				return { ...record.review, index };
			});

		return rowIndexList;
	}, [
		intreiorReviewList,
		emptyList,
		selectedCompanyName,
		appliedDateRange,
		isAppliedDateRangeInvalid,
	]);

	const onlyImageList = useMemo(() => {
		if (!intreiorReviewList || intreiorReviewList.length === 0) return emptyList;

		let resultList = [];

		intreiorReviewList
			?.filter((record) => {
				const reviewDate = dayjs(record.review?.ir_createdDate);
				const matchCompany =
					selectedCompanyName === "all" || record.review?.c_name === selectedCompanyName;
				const matchStart =
					!appliedDateRange.startDate ||
					(reviewDate.isValid() &&
						!reviewDate.isBefore(dayjs(appliedDateRange.startDate), "day"));
				const matchEnd =
					!appliedDateRange.endDate ||
					(reviewDate.isValid() &&
						!reviewDate.isAfter(dayjs(appliedDateRange.endDate), "day"));

				return matchCompany && !isAppliedDateRangeInvalid && matchStart && matchEnd;
			})
			.forEach((record, index) => {
				if (record.image.length !== 0) {
					record.image.forEach((element) => {
						resultList.push({ ...element, index });
					});
				}
			});

		return resultList;
	}, [
		intreiorReviewList,
		emptyList,
		selectedCompanyName,
		appliedDateRange,
		isAppliedDateRangeInvalid,
	]);

	const reloadData = async (showLoading = true) => {
		if (showLoading) {
			setIsLoading(true);
			setLoadingText("인테리어 리뷰 목록을 불러오는 중입니다...");
		}

		try {
			const result = await InteriorUserService.getInteriorReviewByCompanyId({
				c_id: id,
			});

			if (result.success === false) {
				setAlertInfo({
					severity: "error",
					title: "조회 실패",
					text: result.message,
				});
				setAlertOpen(true);

				setIntreiorReviewList([]);
				setSelectedIntreiorReview(null);
				setSelectedIntreiorReviewImage([]);
				return;
			}

			if (result.listSize === 0) {
				setAlertInfo({
					severity: "info",
					title: "조회 결과 없음",
					text: result.message,
				});
				setAlertOpen(true);

				setIntreiorReviewList([]);
				setSelectedIntreiorReview(null);
				setSelectedIntreiorReviewImage([]);
				return;
			}

			const reviewData = result.reviewList.map((record) => ({
				...record,
				image: (record.image || []).map((img) => ({
					...img,
					img_dir: getImgDirSimple({
						kind: img.img_kind,
						name: img.img_name,
					}),
				})),
			}));

			setSelectedIntreiorReviewImage([]);
			setSelectedIntreiorReview(null);
			setIntreiorReviewList(reviewData);
		} catch (error) {
			console.error(error);

			setAlertInfo({
				severity: "error",
				title: "오류 발생",
				text: "인테리어 리뷰 목록을 불러오는 중 오류가 발생했습니다.",
			});
			setAlertOpen(true);

			setIntreiorReviewList([]);
			setSelectedIntreiorReview(null);
			setSelectedIntreiorReviewImage([]);
		} finally {
			if (showLoading) {
				setIsLoading(false);
			}
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
		setSelectedIntreiorReviewImage(imageList || []);
	}, [selectedIntreiorReview, onlyImageList]);

	return (
		<div className="interior-review-page">
			<div className="interior-review-header">
				<div>
					<h3>인테리어 리뷰 관리</h3>
					<p>고객이 남긴 인테리어 시공 리뷰와 첨부 이미지를 확인합니다.</p>
				</div>
				<div className="interior-review-summary">
					<Chip
						label={`리뷰 ${intreiorMuiDisplayList.length}건`}
						color="primary"
						variant="outlined"
					/>
					<Chip label={`이미지 ${onlyImageList.length}장`} variant="outlined" />
					<Chip
						label={selectedIntreiorReview ? "리뷰 선택됨" : "리뷰 미선택"}
						color={selectedIntreiorReview ? "success" : "default"}
						variant="outlined"
					/>
				</div>
			</div>

			<section className="interior-review-card">
				<div className="interior-filter-row interior-review-filter-row">
					<FilterBar
						filterList={reviewFilterList}
						value={filterBarState}
						onChange={setFilterBarState}
						className="interior-review-filter-bar"
					/>
					<DateRangeFilter
						value={dateRange}
						onChange={setDateRange}
						isInvalid={Boolean(isDateRangeInvalid)}
					/>
					<Button variant="contained" onClick={handleSearch}>
						검색
					</Button>
				</div>
			</section>

			<section className="interior-review-grid">
				<div className="interior-review-card">
					<div className="interior-review-card-head">
						<div>
							<strong>리뷰 목록</strong>
							<span>리뷰를 선택하면 본문과 첨부 이미지를 확인할 수 있습니다.</span>
						</div>
					</div>

					{isLoading ? (
						<div className="interior-review-table">
							<Loading message={loadingText} />
						</div>
					) : intreiorMuiDisplayList.length > 0 ? (
						<div className="interior-review-table">
							<TableMui
								rowData={intreiorMuiDisplayList}
								col={["index", "id", "invoice_no", "ir_createdDate", "c_content"]}
								columns={["번호", "고객 ID", "견적 번호", "작성일", "상담 내용"]}
								selectedRow={selectedIntreiorReview}
								setSelectedRow={setSelectedIntreiorReview}
							/>
						</div>
					) : (
						<div className="interior-review-guide">등록된 리뷰가 없습니다.</div>
					)}
				</div>

				<div className="interior-review-card">
					<div className="interior-review-card-head">
						<div>
							<strong>리뷰 상세</strong>
							<span>선택한 고객 리뷰의 내용을 확인합니다.</span>
						</div>
						<Chip
							label={`${selectedIntreiorReviewImage.length}장`}
							variant="outlined"
						/>
					</div>

					{isLoading ? (
						<div className="interior-review-guide">리뷰 정보를 불러오는 중입니다.</div>
					) : selectedIntreiorReview ? (
						<div className="interior-review-detail">
							<div className="interior-review-meta">
								<span>견적 번호 {selectedIntreiorReview.invoice_no ?? "-"}</span>
								<span>작성일 {selectedIntreiorReview.ir_createdDate ?? "-"}</span>
							</div>
							<TextFieldMui
								name="ir_content"
								value={selectedIntreiorReview.ir_content}
								multiline={true}
								minRows={4}
								maxRows={4}
							/>
						</div>
					) : (
						<div className="interior-review-guide">목록에서 리뷰를 선택하세요.</div>
					)}
				</div>
			</section>

			<section className="interior-review-card">
				<div className="interior-review-card-head">
					<div>
						<strong>리뷰 이미지</strong>
						<span>선택한 리뷰에 첨부된 시공 이미지입니다.</span>
					</div>
				</div>

				{isLoading ? (
					<div className="interior-review-guide">리뷰 이미지를 불러오는 중입니다.</div>
				) : Array.isArray(selectedIntreiorReviewImage) &&
				  selectedIntreiorReviewImage.length !== 0 ? (
					<div className="interior-review-image-grid">
						{selectedIntreiorReviewImage.map((record) => {
							return (
								<img
									key={`${record.img_name}-${record.img_idx ?? record.index}`}
									src={record.img_dir}
									alt={record.img_name || "리뷰 이미지"}
								/>
							);
						})}
					</div>
				) : (
					<div className="interior-review-guide">
						선택한 리뷰에 표시할 이미지가 없습니다.
					</div>
				)}
			</section>

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

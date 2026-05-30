import { Button, Chip } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import TableMui from "./../components/TableMui";
import questionService from "../service/questionService";
import AlertMui from "../components/AlertMui";
import DateRangeFilter from "../components/DateRangeFilter";
import TextFieldMui from "./../components/TextFieldMui";
import { getImgDirSimple } from "../resources/function/GetImgDir";
import DialogMui from "../components/DialogMui";
import TabsMui from "./../components/TabsMui";
import "../css/DashboardShoppingMall.css";
import dayjs from "dayjs";

const ShoppingMallQuestionControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { id, companyList = [] } = userData;

	const initAlertInfo = { severity: "", title: "", text: "" };

	const [tabValue, setTabValue] = useState("all");
	const [selectedTabCompany, setSelectedTabCompany] = useState(null);
	const [selectedRow, setSelectedRow] = useState(null);
	const [selectedImage, setSelectedImage] = useState([]);
	const [allQuestionList, setAllQuestionList] = useState([]);
	const [alertOpen, setAlertOpen] = useState(false);
	const [alertInfo, setAlertInfo] = useState(initAlertInfo);
	const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
	const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

	const emptyList = useMemo(() => [], []);
	const isDateRangeInvalid =
		dateRange.startDate &&
		dateRange.endDate &&
		dayjs(dateRange.startDate).isAfter(dayjs(dateRange.endDate));

	const shopListState = useMemo(() => {
		const shopList = companyList.filter((data) => data.c_kind === "shop");
		return [{ c_id: id, c_name: "all" }, ...shopList];
	}, [companyList, id]);

	const displayQuestionList = useMemo(() => {
		if (!allQuestionList || allQuestionList.length === 0) return emptyList;

		return allQuestionList
			.filter((record) => {
				const questionDate = dayjs(record.question.q_createdDate);
				const matchTab = tabValue === "all" || tabValue === record.question.c_name;
				const matchStart =
					!dateRange.startDate ||
					(questionDate.isValid() &&
						!questionDate.isBefore(dayjs(dateRange.startDate), "day"));
				const matchEnd =
					!dateRange.endDate ||
					(questionDate.isValid() && !questionDate.isAfter(dayjs(dateRange.endDate), "day"));

				return matchTab && !isDateRangeInvalid && matchStart && matchEnd;
			})
			.map((record, index) => ({ ...record.question, index }));
	}, [allQuestionList, tabValue, emptyList, dateRange, isDateRangeInvalid]);

	const displayImageList = useMemo(() => {
		if (!allQuestionList || allQuestionList.length === 0) return emptyList;

		const resultList = [];

		allQuestionList
			.filter((record) => {
				const questionDate = dayjs(record.question.q_createdDate);
				const matchTab = tabValue === "all" || tabValue === record.question.c_name;
				const matchStart =
					!dateRange.startDate ||
					(questionDate.isValid() &&
						!questionDate.isBefore(dayjs(dateRange.startDate), "day"));
				const matchEnd =
					!dateRange.endDate ||
					(questionDate.isValid() && !questionDate.isAfter(dayjs(dateRange.endDate), "day"));

				return matchTab && !isDateRangeInvalid && matchStart && matchEnd;
			})
			.forEach((record, index) => {
				(record.image || []).forEach((element) => {
					resultList.push({ ...element, index });
				});
			});

		return resultList;
	}, [allQuestionList, tabValue, emptyList, dateRange, isDateRangeInvalid]);

	const selectedCompanyLabel =
		tabValue === "all" ? "전체 쇼핑몰" : selectedTabCompany?.c_name || tabValue;

	const answeredCount = displayQuestionList.filter(
		(record) => record.q_status === "Y" || record.q_status === "답변 완료" || record.q_answer,
	).length;

	const waitingCount = Math.max(displayQuestionList.length - answeredCount, 0);

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
		const selectedCompany = shopListState.find((record) => record.c_name === newValue);
		setSelectedTabCompany(selectedCompany);
		setSelectedRow(null);
	};

	useEffect(() => {
		setSelectedRow(null);
	}, [dateRange]);

	const reloadData = async () => {
		const result = await questionService.getQuestionListsWithImage(id);

		if (result.success === false) {
			setAlertInfo({ severity: "error", text: result.message });
			setAlertOpen(true);
		} else if (result.listSize === 0) {
			setAlertInfo({ severity: "info", text: result.message });
			setAlertOpen(true);
			setAllQuestionList([]);
		} else {
			const questionList = result.questionList.map((record) => ({
				...record,
				image: (record.image || []).map((img) => ({
					...img,
					img_dir: getImgDirSimple({ kind: img.img_kind, name: img.img_name }),
				})),
			}));

			setAllQuestionList(questionList);
		}
	};

	const onChangeAnswer = (e) => {
		const { name, value } = e.target;
		setSelectedRow((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const answerSaveHandler = async () => {
		questionService.answerQuestion(selectedRow).then(() => {
			setAnswerDialogOpen(false);
			reloadData();
		});
	};

	const dialogAnswerDialogButtonList = [
		{
			title: "취소",
			color: "error",
			variant: "outlined",
			onClick: () => setAnswerDialogOpen(false),
		},
		{
			title: "저장",
			color: "primary",
			variant: "outlined",
			onClick: () => answerSaveHandler(),
		},
	];

	useEffect(() => {
		reloadData();
	}, [id]);

	useEffect(() => {
		if (!selectedRow) {
			setSelectedImage([]);
			return;
		}

		const imageList = displayImageList?.filter((data) => data.index === selectedRow.index);
		setSelectedImage(imageList || []);
	}, [selectedRow, displayImageList]);

	return (
		<div className="shopping-mall-question-page">
			<div className="shopping-mall-question-header">
				<div>
					<h3>문의 관리</h3>
					<p>상품 문의를 확인하고 고객에게 답변을 등록합니다.</p>
				</div>
				<div className="shopping-mall-question-summary">
					<Chip label={`문의 ${displayQuestionList.length}건`} variant="outlined" />
					<Chip
						label={`답변 대기 ${waitingCount}건`}
						color="warning"
						variant="outlined"
					/>
					<Chip
						label={`답변 완료 ${answeredCount}건`}
						color="primary"
						variant="outlined"
					/>
				</div>
			</div>

			<section className="shopping-mall-question-card">
				<div className="shopping-mall-question-card-head">
					<div>
						<strong>{selectedCompanyLabel}</strong>
						<span>쇼핑몰별 문의 목록</span>
					</div>
				</div>

				<div className="shopping-mall-question-filter-row">
					<TabsMui
						tabValue={tabValue}
						handleTabChange={handleTabChange}
						tabList={shopListState}
						tabKey="c_id"
						label="c_name"
						value="c_name"
					/>
					<DateRangeFilter
						value={dateRange}
						onChange={setDateRange}
						isInvalid={Boolean(isDateRangeInvalid)}
					/>
				</div>

				<div className="shopping-mall-question-table">
					{displayQuestionList?.length > 0 ? (
						<TableMui
							col={["f_name", "c_name", "q_idx", "q_secret", "q_status", "id"]}
							columns={[
								"상품명",
								"업체명",
								"문의번호",
								"비밀글",
								"답변상태",
								"작성자",
							]}
							rowData={displayQuestionList}
							selectedRow={selectedRow}
							setSelectedRow={setSelectedRow}
							defaultRowPerPage={5}
							resetPageKey={`${tabValue}-${dateRange.startDate}-${dateRange.endDate}`}
							pagination
						/>
					) : (
						<div>데이터 없음</div>
					)}
				</div>
			</section>

			{selectedRow && (
				<section className="shopping-mall-question-detail">
					<div className="shopping-mall-question-detail-head">
						<div>
							<h4>문의 상세</h4>
							<p>선택한 문의 내용을 확인한 뒤 답변을 작성하세요.</p>
						</div>
						<Chip
							label={selectedRow.q_status || "답변 대기"}
							color={selectedRow.q_answer ? "primary" : "warning"}
							variant="outlined"
						/>
					</div>

					<div className="shopping-mall-question-fields">
						<TextFieldMui
							label="상품명"
							value={selectedRow.f_name || ""}
							width="100%"
						/>
						<TextFieldMui
							label="문의 제목"
							value={selectedRow.q_title || ""}
							width="100%"
						/>
						<TextFieldMui
							label="문의 내용"
							value={selectedRow.q_content || ""}
							width="100%"
							multiline
							minRows={3}
							maxRows={6}
						/>
					</div>

					<div className="shopping-mall-question-images">
						{Array.isArray(selectedImage) &&
							selectedImage.length > 0 &&
							selectedImage.map((record) => (
								<img
									key={record.img_name || record.img_dir}
									src={record.img_dir}
									alt="문의 첨부 이미지"
								/>
							))}
					</div>

					<div className="shopping-mall-question-answer">
						<TextFieldMui
							name="q_answer"
							value={selectedRow?.q_answer || ""}
							label="답변 내용"
							multiline
							minRows={5}
							maxRows={8}
							width="100%"
							onChange={onChangeAnswer}
						/>
					</div>

					<div className="shopping-mall-question-actions">
						<Button
							variant="contained"
							color="primary"
							onClick={() => setAnswerDialogOpen(true)}>
							답변 저장
						</Button>
					</div>
				</section>
			)}

			{answerDialogOpen && (
				<DialogMui
					open={answerDialogOpen}
					onClose={() => setAnswerDialogOpen(false)}
					title="문의 답변"
					text="답변을 저장하시겠습니까?"
					buttons={dialogAnswerDialogButtonList}
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

export default ShoppingMallQuestionControl;

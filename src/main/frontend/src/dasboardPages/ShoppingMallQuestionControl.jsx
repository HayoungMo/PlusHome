import { Box, Button, Tab, Tabs } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import TableMui from "./../components/TableMui";
import questionService from "../service/questionService";
import AlertMui from "../components/AlertMui";
import TextFieldMui from "./../components/TextFieldMui";
import { getImgDirSimple } from "../resources/function/GetImgDir";
import DialogMui from "../components/DialogMui";
import TabsMui from "./../components/TabsMui";

const ShoppingMallQuestionControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { addr, birth, code, email, gender, id, name, tel, type, companyList = [] } = userData;

	const initAlertInfo = { severity: "", title: "", text: "" };

	const [tabValue, setTabValue] = useState("all");
	const [selectedTabCompany, setSelectedTabCompany] = useState(null);
	const [selectedRow, setSelectedRow] = useState(null);
	const [selectedImage, setSelectedImage] = useState([]);
	const [allQuestionList, setAllQuestionList] = useState([]);
	const [alertOpen, setAlertOpen] = useState(false);
	const [alertInfo, setAlertInfo] = useState(initAlertInfo);

	const [answerDialogOpen, setAnswerDialogOpen] = useState(false);

	const emptyList = useMemo(() => [], []);

	const shopListState = useMemo(() => {
		const shopList = companyList.filter((data) => data.c_kind === "shop");

		return [{ c_id: id, c_name: "all" }, ...shopList];
	}, [companyList, id]);

	const displayQuestionList = useMemo(() => {
		if (!allQuestionList || allQuestionList.length === 0) return emptyList;

		return allQuestionList
			.filter((record) => tabValue === "all" || tabValue === record.question.c_name)
			.map((record, index) => ({ ...record.question, index }));
	}, [allQuestionList, tabValue, emptyList]);

	const displayImageList = useMemo(() => {
		if (!allQuestionList || allQuestionList.length === 0) return emptyList;

		let resultList = [];

		allQuestionList
			.filter((record) => tabValue === "all" || tabValue === record.question.c_name)
			.forEach((record, index) => {
				(record.image || []).forEach((element) => {
					resultList.push({ ...element, index });
				});
			});
		return resultList;
	}, [allQuestionList, tabValue, emptyList]);

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
		const selectedCompany = shopListState.find((record) => record.c_name === newValue);
		setSelectedTabCompany(selectedCompany);
		setSelectedRow(null);
	};

	const reloadData = async () => {
		const result = await questionService.getQuestionListsWithImage(id);
		if (result.success === false) {
			setAlertInfo({ severity: "error", text: result.message });
			setAlertOpen(true);
		} else if (result.listSize === 0) {
			setAlertInfo({ severity: "info", text: result.message });
			setAlertOpen(true);
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
		questionService.answerQuestion(selectedRow).then((res) => {
			setAnswerDialogOpen(false);
			reloadData();
		});
	};

	const dialogAnswerDialogButtonList = [
		{
			title: "Cancel",
			color: "error",
			variant: "outlined",
			onClick: () => setAnswerDialogOpen(false),
		},
		{
			title: "Save",
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
		<div>
			<h2>test</h2>
			<TabsMui
				tabValue={tabValue}
				handleTabChange={handleTabChange}
				tabList={shopListState}
				tabKey="c_id"
				label="c_name"
				value="c_name"
			/>

			<TableMui
				col={["f_name", "c_name", "q_idx", "q_secret", "q_status", "id"]}
				rowData={displayQuestionList}
				selectedRow={selectedRow}
				setSelectedRow={setSelectedRow}
				defaultRowPerPage={5}
				resetPageKey={tabValue}
				pagination
			/>
			{selectedRow && (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-evenly",
							height: "fit-content",
							margin: "15px 0px",
						}}>
						<TextFieldMui label="상품명" value={selectedRow.f_name} />
						<TextFieldMui label="문의 제목" value={selectedRow.q_title} />
						<TextFieldMui label="문의 내용" value={selectedRow.q_content} />
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
						}}>
						{Array.isArray(selectedImage) &&
							selectedImage.length !== 0 &&
							selectedImage?.map((record) => {
								return <img width={120} src={record.img_dir} alt="" />;
							})}
					</div>
					<div>
						<TextFieldMui
							name="q_answer"
							value={selectedRow?.q_answer}
							multiline={true}
							minRows={4}
							maxRows={4}
							width={500}
							onChange={onChangeAnswer}
						/>
					</div>
					<div>
						<Button
							variant="contained"
							color="primary"
							onClick={() => setAnswerDialogOpen(true)}>
							답변 저장
						</Button>
					</div>
				</div>
			)}
			{answerDialogOpen && (
				<DialogMui
					open={answerDialogOpen}
					onClose={() => setAnswerDialogOpen(false)}
					title="리뷰 답변"
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

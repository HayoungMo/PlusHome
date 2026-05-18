import { Box, Tab, Tabs } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import TableMui from "./../components/TableMui";
import questionService from "../service/questionService";
import AlertMui from "../components/AlertMui";
import TextFieldMui from "./../components/TextFieldMui";

const ShoppingMallQuestionControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { addr, birth, code, email, gender, id, name, tel, type, companyList = [] } = userData;

	const initAlertInfo = { severity: "", title: "", text: "" };

	const [tabValue, setTabValue] = useState("all");
	const [selectedTabCompany, setSelectedTabCompany] = useState(null);
	const [selectedRow, setSelectedRow] = useState(null);
	const [allQuestionList, setAllQuestionList] = useState([]);
	const [alertOpen, setAlertOpen] = useState(false);
	const [alertInfo, setAlertInfo] = useState(initAlertInfo);

	const shopListState = useMemo(() => {
		const shopList = companyList.filter((data) => data.c_kind === "shop");

		return [{ c_id: id, c_name: "all" }, ...shopList];
	}, [companyList]);

	const displayQuestionList = useMemo(() => {
		if (tabValue === "all") return allQuestionList;
		else return allQuestionList.filter((data) => data.c_name === tabValue);
	}, [allQuestionList, tabValue]);

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);

		const selectedCompany = shopListState.find((record) => record.c_name === newValue);
		setSelectedTabCompany(selectedCompany);
		setSelectedRow(null);
	};

	const reloadData = async () => {
		const result = await questionService.getCompanyQuestions(id);
		if (!result) {
			setAlertInfo({
				severity: "error",
				title: "조회 실패",
				text: "데이터 조회에 실패했습니다",
			});
		} else if (result.length === 0) {
			setAlertInfo({
				severity: "info",
				title: "데이터 없음",
				text: "등록된 문의가 없습니다.",
			});
		} else {
			setAlertInfo({
				severity: "success",
				title: "조회 성공",
				text: "성공적으로 데이터가 조회되었습니다",
			});
			setAllQuestionList(result);
		}
	};

	useEffect(() => {
		reloadData();
	}, [id]);

	return (
		<div>
			<h2>test</h2>
			<Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
				<Tabs value={tabValue} onChange={handleTabChange}>
					{shopListState.map((record, index) => {
						return (
							<Tab
								key={`${record.c_id}__${index}`}
								label={record.c_name}
								value={record.c_name}
							/>
						);
					})}
				</Tabs>
			</Box>

			<TableMui
				col={["f_name", "c_name", "q_idx", "q_secret", "q_status", "id"]}
				rowData={displayQuestionList}
				selectedRow={selectedRow}
				setSelectedRow={setSelectedRow}
			/>
			{selectedRow && (
				<div>
					<TextFieldMui label="상품명" value={selectedRow.f_name} />
					<TextFieldMui label="문의 제목" value={selectedRow.q_title} />
					<TextFieldMui label="문의 내용" value={selectedRow.q_content} />
				</div>
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

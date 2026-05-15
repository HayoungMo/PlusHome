import React, { useEffect, useState } from "react";
import InteriorUpdate from "../components/InteriorUpdate";
import InteriorAdd from "../components/InteriorAdd";
import InteriorService from "../service/interiorService";
import { Box, Button, Dialog, DialogContent, DialogTitle, Tab, Tabs } from "@mui/material";
import ButtonGroupMui from "./../components/ButtonGroupMui";
import TableMui from "./../components/TableMui";
import TableChkMui from "../components/TableChkMui";
import TableCheckBoxMui from "../components/TableCheckBoxMui";

const InteriorInfo = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;

	const interior = companyList.filter((data) => data.c_kind === "interior");

	//state
	const [tabValue, setTabValue] = useState("info");
	const [interiorCompanyList, setInteriorCompanyList] = useState([]);
	const [interiorList, setInteriorList] = useState([]);
	const [interiorDisplayList, setInteriorDisplayList] = useState([]);
	const [checkedList, setCheckedList] = useState([]);
	const [selectedCompany, setSelectedCompany] = useState(null);
	const [selectedInterior, setSelectedInterior] = useState(null);

	const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
	const [openAddDialog, setOpenAddDialog] = useState(false);

	const reLoadData = async () => {
		const interiorList = await InteriorService.fetchArticle({ c_id: id });
		const withKey = interiorList.map((record) => ({ ...record, id: makeCheckKey(record) }));
		const setIndexToCompanyList = interior.map((record, index) => ({ ...record, id: index }));
		console.log(interiorList);

		setTabValue("info");
		setSelectedCompany(null);
		setInteriorCompanyList(setIndexToCompanyList);
		setInteriorList(withKey);
	};

	const handleTabChange = (value) => {
		setTabValue(value);

		if (value === "add") setOpenAddDialog(!openAddDialog);

		if (value === "update") setOpenUpdateDialog(!openUpdateDialog);

		// const selectedCompany = tabStateList.find((record) => record.value === newValue);
	};

	const makeCheckKey = (row) => {
		return `${row.c_name}__${row.i_tag}__${row.i_text}`;
	};

	const makeCompanyKey = (row) => {
		return `${row.c_id}__${row.c_name}__${row.c_kind}`;
	};

	const interiorControlButtonGroupList = [
		{ title: "조회", onClick: () => handleTabChange("info") },
		{
			title: "등록",
			onClick: () => {
				handleTabChange("add");
			},
		},
		{
			title: "수정 - 삭제",
			onClick: () => {
				handleTabChange("update");
			},
		},
	];

	useEffect(() => {
		if (!selectedCompany) return setInteriorDisplayList([]);
		const setDisplayList = interiorList.filter(
			(row) => makeCompanyKey(row) === makeCompanyKey(selectedCompany),
		);
		setInteriorDisplayList(setDisplayList);
	}, [selectedCompany, interiorList]);

	useEffect(() => {
		setSelectedInterior(null);
	}, [interiorDisplayList]);

	useEffect(() => {
		reLoadData();
		console.log(interior);
	}, [id]);

	const companyCheck = interiorList?.length > 0;
	const interiorListCheck = selectedCompany && interiorDisplayList.length > 0;

	return (
		<div>
			{companyCheck && <div>등록된 정보가 없어요. 정보를 등록 해 주세요</div>}

			<TableMui
				selectedRow={selectedCompany}
				setSelectedRow={setSelectedCompany}
				rowData={interiorCompanyList}
			/>
			{interiorListCheck ? (
				<TableMui
					selectedRow={selectedInterior}
					setSelectedRow={setSelectedInterior}
					rowData={interiorDisplayList}
					// col={["c_id", "c_kind", "c_name", "i_tag", "i_text"]}
					// columns={["주문자", "주문품목", "판매처", "물품금액", "주문수량", "결제금액", "ID"]}
				/>
			) : selectedCompany ? (
				<div>
					<Button
						variant="contained"
						color="primary"
						onClick={() => handleTabChange("add")}>
						등록
					</Button>
				</div>
			) : (
				<div>먼저 선택해 주세요</div>
			)}
			{interiorListCheck ? (
				<ButtonGroupMui
					button={interiorControlButtonGroupList}
					color="primary"
					variant="contained"
				/>
			) : (
				<div></div>
			)}

			{tabValue === "add" && (
				<Dialog
					open={openAddDialog}
					onClose={() => setOpenAddDialog(!openAddDialog)}
					maxWidth="md"
					fullWidth>
					<DialogTitle>상품 등록</DialogTitle>

					<DialogContent>
						<InteriorAdd
							setOpenAddDialog={setOpenAddDialog}
							company={selectedCompany}
							onSuccess={async () => {
								await reLoadData();
								setOpenAddDialog(!openAddDialog);
							}}
						/>
					</DialogContent>
				</Dialog>
			)}
			{tabValue === "update" && (
				<Dialog
					open={openUpdateDialog}
					onClose={() => setOpenAddDialog(!openUpdateDialog)}
					maxWidth="md"
					fullWidth>
					<DialogTitle>상품 수정</DialogTitle>

					<DialogContent>
						<InteriorUpdate
							setOpenUpdateDialog={setOpenUpdateDialog}
							interiorInfo={selectedInterior}
							onSuccess={async () => {
								await reLoadData();
								setOpenUpdateDialog(!openUpdateDialog);
							}}
						/>
					</DialogContent>
				</Dialog>
			)}

			{/* <InteriorExAdd company={company}/> */}
			{/* <InteriorUpdate company={interior[0]}/> */}
		</div>
	);
};

export default InteriorInfo;

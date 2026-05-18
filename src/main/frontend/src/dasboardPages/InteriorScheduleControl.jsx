import React, { useEffect, useState } from "react";
import TableMui from "./../components/TableMui";
import InteriorService from "../service/interiorService";
import AlertMui from "../components/AlertMui";
import DialogMui from "../components/DialogMui";
import { Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import SelectMui from "../components/SelectMui";

const InteriorScheduleControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;

	const interior = companyList.filter((data) => data.c_kind === "interior");

	const dialogInfoInit = {
		title: "",
		text: "",
		row: null,
	};

	const [alertOpen, setAlertOpen] = useState(false);
	const [alertInfo, setAlertInfo] = useState(false);
	const [allList, setAllList] = useState([]);
	const [workingList, setWorkingList] = useState([]);
	const [doneList, setDoneList] = useState([]);
	const [cancelList, setCancelList] = useState([]);
	const [workStateChangeDialogOpen, setWorkStateChangeDialogOpen] = useState(false);
	const [workStateChangeDialogInfo, setWorkStateChangeDialogInfo] = useState(dialogInfoInit);

	const reloadData = async () => {
		const result = await InteriorService.selectWorkingAndDone(id);
		if (result.success === false) {
			setAlertInfo({ severity: "error", text: result.message });
			setAlertOpen(true);
		} else if (result.dtoList == null) {
			setAlertInfo({ severity: "info", text: result.message });
			setAlertOpen(true);
		} else {
			setAllList(result.dtoList);
			setWorkingList(result.dtoList.filter((dto) => dto.b_status === "working"));
			setDoneList(result.dtoList.filter((dto) => dto.b_status === "done"));
			setCancelList(result.dtoList.filter((dto) => dto.b_status === "cancel"));
		}
		setWorkStateChangeDialogInfo(dialogInfoInit);
	};

	const handleWorkStateChange = async () => {
		setWorkStateChangeDialogOpen(!workStateChangeDialogOpen);
		if (workStateChangeDialogInfo.row) {
			const result = await InteriorService.workingToDoneOrCancel({
				...workStateChangeDialogInfo.row,
				b_status: workStateChangeDialogInfo.type,
			});
			setAlertInfo({ severity: "success", text: result.message });
			setAlertOpen(true);
		}
		reloadData();
		setWorkStateChangeDialogInfo(dialogInfoInit);
	};

	const handleColButtonOnClick = (row, type) => {
		setWorkStateChangeDialogOpen(!workStateChangeDialogOpen);
		if (type === "cancel") {
			setWorkStateChangeDialogInfo({
				title: "시공 취소",
				text: "시공이 중단 또는 취소된 경우에만 해당하는 상태인 시공 취소 상태로 변경합니다. 변경하시겠습니까?",
				row: row,
				type: "cancel",
			});
		} else if (type === "done") {
			setWorkStateChangeDialogInfo({
				title: "시공 완료",
				text: "시공이 완료된 경우에만 해당하는 상태인 시공 취소 상태로 변경합니다. 변경하시겠습니까?",
				row: row,
				type: "done",
			});
		} else if (type === "working") {
			setWorkStateChangeDialogInfo({
				title: "시공 상태 변경",
				text: "해당 시공을 진행중인 상태로 변경합니다. 변경하시겠습니까?",
				row: row,
				type: "working",
			});
		}
	};

	const handleViewInvoicePDF = async (row) => {
		const sendData = {
			booking: row,
			company: {
				c_id: row.c_id,
				c_name: row.c_name,
			},
		};
		const result = await InteriorService.getPDFData(sendData);
		
		if (result.success) {
			const pdfData = {
				invoice: result.invoice,
				invoiceDetail: result.invoiceDetail,
				company: result.company,
				orderBy: "insert",
			};
			sessionStorage.setItem("exportPDFData", JSON.stringify(pdfData));

			window.open("/ExportPDFViewPage", "_blank", "width=1200,height=900");
		} else {
			setAlertInfo({ severity: "error", text: result.message });
			setAlertOpen(true);
		}
	};

	const buttonData = [
		{
			title: "시공 취소",
			color: "error",
			variant: "contained",
			onClick: (row) => handleColButtonOnClick(row, "cancel"),
		},
		{
			title: "시공 완료",
			color: "primary",
			variant: "contained",
			onClick: (row) => handleColButtonOnClick(row, "done"),
		},
		{
			title: "견적서 조회",
			color: "success",
			variant: "contained",
			onClick: (row) => handleViewInvoicePDF(row),
		},
	];

	const buttonDataCancelOrDone = [
		{
			title: "상태 변경",
			color: "secondary",
			variant: "contained",
			onClick: (row) => handleColButtonOnClick(row, "working"),
		},
		{
			title: "견적서 조회",
			color: "success",
			variant: "contained",
			onClick: (row) => handleViewInvoicePDF(row),
		},
	];
	const stateChangeSelectOption = [
		{ value: "pending", title: "pending" },
		{ value: "quoting", title: "quoting" },
		{ value: "confirmed", title: "confirmed" },
		{ value: "working", title: "working" },
		{ value: "done", title: "done" },
	];

	const stateChangeDialogButtonList = [
		{
			title: "취소",
			color: "error",
			variant: "contained",
			onClick: () => setWorkStateChangeDialogOpen(!workStateChangeDialogOpen),
		},
		{
			title: "저장",
			color: "primary",
			variant: "contained",
			onClick: () => handleWorkStateChange(),
		},
	];

	useEffect(() => {
		reloadData();
	}, []);

	return (
		<div>
			<h3>진행중인 시공 목록</h3>
			<TableMui
				rowData={workingList}
				col={["id", "b_date", "c_name", "b_long", "b_status", "button"]}
				columns={["고객 ID", "상담일", "진행 업체", "시공 기간", "진행 상태"]}
				buttonData={buttonData}
				buttonCol={["button1", "button2", "button3"]}
				buttonColumns={["취소", "변경", "견적서 조회"]}
			/>
			<hr />
			<h3>시공 완료 목록</h3>
			<TableMui
				rowData={doneList}
				col={["id", "b_date", "c_name", "b_long", "b_status", "button"]}
				columns={["고객 ID", "상담일", "진행 업체", "시공 기간", "진행 상태"]}
				buttonData={buttonDataCancelOrDone}
				buttonCol={["button2", "button3"]}
				buttonColumns={["변경", "견적서 조회"]}
			/>
			<hr />
			<h3>취소된 시공 목록</h3>
			<TableMui
				rowData={cancelList}
				col={["id", "b_date", "c_name", "b_long", "b_status", "button"]}
				columns={["고객 ID", "상담일", "진행 업체", "시공 기간", "진행 상태"]}
				buttonData={buttonDataCancelOrDone}
				buttonCol={["button2", "button3"]}
				buttonColumns={["변경", "견적서 조회"]}
			/>
			{workStateChangeDialogOpen && (
				<Dialog
					open={workStateChangeDialogOpen}
					onClose={() => setWorkStateChangeDialogOpen(false)}
					maxWidth="md"
					fullWidth>
					<DialogTitle>{workStateChangeDialogInfo.title}</DialogTitle>

					<DialogContent>
						{workStateChangeDialogInfo.text}

						{workStateChangeDialogInfo.row.b_status === "cancel" && (
							<SelectMui
								label="배송 상태"
								value={workStateChangeDialogInfo.type}
								onChange={(e) => {
									setWorkStateChangeDialogInfo({
										...workStateChangeDialogInfo,
										type: e.target.value,
									});
								}}
								option={stateChangeSelectOption}
								width="180px"
							/>
						)}
						<Button
							variant="outlined"
							color="error"
							onClick={() => setWorkStateChangeDialogOpen(false)}>
							취소
						</Button>
						<Button
							variant="outlined"
							color="primary"
							onClick={() => handleWorkStateChange()}>
							저장
						</Button>
					</DialogContent>
				</Dialog>

				// <DialogMui
				// 	open={workStateChangeDialogOpen}
				// 	onClose={() => setWorkStateChangeDialogOpen(!workStateChangeDialogOpen)}
				// 	title={workStateChangeDialogInfo.title}
				// 	text={workStateChangeDialogInfo.text}
				// 	buttons={stateChangeDialogButtonList}
				// />
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

export default InteriorScheduleControl;

import React, { useEffect, useState } from "react";
import TableMui from "../components/TableMui";
import { Button, Chip, Dialog, DialogContent, DialogTitle } from "@mui/material";
import AlertMui from "../components/AlertMui";
import SelectMui from "../components/SelectMui";
import InteriorService from "../service/interiorService";
import "../css/DashboardInterior.css";

const InteriorConstructionControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { id } = userData;

	const dialogInfoInit = {
		title: "",
		text: "",
		row: null,
		type: "",
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
				text: "선택한 시공 건을 취소 상태로 변경합니다. 진행하시겠습니까?",
				row: row,
				type: "cancel",
			});
		} else if (type === "done") {
			setWorkStateChangeDialogInfo({
				title: "시공 완료",
				text: "선택한 시공 건을 완료 상태로 변경합니다. 진행하시겠습니까?",
				row: row,
				type: "done",
			});
		} else if (type === "working") {
			setWorkStateChangeDialogInfo({
				title: "시공 상태 변경",
				text: "선택한 시공 건을 지정한 상태로 변경합니다. 진행하시겠습니까?",
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

	const tableCol = ["id", "b_date", "c_name", "b_long", "b_status", "button"];
	const tableColumns = ["고객 ID", "상담일", "진행 업체", "시공 기간", "진행 상태"];

	useEffect(() => {
		reloadData();
	}, []);

	return (
		<div className="interior-construction-page">
			<div className="interior-construction-header">
				<div>
					<h3>시공 진행 관리</h3>
					<p>진행 중, 완료, 취소된 시공 건을 확인하고 상태 변경과 견적서 조회를 처리합니다.</p>
				</div>
				<div className="interior-construction-summary">
					<Chip label={`전체 ${allList.length}건`} variant="outlined" />
					<Chip label={`진행중 ${workingList.length}건`} color="primary" variant="outlined" />
					<Chip label={`완료 ${doneList.length}건`} color="success" variant="outlined" />
					<Chip label={`취소 ${cancelList.length}건`} color="error" variant="outlined" />
				</div>
			</div>

			<section className="interior-construction-card">
				<div className="interior-construction-card-head">
					<div>
						<strong>진행 중인 시공 목록</strong>
						<span>현재 시공 중인 건의 완료/취소 처리와 견적서 조회를 진행합니다.</span>
					</div>
					<Chip label={`${workingList.length}건`} color="primary" variant="outlined" />
				</div>

				{workingList.length !== 0 ? (
					<div className="interior-construction-table">
						<TableMui
							rowData={workingList}
							col={tableCol}
							columns={tableColumns}
							buttonData={buttonData}
							buttonCol={["button1", "button2", "button3"]}
							buttonColumns={["취소", "완료", "견적서 조회"]}
						/>
					</div>
				) : (
					<div className="interior-construction-guide">진행 중인 시공 건이 없습니다.</div>
				)}
			</section>

			<section className="interior-construction-card">
				<div className="interior-construction-card-head">
					<div>
						<strong>시공 완료 목록</strong>
						<span>완료 처리된 시공 건을 확인하고 필요 시 상태를 변경합니다.</span>
					</div>
					<Chip label={`${doneList.length}건`} color="success" variant="outlined" />
				</div>

				{doneList.length !== 0 ? (
					<div className="interior-construction-table">
						<TableMui
							rowData={doneList}
							col={tableCol}
							columns={tableColumns}
							buttonData={buttonDataCancelOrDone}
							buttonCol={["button2", "button3"]}
							buttonColumns={["상태 변경", "견적서 조회"]}
						/>
					</div>
				) : (
					<div className="interior-construction-guide">완료된 시공 건이 없습니다.</div>
				)}
			</section>

			<section className="interior-construction-card">
				<div className="interior-construction-card-head">
					<div>
						<strong>취소된 시공 목록</strong>
						<span>취소 처리된 시공 건을 확인하고 필요 시 상태를 되돌립니다.</span>
					</div>
					<Chip label={`${cancelList.length}건`} color="error" variant="outlined" />
				</div>

				{cancelList.length !== 0 ? (
					<div className="interior-construction-table">
						<TableMui
							rowData={cancelList}
							col={tableCol}
							columns={tableColumns}
							buttonData={buttonDataCancelOrDone}
							buttonCol={["button2", "button3"]}
							buttonColumns={["상태 변경", "견적서 조회"]}
						/>
					</div>
				) : (
					<div className="interior-construction-guide">취소된 시공 건이 없습니다.</div>
				)}
			</section>

			{workStateChangeDialogOpen && (
				<Dialog
					open={workStateChangeDialogOpen}
					onClose={() => setWorkStateChangeDialogOpen(false)}
					maxWidth="sm"
					fullWidth
				>
					<DialogTitle>{workStateChangeDialogInfo.title}</DialogTitle>

					<DialogContent>
						<div className="interior-construction-dialog">
							<p>{workStateChangeDialogInfo.text}</p>

							{(workStateChangeDialogInfo.row?.b_status === "cancel" ||
								workStateChangeDialogInfo.row?.b_status === "done") && (
								<SelectMui
									label="진행 상태"
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
							<div className="interior-construction-dialog-actions">
								<Button
									variant="outlined"
									color="error"
									onClick={() => setWorkStateChangeDialogOpen(false)}
								>
									취소
								</Button>
								<Button
									variant="contained"
									color="primary"
									onClick={() => handleWorkStateChange()}
								>
									저장
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
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

export default InteriorConstructionControl;

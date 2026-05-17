import React, { useEffect, useState } from "react";
import TableMui from "./../components/TableMui";
import InteriorService from "../service/interiorService";
import AlertMui from "../components/AlertMui";
import DialogMui from "../components/DialogMui";

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
	const [workingList, setWorkingList] = useState([]);
	const [workStateChangeDialogOpen, setWorkStateChangeDialogOpen] = useState(false);
	const [workStateChangeDialogInfo, setWorkStateChangeDialogInfo] = useState(dialogInfoInit);

	const reloadData = async () => {
		const result = await InteriorService.selectWorkingAndDone(id);
		if (result.success === false) {
			setAlertInfo({ severity: "error", text: result.message });
		} else if (result.dtoList == null) {
			setAlertInfo({ severity: "info", text: result.message });
		} else {
			setAlertInfo({ severity: "success", text: result.message });
			setWorkingList(result.dtoList);
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
			console.log(result);
			debugger
		}
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
			<TableMui
				rowData={workingList}
				col={["id", "b_date", "c_name", "b_long", "b_status", "button"]}
				columns={["고객 ID", "상담일", "진행 업체", "시공 기간", "진행 상태"]}
				buttonData={buttonData}
				buttonCol={["button1", "button2"]}
				buttonColumns={["취소", "변경"]}
			/>
			{workStateChangeDialogOpen && (
				<DialogMui
					open={workStateChangeDialogOpen}
					onClose={() => setWorkStateChangeDialogOpen(!workStateChangeDialogOpen)}
					title={workStateChangeDialogInfo.title}
					text={workStateChangeDialogInfo.text}
					buttons={stateChangeDialogButtonList}
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

export default InteriorScheduleControl;

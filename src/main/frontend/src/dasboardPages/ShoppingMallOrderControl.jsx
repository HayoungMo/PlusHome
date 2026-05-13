import { Box, Button, Tab, Tabs } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import TableMui from "./../components/TableMui";
import CartService from "../service/cartService";
import AlertMui from "../components/AlertMui";
import TableCheckBoxMui from "../components/TableCheckBoxMui";
import DialogMui from "../components/DialogMui";
import SelectMui from "./../components/SelectMui";

const ShoppingMallOrderControl = () => {
	const [tabValue, setTabValue] = useState(0);

	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { addr, birth, code, email, gender, id, name, tel, type, companyList = [] } = userData;

	const shopListState = useMemo(() => {
		const shopList = companyList.filter((data) => data.c_kind === "shop");

		return [{ c_id: id, c_name: "all" }, ...shopList];
	}, [companyList]);

	const initAlertInfo = {
		severity: "",
		title: "",
		text: "",
	};

	// State
	const [orderFurnitureList, setOrderFurnitureList] = useState([]);
	const [tableDisplayDataList, setTableDisplayDataList] = useState([]);
	const [alertInfo, setAlertInfo] = useState(initAlertInfo);
	const [alertOpen, setAlertOpen] = useState(false);
	const [checkedList, setCheckedList] = useState([]);
	const [tabChangeConfirmOpen, setTabChangeConfirmOpen] = useState(false);
	const [deliveryStateChangeConfirmOpen, setDeliveryStateChangeConfirmOpen] = useState(false);
	const [deliveryChangeState, setDeliveryChangeState] = useState(null);
	const [tempState, setTempState] = useState(null);

	const orderState = [
		{ value: 0, title: "주문 접수" },
		{ value: 1, title: "출고 대기" },
		{ value: 2, title: "출고" },
		{ value: 3, title: "배송중" },
		{ value: 4, title: "배송완료" },
		{ value: 5, title: "구매확정" },
		{ value: -1, title: "주문 취소" },
	];

	const dialogTabChangeConfirmButtonList = [
		{
			title: "Cancel",
			color: "error",
			variant: "contained",
			onClick: () => setTabChangeConfirmOpen(!tabChangeConfirmOpen),
		},
		{
			title: "Move",
			color: "primary",
			variant: "contained",
			onClick: () => handleMoveTab(),
		},
	];

	const dialogDeliveryStateChangeConfirmButtonList = [
		{
			title: "Cancel",
			color: "error",
			variant: "contained",
			onClick: () => setDeliveryStateChangeConfirmOpen(!deliveryStateChangeConfirmOpen),
		},
		{
			title: "Save",
			color: "primary",
			variant: "contained",
			onClick: () => deliveryChangeSave(),
		},
	];

	const handleTabChange = (event, newValue) => {
		if (checkedList.length !== 0) {
			setTabChangeConfirmOpen(!tabChangeConfirmOpen);
			setTempState(newValue);
		} else {
			setTabValue(newValue);
		}
	};

	const handleMoveTab = () => {
		setTabValue(tempState);
		setTabChangeConfirmOpen(!tabChangeConfirmOpen);
		setTempState(null);
	};

	const reLoadServerData = async () => {
		console.log(" reLoadServerData ============  reLoadServerData");
		CartService.getOrderFurnitureList({
			c_id: id,
			f_catagory1: "reload",
		}).then((res) => {
			if (res.success === false) setAlertInfo({ severity: "error", text: res.message });
			else if (res.cartList == null) setAlertInfo({ severity: "info", text: res.message });

			if (res.success === true && res.cartList !== null) {
				setAlertInfo({ severity: "success", text: res.message });
				setOrderFurnitureList(res.cartList);
			}
			setAlertOpen(!alertOpen);
		});
	};

	const handleChangeDeliveryState = () => {
		if (checkedList.length === 0) {
			setAlertInfo({ severity: "error", text: "선택된 주문이 없습니다" });
			setAlertOpen(!alertOpen);
			return;
		}
		setDeliveryStateChangeConfirmOpen(!deliveryStateChangeConfirmOpen);
	};

	const deliveryChangeSave = async () => {
		let dtoList = [];
		checkedList.map((data) => {
			dtoList.push({ c_code: data, f_dstatus: deliveryChangeState });
		});
		setDeliveryStateChangeConfirmOpen(!deliveryStateChangeConfirmOpen);
		CartService.changeDeliveryState(dtoList).then((res) => {
			if (res.success === false) setAlertInfo({ severity: "error", text: res.message });
			if (res.success === true && res.cartList !== null) {
				setAlertInfo({ severity: "success", text: res.message });
			}
			setAlertOpen(!alertOpen);
			reLoadServerData();
		});
	};

	useEffect(() => {
		reLoadServerData();
	}, [id]);

	useEffect(() => {
		const displayList = orderFurnitureList.filter((data) => data.f_dstatus === tabValue);
		setTableDisplayDataList(displayList);

		setCheckedList([]);
	}, [orderFurnitureList, tabValue]);

	// useEffect(() => {
	// 	console.log("checkedList =====");
	// 	console.log(checkedList);
	// 	console.log("===== checkedList");
	// }, [checkedList]);

	return (
		<div>
			<Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
				<Tabs value={tabValue} onChange={handleTabChange}>
					{orderState.map((record, index) => {
						return (
							<Tab
								key={`${record.value}__${index}__${record.title}`}
								label={record.title}
								value={record.value}
							/>
						);
					})}
				</Tabs>
			</Box>

			<div
				style={{
					width: "500px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}>
				<div>{checkedList.length}개 선택됨</div>

				<SelectMui
					label="배송 상태"
					value={deliveryChangeState}
					onChange={(e) => {
						setDeliveryChangeState(e.target.value);
					}}
					option={orderState}
					width="180px"
				/>

				<Button color="primary" variant="contained" onClick={handleChangeDeliveryState}>
					수정하기
				</Button>
			</div>

			<TableCheckBoxMui
				rowData={tableDisplayDataList}
				col={[
					"cartbuyername",
					"furnitureproductname",
					"c_name",
					"furnitureproductprice",
					"cartqty",
					"cartpayedprice",
					"c_code",
				]}
				columns={["주문자", "주문품목", "판매처", "물품금액", "주문수량", "결제금액", "ID"]}
				checkedList={checkedList}
				setCheckedList={setCheckedList}
			/>
			{tabChangeConfirmOpen && (
				<DialogMui
					open={tabChangeConfirmOpen}
					onClose={() => setTabChangeConfirmOpen(!tabChangeConfirmOpen)}
					title="선택한 내용이 취소됩니다"
					text="현재 선택한 내용들이 전부 취소됩니다. 이동하시겠습니까?"
					buttons={dialogTabChangeConfirmButtonList}
				/>
			)}

			{deliveryStateChangeConfirmOpen && (
				<DialogMui
					open={deliveryStateChangeConfirmOpen}
					onClose={() =>
						setDeliveryStateChangeConfirmOpen(!deliveryStateChangeConfirmOpen)
					}
					title="배송 상태 변경"
					text="현재 선택한 주문들의 상태를 변경합니다. 저장하시겠습니까?"
					buttons={dialogDeliveryStateChangeConfirmButtonList}
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

export default ShoppingMallOrderControl;

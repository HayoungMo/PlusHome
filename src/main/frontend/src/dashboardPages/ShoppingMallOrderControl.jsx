import { Button } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AlertMui from "../components/AlertMui";
import DateRangeFilter from "../components/DateRangeFilter";
import DialogMui from "../components/DialogMui";
import FilterBar from "../components/FilterBar";
import SelectMui from "./../components/SelectMui";
import TableCheckBoxMui from "../components/TableCheckBoxMui";
import TabsMui from "./../components/TabsMui";
import CartService from "../service/cartService";
import Loading from "../components/Loading";
import dayjs from "dayjs";

const formatWon = (value) => {
	if (value === null || value === undefined || value === "") return "-";

	const numberValue = Number(value);
	if (!Number.isFinite(numberValue)) return value;

	return `${numberValue.toLocaleString()}\uc6d0`;
};

const renderOrderCell = (row, column) => {
	if (column === "furnitureproductprice" || column === "cartpayedprice") {
		return formatWon(row[column]);
	}

	return row[column];
};

const ShoppingMallOrderControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { id, companyList = [] } = userData;

	const initAlertInfo = {
		severity: "",
		title: "",
		text: "",
	};

	const [isLoading, setIsLoading] = useState(true);
	const [loadingText, setLoadingText] = useState("주문 목록을 불러오는 중입니다...");
	const [tabValue, setTabValue] = useState(0);
	const [orderFurnitureList, setOrderFurnitureList] = useState([]);
	const [tableDisplayDataList, setTableDisplayDataList] = useState([]);
	const [alertInfo, setAlertInfo] = useState(initAlertInfo);
	const [alertOpen, setAlertOpen] = useState(false);
	const [checkedList, setCheckedList] = useState([]);
	const [tabChangeConfirmOpen, setTabChangeConfirmOpen] = useState(false);
	const [deliveryStateChangeConfirmOpen, setDeliveryStateChangeConfirmOpen] = useState(false);
	const [deliveryChangeState, setDeliveryChangeState] = useState(null);
	const [tempState, setTempState] = useState(null);
	const [filterBarState, setFilterBarState] = useState({});
	const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
	const [appliedFilterBarState, setAppliedFilterBarState] = useState({});
	const [appliedDateRange, setAppliedDateRange] = useState({ startDate: "", endDate: "" });
	const isDateRangeInvalid =
		dateRange.startDate &&
		dateRange.endDate &&
		dayjs(dateRange.startDate).isAfter(dayjs(dateRange.endDate));
	const isAppliedDateRangeInvalid =
		appliedDateRange.startDate &&
		appliedDateRange.endDate &&
		dayjs(appliedDateRange.startDate).isAfter(dayjs(appliedDateRange.endDate));

	const shopListState = useMemo(() => {
		const shopList = companyList.filter((data) => data.c_kind === "shop");
		return [{ c_id: id, c_name: "all" }, ...shopList];
	}, [companyList, id]);

	const orderState = [
		{ value: 0, title: "주문 접수" },
		{ value: 1, title: "출고 대기" },
		{ value: 2, title: "출고" },
		{ value: 3, title: "배송중" },
		{ value: 4, title: "배송완료" },
		{ value: -1, title: "주문 취소" },
	];

	const getUniqueFilterOptions = (list, key) => {
		return [...new Set(list.map((item) => item[key]).filter(Boolean))].map((item) => ({
			value: item,
			title: item,
		}));
	};

	const orderFilterList = useMemo(() => {
		return [
			{
				key: "c_name",
				title: "판매처",
				type: "multi",
				options: shopListState
					.filter((shop) => shop.c_name !== "all")
					.map((shop) => ({ value: shop.c_name, title: shop.c_name })),
			},
			{
				key: "f_catagory1",
				title: "가구 종류",
				type: "multi",
				options: getUniqueFilterOptions(orderFurnitureList, "f_catagory1"),
			},
			{
				key: "f_catagory2",
				title: "공간",
				type: "multi",
				options: getUniqueFilterOptions(orderFurnitureList, "f_catagory2"),
			},
			{
				key: "f_catagory3",
				title: "스타일",
				type: "multi",
				options: getUniqueFilterOptions(orderFurnitureList, "f_catagory3"),
			},
			{
				key: "f_catagory4",
				title: "소재/특징",
				type: "multi",
				options: getUniqueFilterOptions(orderFurnitureList, "f_catagory4"),
			},
			{
				key: "f_catagory5",
				title: "라이프스타일",
				type: "multi",
				options: getUniqueFilterOptions(orderFurnitureList, "f_catagory5"),
			},
			{
				key: "furnitureproductname",
				title: "상품",
				type: "multi",
				options: getUniqueFilterOptions(orderFurnitureList, "furnitureproductname"),
			},
		].filter((filter) => filter.options.length > 0);
	}, [orderFurnitureList, shopListState]);

	const dialogTabChangeConfirmButtonList = [
		{
			title: "취소",
			color: "error",
			variant: "contained",
			onClick: () => setTabChangeConfirmOpen(false),
		},
		{
			title: "이동",
			color: "primary",
			variant: "contained",
			onClick: () => handleMoveTab(),
		},
	];

	const dialogDeliveryStateChangeConfirmButtonList = [
		{
			title: "취소",
			color: "error",
			variant: "contained",
			onClick: () => setDeliveryStateChangeConfirmOpen(false),
		},
		{
			title: "저장",
			color: "primary",
			variant: "contained",
			onClick: () => deliveryChangeSave(),
		},
	];

	const handleTabChange = (event, newValue) => {
		if (checkedList.length !== 0) {
			setTabChangeConfirmOpen(true);
			setTempState(newValue);
			return;
		}

		setTabValue(newValue);
	};

	const handleMoveTab = () => {
		setTabValue(tempState);
		setTabChangeConfirmOpen(false);
		setTempState(null);
	};

	const handleSearch = () => {
		setAppliedFilterBarState(filterBarState);
		setAppliedDateRange(dateRange);
	};

	const reLoadServerData = useCallback(async () => {
		setIsLoading(true);
		setLoadingText("주문 목록을 불러오는 중입니다...");

		try {
			const res = await CartService.getOrderFurnitureList({
				c_id: id,
				f_catagory1: "reload",
			});

			if (res.success === false) {
				setAlertInfo({ severity: "error", text: res.message });
				setOrderFurnitureList([]);
			} else if (res.cartList == null) {
				setAlertInfo({ severity: "info", text: res.message });
				setOrderFurnitureList([]);
			} else {
				setAlertInfo({ severity: "success", text: res.message });
				setOrderFurnitureList(res.cartList);
			}

			setAlertOpen(true);
		} catch (error) {
			console.error(error);
			setAlertInfo({
				severity: "error",
				text: "주문 목록을 불러오는 중 오류가 발생했습니다.",
			});
			setAlertOpen(true);
			setOrderFurnitureList([]);
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	const handleChangeDeliveryState = () => {
		if (checkedList.length === 0) {
			setAlertInfo({ severity: "error", text: "선택된 주문이 없습니다" });
			setAlertOpen(true);
			return;
		}

		setDeliveryStateChangeConfirmOpen(true);
	};

	const deliveryChangeSave = async () => {
		const dtoList = checkedList.map((data) => ({
			c_code: data,
			f_dstatus: deliveryChangeState,
		}));

		setDeliveryStateChangeConfirmOpen(false);
		setIsLoading(true);
		setLoadingText("배송 상태를 변경하는 중입니다...");

		try {
			const res = await CartService.changeDeliveryState(dtoList);

			if (res.success === false) {
				setAlertInfo({ severity: "error", text: res.message });
				setAlertOpen(true);
				return;
			}

			if (res.success === true && res.cartList !== null) {
				setAlertInfo({ severity: "success", text: res.message });
				setAlertOpen(true);
			}

			await reLoadServerData();
		} catch (error) {
			console.error(error);
			setAlertInfo({
				severity: "error",
				text: "배송 상태 변경 중 오류가 발생했습니다.",
			});
			setAlertOpen(true);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		reLoadServerData();
	}, [reLoadServerData]);

	useEffect(() => {
		const displayList = orderFurnitureList.filter((data) => {
			const matchTab = data.f_dstatus === tabValue;
			const matchFilter = Object.entries(appliedFilterBarState).every(([key, value]) => {
				if (value === "" || value === null || value === undefined) return true;
				if (Array.isArray(value)) {
					if (value.length === 0) return true;
					return value.map(String).includes(String(data[key]));
				}
				return data[key] === value;
			});
			const orderDate = dayjs(
				data.cart_paydate || data.cart_statusdate || data.f_createddate,
			);
			const matchStart =
				!appliedDateRange.startDate ||
				(orderDate.isValid() &&
					!orderDate.isBefore(dayjs(appliedDateRange.startDate), "day"));
			const matchEnd =
				!appliedDateRange.endDate ||
				(orderDate.isValid() &&
					!orderDate.isAfter(dayjs(appliedDateRange.endDate), "day"));
			const matchDateRange = !isAppliedDateRangeInvalid && matchStart && matchEnd;

			return matchTab && matchFilter && matchDateRange;
		});
		console.log(displayList);
		setTableDisplayDataList(displayList);
		setCheckedList([]);
	}, [
		orderFurnitureList,
		tabValue,
		appliedFilterBarState,
		appliedDateRange,
		isAppliedDateRangeInvalid,
	]);

	return (
		<div className="shopping-mall-order-page">
			<div className="shopping-mall-order-toolbar">
				<FilterBar
					filterList={orderFilterList}
					value={filterBarState}
					onChange={setFilterBarState}
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

			<div className="shopping-mall-order-tabs">
				<TabsMui
					tabValue={tabValue}
					handleTabChange={handleTabChange}
					tabList={orderState}
					tabKey="value"
					label="title"
					value="value"
				/>
			</div>

			<div className="shopping-mall-order-table">
				{isLoading ? (
					<Loading message={loadingText} />
				) : tableDisplayDataList?.length > 0 ? (
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
						columns={[
							"주문자",
							"주문품목",
							"판매처",
							"물품금액",
							"주문수량",
							"결제금액",
							"ID",
						]}
						checkedList={checkedList}
						setCheckedList={setCheckedList}
						defaultRowPerPage={5}
						pagination
						renderCell={renderOrderCell}
					/>
				) : (
					<div className="shopping-mall-empty-state">
						선택한 조건에 해당하는 주문이 없습니다.
					</div>
				)}
			</div>

			{tableDisplayDataList?.length > 0 && (
				<div className="shopping-mall-order-bulk-actions">
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
			)}

			{tabChangeConfirmOpen && (
				<DialogMui
					open={tabChangeConfirmOpen}
					onClose={() => setTabChangeConfirmOpen(false)}
					title="선택한 내용이 취소됩니다"
					text="현재 선택한 내용들이 전부 취소됩니다. 이동하시겠습니까?"
					buttons={dialogTabChangeConfirmButtonList}
				/>
			)}

			{deliveryStateChangeConfirmOpen && (
				<DialogMui
					open={deliveryStateChangeConfirmOpen}
					onClose={() => setDeliveryStateChangeConfirmOpen(false)}
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
					onClose={() => setAlertOpen(false)}
					autoHideDuration={3000}
					icon={true}
				/>
			)}
		</div>
	);
};

export default ShoppingMallOrderControl;

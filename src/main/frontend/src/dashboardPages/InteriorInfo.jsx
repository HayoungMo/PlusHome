import React, { useEffect, useState } from "react";
import InteriorUpdate from "../components/InteriorUpdate";
import InteriorAdd from "../components/InteriorAdd";
import InteriorService from "../service/interiorService";
import { Button, Chip, Dialog, DialogContent } from "@mui/material";
import ButtonGroupMui from "./../components/ButtonGroupMui";
import TableMui from "./../components/TableMui";
import Loading from "../components/Loading";
import "../css/DashboardInterior.css";

const COMPANY_ADDRESS_SEPARATOR = "__";

const parseCompanyAddress = (address) => {
	if (!address) return { c_addr1: "", c_addr2: "" };

	const [baseAddress = "", ...detailParts] = String(address).split(COMPANY_ADDRESS_SEPARATOR);

	return {
		c_addr1: baseAddress,
		c_addr2: detailParts.join(COMPANY_ADDRESS_SEPARATOR),
	};
};

const formatAddress = (address) => {
	if (!address) return "";
	const { c_addr1, c_addr2 } = parseCompanyAddress(address);
	return [c_addr1, c_addr2].filter(Boolean).join(" ");
};

const InteriorInfo = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { id, companyList = [] } = userData;

	const interior = companyList.filter((data) => data.c_kind === "interior") ?? [];
	const [isLoading, setIsLoading] = useState(true);
	const [loadingText, setLoadingText] = useState("인테리어 정보를 불러오는 중입니다...");
	const [tabValue, setTabValue] = useState("info");
	const [interiorCompanyList, setInteriorCompanyList] = useState([]);
	const [interiorList, setInteriorList] = useState([]);
	const [interiorDisplayList, setInteriorDisplayList] = useState([]);
	const [selectedCompany, setSelectedCompany] = useState(null);
	const [selectedInterior, setSelectedInterior] = useState(null);

	const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
	const [openAddDialog, setOpenAddDialog] = useState(false);

	const makeCheckKey = (row) => {
		return `${row.c_name}__${row.i_tag}__${row.i_text}`;
	};

	const makeCompanyKey = (row) => {
		return `${row.c_id}__${row.c_name}__${row.c_kind}`;
	};

	const reLoadData = async (showLoading = true) => {
		if (showLoading) {
			setIsLoading(true);
			setLoadingText("인테리어 정보를 불러오는 중입니다...");
		}

		try {
			const interiorList = await InteriorService.fetchArticle({ c_id: id });

			const safeInteriorList = Array.isArray(interiorList) ? interiorList : [];

			const withKey = safeInteriorList.map((record) => ({
				...record,
				id: makeCheckKey(record),
			}));

			const setIndexToCompanyList = interior.map((record, index) => ({
				...record,
				id: index,
			}));

			const addrSettingList = setIndexToCompanyList.map((company) => ({
				...company,
				c_addr_display: formatAddress(company.c_addr) || "-",
			}));

			setTabValue("info");
			setSelectedCompany(null);
			setSelectedInterior(null);
			setInteriorCompanyList(addrSettingList);
			setInteriorList(withKey);
		} catch (error) {
			console.error(error);

			setSelectedCompany(null);
			setSelectedInterior(null);
			setInteriorCompanyList([]);
			setInteriorList([]);
			setInteriorDisplayList([]);
		} finally {
			if (showLoading) {
				setIsLoading(false);
			}
		}
	};

	const handleTabChange = (value) => {
		setTabValue(value);

		if (value === "add") setOpenAddDialog(!openAddDialog);

		if (value === "update") {
			if (!selectedInterior) return;
			setOpenUpdateDialog(!openUpdateDialog);
		}
	};

	const interiorControlButtonGroupList = [
		{
			title: "등록",
			onClick: () => {
				handleTabChange("add");
			},
		},
		{
			title: "수정 / 삭제",
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

	const companyCheck = interiorCompanyList.length === 0 && !isLoading;
	const interiorListCheck = selectedCompany && interiorDisplayList.length > 0;

	return (
		<div className="interior-info-page">
			<div className="interior-info-header">
				<div>
					<h3>인테리어 정보 관리</h3>
					<p>인테리어 업체별 상담 조건과 서비스 상세 정보를 관리합니다.</p>
				</div>
				<div className="interior-info-summary">
					<Chip label={`업체 ${interiorCompanyList.length}개`} variant="outlined" />
					<Chip
						label={`등록 정보 ${interiorList.length}개`}
						color="primary"
						variant="outlined"
					/>
					<Chip
						label={selectedCompany ? "업체 선택됨" : "업체 미선택"}
						color={selectedCompany ? "success" : "default"}
						variant="outlined"
					/>
				</div>
			</div>

			{companyCheck && (
				<div className="interior-info-empty">
					등록된 정보가 없습니다. 먼저 정보를 등록해 주세요.
				</div>
			)}

			<section className="interior-info-card">
				<div className="interior-info-card-head">
					<div>
						<strong>인테리어 업체 목록</strong>
						<span>정보를 관리할 업체를 선택하세요.</span>
					</div>
				</div>

				<div className="interior-info-table">
					{isLoading ? (
						<Loading message={loadingText} />
					) : interiorCompanyList.length > 0 ? (
						<TableMui
							selectedRow={selectedCompany}
							setSelectedRow={setSelectedCompany}
							rowData={interiorCompanyList}
							col={["c_name", "c_tel", "c_addr_display", "c_boss"]}
							columns={["업체명", "연락처", "주소", "대표자"]}
							defaultRowPerPage={5}
							resetPageKey={`tablemui-${selectedCompany}-info-table`}
							pagination
						/>
					) : (
						<div className="interior-info-guide">
							<p>등록된 인테리어 업체가 없습니다.</p>
						</div>
					)}
				</div>
			</section>

			<section className="interior-info-card">
				<div className="interior-info-card-head">
					<div>
						<strong>{selectedCompany?.c_name || "상세 정보"}</strong>
						<span>선택한 업체의 인테리어 상담 조건입니다.</span>
					</div>
				</div>

				{isLoading ? (
					<div className="interior-info-table">
						<Loading text={loadingText} />
					</div>
				) : interiorListCheck ? (
					<div className="interior-info-table">
						<TableMui
							selectedRow={selectedInterior}
							setSelectedRow={setSelectedInterior}
							rowData={interiorDisplayList}
							col={["c_name", "i_tag", "i_text"]}
							columns={["업체명", "정보 항목", "정보 내용"]}
							defaultRowPerPage={5}
							resetPageKey={`${selectedCompany}-${selectedInterior}`}
							pagination
						/>
					</div>
				) : selectedCompany ? (
					<div className="interior-info-guide">
						<p>아직 등록된 상세 정보가 없습니다.</p>
						<Button
							variant="contained"
							color="primary"
							onClick={() => handleTabChange("add")}
							disabled={isLoading}>
							등록
						</Button>
					</div>
				) : (
					<div className="interior-info-guide">
						<p>먼저 업체를 선택해 주세요.</p>
					</div>
				)}

				{!isLoading && interiorListCheck ? (
					<div className="interior-info-actions">
						<ButtonGroupMui
							button={interiorControlButtonGroupList}
							color="primary"
							variant="contained"
						/>
					</div>
				) : null}
			</section>

			{tabValue === "add" && (
				<Dialog
					className="interior-info-add-dialog"
					open={openAddDialog}
					onClose={() => setOpenAddDialog(false)}
					maxWidth={false}>

					<DialogContent>
						<InteriorAdd
							setOpenAddDialog={setOpenAddDialog}
							company={selectedCompany}
							onSuccess={async () => {
								setLoadingText("인테리어 정보를 다시 불러오는 중입니다...");
								await reLoadData();
								setOpenAddDialog(false);
							}}
						/>
					</DialogContent>
				</Dialog>
			)}
			{tabValue === "update" && (
				<Dialog
					className={`interior-info-update-dialog ${
						selectedInterior?.i_tag === "location" ? "location-mode" : ""
					}`}
					open={openUpdateDialog}
					onClose={() => setOpenUpdateDialog(false)}
					maxWidth={false}>
					<InteriorUpdate
						setOpenUpdateDialog={setOpenUpdateDialog}
						interiorInfo={selectedInterior}
						onSuccess={async () => {
							setLoadingText("인테리어 정보를 다시 불러오는 중입니다...");
							await reLoadData();
							setOpenUpdateDialog(false);
						}}
					/>
				</Dialog>
			)}
		</div>
	);
};

export default InteriorInfo;

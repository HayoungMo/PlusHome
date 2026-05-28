import React, { useEffect, useMemo, useState } from "react";
import { Button, Chip } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import TextFieldMui from "../components/TextFieldMui";
import RadioMui from "../components/RadioMui";
import TableMui from "../components/TableMui";
import CompanyService from "../service/companyService";
import ImageService from "../service/imageService";
import GetImgDir from "../resources/function/GetImgDir";
import AlertMui from "../components/AlertMui";
import DialogMui from "../components/DialogMui";
import "../css/DashboardCompany.css";

const makeCompanyKey = (row) => {
	if (!row) return "";
	return `${row.c_id}__${row.c_name}__${row.c_kind}`;
};

const getChangedCompanyPayload = (origin, edited) => {
	if (!origin || !edited) return null;

	const changedFields = {};
	Object.keys(edited).forEach((key) => {
		if (key === "rowIndex") return;
		if (edited[key] !== origin[key]) {
			changedFields[key] = edited[key];
		}
	});

	if (Object.keys(changedFields).length === 0) return null;

	return {
		c_id: origin.c_id,
		c_name: origin.c_name,
		c_kind: origin.c_kind,
		...changedFields,
	};
};

const CompanyInfo = ({ companyAddInfo, setCompanyAddInfo, refreshUserData }) => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData || "{}");
	const {
		id = "",
		name = "",
		addr = "",
		tel = "",
		email = "",
		companyList: initialCompanyList = [],
	} = userData;

	const initCompanyInfo = {
		c_id: id,
		c_name: "",
		c_kind: "",
		c_tel: "",
		c_addr: "",
		c_info: "",
		c_boss: "",
	};

	const initAlertInfo = {
		severity: "",
		title: "",
		text: "",
	};

	const radioList = [
		{ value: "shop", title: "쇼핑몰" },
		{ value: "interior", title: "인테리어" },
	];

	const [companyList, setCompanyList] = useState(initialCompanyList);
	const [imageList, setImageList] = useState([]);
	const [imageVersion, setImageVersion] = useState(0);

	const [tabValue, setTabValue] = useState("all");
	const [selectedCompany, setSelectedCompany] = useState(null);
	const [editForm, setEditForm] = useState(initCompanyInfo);
	const [isEditing, setIsEditing] = useState(false);

	const [addForm, setAddForm] = useState(initCompanyInfo);
	const [addLogoFile, setAddLogoFile] = useState(null);
	const [addLogoPreview, setAddLogoPreview] = useState(null);

	const [updateLogoFile, setUpdateLogoFile] = useState(null);
	const [updateLogoPreview, setUpdateLogoPreview] = useState(null);

	const [alertInfo, setAlertInfo] = useState(initAlertInfo);
	const [alertOpen, setAlertOpen] = useState(false);
	const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

	const companyAdd = companyAddInfo?.open;

	const showAlert = ({ severity, title, text }) => {
		setAlertInfo({ severity, title, text });
		setAlertOpen(true);
	};

	const applyFallbackCompanyList = () => {
		const latestUserData = JSON.parse(localStorage.getItem("user") || "{}");
		const fallbackCompanyList = latestUserData.companyList || [];

		setCompanyList(fallbackCompanyList);
		setSelectedCompany((prev) => {
			if (!prev) return null;

			const refreshedSelected = fallbackCompanyList.find(
				(row) => makeCompanyKey(row) === makeCompanyKey(prev),
			);

			return refreshedSelected || null;
		});

		return fallbackCompanyList;
	};

	const reloadDataFunc = async () => {
		if (!id) return { success: false, companyList: [] };

		try {
			const response = await CompanyService.reloadUserData(id);

			if (response.status === 200) {
				const { user, token } = response.data;

				if (!user) return;

				const serverCompanyList = user.companyList || [];
				const listWithImages = await Promise.all(
					serverCompanyList.map(async (item) => {
						const logo = await GetImgDir({
							kind: "LOGO",
							returnType: "list",
							a: item.c_id,
							b: item.c_kind,
							c: item.c_name,
							d: "Logo",
							view: false,
						});

						return logo;
					}),
				);

				setImageList(listWithImages);
				setCompanyList(serverCompanyList);
				localStorage.setItem("user", JSON.stringify(user));

				if (token) {
					localStorage.setItem("token", token);
				}

				refreshUserData?.();

				setSelectedCompany((prev) => {
					if (!prev) return null;

					const refreshedSelected = serverCompanyList.find(
						(row) => makeCompanyKey(row) === makeCompanyKey(prev),
					);

					return refreshedSelected || null;
				});

				return { success: true, companyList: serverCompanyList };
			}

			return { success: false, companyList: [] };
		} catch (error) {
			const fallbackCompanyList = applyFallbackCompanyList();
			showAlert({
				severity: "error",
				title: "데이터 갱신 실패",
				text: String(error),
			});
			return { success: false, companyList: fallbackCompanyList };
		}
	};

	const selectedImage = useMemo(() => {
		return imageList
			?.flatMap((logo) => logo?.result || [])
			.find(
				(item) =>
					item.dir_b === selectedCompany?.c_kind &&
					item.dir_c === selectedCompany?.c_name,
			);
	}, [imageList, selectedCompany]);

	const selectedLogoSrc = useMemo(() => {
		if (updateLogoPreview) return updateLogoPreview;
		return selectedImage ? `${selectedImage.img_name}?v=${imageVersion}` : "";
	}, [selectedImage, updateLogoPreview, imageVersion]);

	const filteredCompanyList = useMemo(() => {
		if (tabValue === "all") return companyList;
		return companyList.filter((company) => company.c_kind === tabValue);
	}, [companyList, tabValue]);

	const shopCount = companyList.filter((company) => company.c_kind === "shop").length;
	const interiorCount = companyList.filter((company) => company.c_kind === "interior").length;

	const resetAddForm = (kind = "") => {
		setAddForm({ ...initCompanyInfo, c_kind: kind });
		setAddLogoFile(null);
		setAddLogoPreview(null);
	};

	const resetUpdateLogo = () => {
		setUpdateLogoFile(null);
		setUpdateLogoPreview(null);
	};

	const handleTabChange = (kind) => {
		setTabValue(kind);
		setIsEditing(false);
		resetUpdateLogo();
		setSelectedCompany(null);
	};

	const handleSelectCompany = (row) => {
		setSelectedCompany(row);
		setIsEditing(false);
		resetUpdateLogo();
	};

	const handleEditFormChange = (e) => {
		const { name, value } = e.target;
		setEditForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleAddFormChange = (e) => {
		const { name, value } = e.target;
		setAddForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleAddLogoChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (addLogoPreview) URL.revokeObjectURL(addLogoPreview);

		setAddLogoFile(file);
		setAddLogoPreview(URL.createObjectURL(file));
		e.target.value = "";
	};

	const handleUpdateLogoChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (updateLogoPreview) URL.revokeObjectURL(updateLogoPreview);

		setUpdateLogoFile(file);
		setUpdateLogoPreview(URL.createObjectURL(file));
		e.target.value = "";
	};

	const insertCompanyLogo = async (company, file) => {
		if (!company || !file) return null;

		const result = await ImageService.insertImage([
			{
				img_kind: "LOGO",
				img_tag: "LOGO",
				dir_a: company.c_id,
				dir_b: company.c_kind,
				dir_c: company.c_name,
				dir_d: "Logo",
				img_idx: 0,
				file,
			},
		]);

		return result;
	};

	const updateCompanyLogo = async () => {
		if (!selectedCompany || !updateLogoFile) return null;

		if (selectedImage?.img_originalName) {
			return ImageService.updateImage([
				{
					file: updateLogoFile,
					name: selectedImage.img_originalName,
				},
			]);
		}

		return insertCompanyLogo(selectedCompany, updateLogoFile);
	};

	const validateCompanyForm = (form) => {
		if (!form.c_name?.trim()) return "업체명을 입력하세요.";
		if (!form.c_kind) return "업체 구분을 선택하세요.";
		if (!form.c_tel?.trim()) return "전화번호를 입력하세요.";
		if (!form.c_addr?.trim()) return "주소를 입력하세요.";
		if (!form.c_boss?.trim()) return "대표자명을 입력하세요.";
		return "";
	};

	const handleAddCompany = async () => {
		const validationMessage = validateCompanyForm(addForm);
		if (validationMessage) {
			showAlert({ severity: "warning", title: "입력 확인", text: validationMessage });
			return;
		}

		try {
			await CompanyService.insertCompany(addForm);
			let logoError = null;

			if (addLogoFile) {
				try {
					await insertCompanyLogo(addForm, addLogoFile);
				} catch (error) {
					logoError = error;
				}
			}

			const reloadResult = await reloadDataFunc();
			if (!reloadResult.success) return;

			setCompanyAddInfo?.({ open: false, type: addForm.c_kind });
			resetAddForm();
			setTabValue(addForm.c_kind || "all");
			setSelectedCompany(
				reloadResult.companyList.find(
					(company) => makeCompanyKey(company) === makeCompanyKey(addForm),
				) || reloadResult.companyList[0] || null,
			);

			if (logoError) {
				showAlert({
					severity: "warning",
					title: "등록 일부 완료",
					text: `업체 정보는 등록되었지만 로고 등록에 실패했습니다. ${String(logoError)}`,
				});
			} else {
				showAlert({
					severity: "success",
					title: "등록 성공",
					text: "업체 정보가 등록되었습니다.",
				});
			}
		} catch (error) {
			showAlert({
				severity: "error",
				title: "등록 실패",
				text: String(error),
			});
		}
	};

	const handleSaveCompany = async () => {
		if (!selectedCompany) {
			showAlert({ severity: "warning", title: "선택 확인", text: "수정할 업체를 선택하세요." });
			return;
		}

		const validationMessage = validateCompanyForm(editForm);
		if (validationMessage) {
			showAlert({ severity: "warning", title: "입력 확인", text: validationMessage });
			return;
		}

		try {
			const changedPayload = getChangedCompanyPayload(selectedCompany, editForm);
			let result = { success: true, message: "수정되었습니다." };

			if (changedPayload) {
				result = await CompanyService.updateCompany([changedPayload]);
			}

			if (result?.success === false) {
				showAlert({
					severity: "error",
					title: "수정 실패",
					text: result.message,
				});
				setSaveConfirmOpen(false);
				return;
			}

			let logoError = null;
			if (updateLogoFile) {
				try {
					const imageResult = await updateCompanyLogo();
					if (imageResult?.success === false || imageResult?.data?.success === false) {
						logoError = new Error(
							imageResult?.message || imageResult?.data?.message || "Logo update failed",
						);
					}
				} catch (error) {
					logoError = error;
				}
			}

			const reloadResult = await reloadDataFunc();
			if (!reloadResult.success) {
				setSaveConfirmOpen(false);
				return;
			}

			setImageVersion((prev) => prev + 1);
			setIsEditing(false);
			resetUpdateLogo();
			setSaveConfirmOpen(false);

			if (logoError) {
				showAlert({
					severity: "warning",
					title: "수정 일부 완료",
					text: `업체 정보는 수정되었지만 로고 변경에 실패했습니다. ${String(logoError)}`,
				});
			} else {
				showAlert({
					severity: "success",
					title: "수정 성공",
					text: result.message || "업체 정보가 수정되었습니다.",
				});
			}
		} catch (error) {
			showAlert({
				severity: "error",
				title: "수정 실패",
				text: String(error),
			});
			setSaveConfirmOpen(false);
		}
	};

	const handleDeleteCompany = async () => {
		if (!selectedCompany) {
			showAlert({ severity: "warning", title: "선택 확인", text: "삭제할 업체를 선택하세요." });
			return;
		}

		try {
			const deletePayload = { ...selectedCompany };
			delete deletePayload.rowIndex;
			const result = await CompanyService.deleteCompany([deletePayload]);

			if (result.success) {
				const reloadResult = await reloadDataFunc();
				if (!reloadResult.success) {
					setDeleteConfirmOpen(false);
					return;
				}

				setIsEditing(false);
				resetUpdateLogo();
				showAlert({
					severity: "success",
					title: "삭제 성공",
					text: result.message,
				});
			} else {
				showAlert({
					severity: "error",
					title: "삭제 실패",
					text: result.message,
				});
			}
		} catch (error) {
			showAlert({
				severity: "error",
				title: "삭제 실패",
				text: String(error),
			});
		}

		setDeleteConfirmOpen(false);
	};

	const startEdit = () => {
		if (!selectedCompany) {
			showAlert({ severity: "warning", title: "선택 확인", text: "수정할 업체를 선택하세요." });
			return;
		}

		setEditForm({ ...selectedCompany });
		resetUpdateLogo();
		setIsEditing(true);
	};

	const cancelEdit = () => {
		setEditForm(selectedCompany ? { ...selectedCompany } : initCompanyInfo);
		resetUpdateLogo();
		setIsEditing(false);
	};

	const openAddPanel = (kind = "") => {
		setCompanyAddInfo?.({ open: true, type: kind });
		resetAddForm(kind);
	};

	const closeAddPanel = () => {
		setCompanyAddInfo?.({ open: false, type: "" });
		resetAddForm();
	};

	useEffect(() => {
		reloadDataFunc();
	}, [id]);

	useEffect(() => {
		if (!selectedCompany) {
			setEditForm(initCompanyInfo);
			return;
		}

		setEditForm({ ...selectedCompany });
	}, [selectedCompany]);

	useEffect(() => {
		if (companyAddInfo?.open) {
			resetAddForm(companyAddInfo.type || "");
			if (companyAddInfo.type) setTabValue(companyAddInfo.type);
		}
	}, [companyAddInfo]);

	useEffect(() => {
		return () => {
			if (addLogoPreview) URL.revokeObjectURL(addLogoPreview);
			if (updateLogoPreview) URL.revokeObjectURL(updateLogoPreview);
		};
	}, [addLogoPreview, updateLogoPreview]);

	return (
		<div className="dashboard-company-page">
			<section className="dashboard-company-header">
				<div>
					<h3>내 사업체 관리</h3>
					<p>등록된 사업체 정보와 로고를 관리합니다.</p>
				</div>
				<div className="dashboard-company-summary">
					<Chip label={`전체 ${companyList.length}개`} variant="outlined" />
					<Chip label={`쇼핑몰 ${shopCount}개`} color="primary" variant="outlined" />
					<Chip label={`인테리어 ${interiorCount}개`} color="secondary" variant="outlined" />
				</div>
			</section>

			<section className="dashboard-company-card">
				<div className="dashboard-company-card-head">
					<strong>계정 정보</strong>
					<span>로그인한 기업 회원의 기본 정보입니다.</span>
				</div>
				<div className="dashboard-company-account-grid">
					<TextFieldMui label="아이디" value={id} disabled />
					<TextFieldMui label="이름" value={name} disabled />
					<TextFieldMui label="개인주소" value={addr} disabled />
					<TextFieldMui label="개인연락처" value={tel} disabled />
					<TextFieldMui label="이메일" value={email} disabled />
				</div>
			</section>

			<section className="dashboard-company-card">
				<div className="dashboard-company-card-head">
					<strong>사업체 목록</strong>
					<span>사업체를 선택하면 상세 정보 관리 영역이 열립니다.</span>
				</div>
				<div className="dashboard-company-toolbar">
					<Button
						variant={tabValue === "all" ? "contained" : "outlined"}
						onClick={() => handleTabChange("all")}
					>
						전체
					</Button>
					<Button
						variant={tabValue === "shop" ? "contained" : "outlined"}
						onClick={() => handleTabChange("shop")}
					>
						쇼핑몰
					</Button>
					<Button
						variant={tabValue === "interior" ? "contained" : "outlined"}
						onClick={() => handleTabChange("interior")}
					>
						인테리어
					</Button>
					<Button color="success" variant="contained" onClick={() => openAddPanel(tabValue === "all" ? "" : tabValue)}>
						사업체 등록
					</Button>
				</div>

				{filteredCompanyList.length > 0 ? (
					<div className="dashboard-company-table">
						<TableMui
							rowData={filteredCompanyList}
							col={["c_name", "c_kind", "c_tel", "c_addr", "c_boss"]}
							columns={["업체명", "구분", "연락처", "주소", "대표자"]}
							selectedRow={selectedCompany}
							setSelectedRow={handleSelectCompany}
						/>
					</div>
				) : (
					<div className="dashboard-company-empty">
						<p>등록된 사업체 데이터가 없습니다.</p>
						<Button variant="contained" onClick={() => openAddPanel(tabValue === "all" ? "" : tabValue)}>
							등록하기
						</Button>
					</div>
				)}
			</section>

			<section className="dashboard-company-card dashboard-company-detail-card">
				<div className="dashboard-company-card-head">
					<strong>선택 사업체 상세</strong>
					<span>연락처, 주소, 소개, 대표자명과 로고를 관리합니다.</span>
				</div>
				{selectedCompany ? (
					<div className="dashboard-company-detail">
						<div className="dashboard-company-profile">
							{selectedLogoSrc ? (
								<img src={selectedLogoSrc} alt="업체 로고" />
							) : (
								<div className="dashboard-company-logo-empty">
									Logo
								</div>
							)}
							<div className="dashboard-company-profile-text">
								<strong>{selectedCompany.c_name}</strong>
								<div>{selectedCompany.c_kind}</div>
								<div>{selectedCompany.c_addr}</div>
							</div>
						</div>

						<div className="dashboard-company-form-grid">
							<TextFieldMui name="c_name" label="업체명" value={editForm.c_name || ""} disabled />
							<TextFieldMui name="c_kind" label="업체 구분" value={editForm.c_kind || ""} disabled />
							<TextFieldMui
								name="c_tel"
								label="전화번호"
								value={editForm.c_tel || ""}
								disabled={!isEditing}
								onChange={isEditing ? handleEditFormChange : undefined}
							/>
							<TextFieldMui
								name="c_addr"
								label="주소"
								value={editForm.c_addr || ""}
								disabled={!isEditing}
								onChange={isEditing ? handleEditFormChange : undefined}
							/>
							<TextFieldMui
								name="c_info"
								label="소개"
								value={editForm.c_info || ""}
								disabled={!isEditing}
								onChange={isEditing ? handleEditFormChange : undefined}
							/>
							<TextFieldMui
								name="c_boss"
								label="대표자명"
								value={editForm.c_boss || ""}
								disabled={!isEditing}
								onChange={isEditing ? handleEditFormChange : undefined}
							/>
						</div>

						<div className="dashboard-company-actions">
							{isEditing ? (
								<>
									<Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
										로고 변경
										<input type="file" hidden onChange={handleUpdateLogoChange} />
									</Button>
									<Button color="primary" variant="contained" onClick={() => setSaveConfirmOpen(true)}>
										저장
									</Button>
									<Button color="inherit" variant="outlined" onClick={cancelEdit}>
										취소
									</Button>
								</>
							) : (
								<>
									<Button color="primary" variant="contained" onClick={startEdit}>
										수정
									</Button>
									<Button color="error" variant="contained" onClick={() => setDeleteConfirmOpen(true)}>
										삭제
									</Button>
								</>
							)}
						</div>
					</div>
				) : (
					<p className="dashboard-company-guide">
						{companyList.length > 0
							? "회사를 선택하면 상세 정보가 표시됩니다."
							: "등록된 사업체 데이터가 없습니다."}
					</p>
				)}
			</section>

			{companyAdd && (
				<section className="dashboard-company-card dashboard-company-create">
					<div className="dashboard-company-card-head">
						<strong>사업체 등록</strong>
						<span>새로 관리할 쇼핑몰 또는 인테리어 업체 정보를 입력합니다.</span>
					</div>
					<div className="dashboard-company-form-grid">
						<TextFieldMui
							onChange={handleAddFormChange}
							name="c_name"
							label="업체명"
							value={addForm.c_name || ""}
						/>
						<RadioMui
							label="업체 구분"
							name="c_kind"
							value={addForm.c_kind || ""}
							onChange={handleAddFormChange}
							labelList={radioList}
						/>
						<TextFieldMui
							onChange={handleAddFormChange}
							name="c_tel"
							label="전화번호"
							value={addForm.c_tel || ""}
						/>
						<TextFieldMui
							onChange={handleAddFormChange}
							name="c_addr"
							label="주소"
							value={addForm.c_addr || ""}
						/>
						<TextFieldMui
							onChange={handleAddFormChange}
							name="c_info"
							label="소개"
							value={addForm.c_info || ""}
						/>
						<TextFieldMui
							onChange={handleAddFormChange}
							name="c_boss"
							label="대표자명"
							value={addForm.c_boss || ""}
						/>
						<Button variant="contained" color="secondary" component="label">
							로고 등록
							<input type="file" hidden name="logoFileInput" onChange={handleAddLogoChange} />
						</Button>
					</div>
					{addLogoPreview && (
						<img
							src={addLogoPreview}
							alt="업체 로고 미리보기"
							className="dashboard-company-preview"
						/>
					)}
					<div className="dashboard-company-actions">
						<Button variant="contained" color="primary" onClick={handleAddCompany}>
							등록
						</Button>
						<Button color="error" variant="outlined" onClick={closeAddPanel}>
							취소
						</Button>
					</div>
				</section>
			)}

			{saveConfirmOpen && (
				<DialogMui
					open={saveConfirmOpen}
					onClose={() => setSaveConfirmOpen(false)}
					title="변경사항 저장"
					text="선택한 사업체 정보를 저장하시겠습니까?"
					buttons={[
						{
							title: "Cancel",
							color: "error",
							variant: "outlined",
							onClick: () => setSaveConfirmOpen(false),
						},
						{
							title: "Save",
							color: "primary",
							variant: "outlined",
							onClick: handleSaveCompany,
						},
					]}
				/>
			)}
			{deleteConfirmOpen && (
				<DialogMui
					open={deleteConfirmOpen}
					onClose={() => setDeleteConfirmOpen(false)}
					title="사업체 삭제"
					text="선택한 사업체를 삭제하시겠습니까? 삭제한 데이터는 복구할 수 없습니다."
					buttons={[
						{
							title: "Cancel",
							color: "error",
							variant: "outlined",
							onClick: () => setDeleteConfirmOpen(false),
						},
						{
							title: "Delete",
							color: "primary",
							variant: "outlined",
							onClick: handleDeleteCompany,
						},
					]}
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

export default CompanyInfo;

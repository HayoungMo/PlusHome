import React, { useEffect, useState } from "react";
import TextFieldMui from "../components/TextFieldMui";
import SwitchMui from "./../components/SwitchMui";
import { Button } from "@mui/material";
import RadioMui from "../components/RadioMui";
import CompanyService from "../service/CompanyService";

const CompanyInfo = ({ userData }) => {
	const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;

	const [companyAdd, setCompanyAdd] = useState(false);

	const [newCompanyInfo, setNewCompanyInfo] = useState({
		c_id: id,
		c_name: "",
		c_kind: "",
		c_tel: "",
		c_addr: "",
		c_info: "",
		c_boss: "",
	});

	const onChangeNewCompanyInfo = (e) => {
		const { name, value } = e.target;

		setNewCompanyInfo({
			...newCompanyInfo,
			[name]: value,
		});
	};

	const radioList = [
		{ value: "shop", title: "쇼핑몰" },
		{ value: "interior", title: "인테리어" },
	];

	const onClickAddNewCompany = async (e) => {
		console.log(e);
		console.log(newCompanyInfo);
		await CompanyService.insertImage(newCompanyInfo).then((res) => {
			reloadDataFunc();
		});
	};

	const reloadDataFunc = async () => {
		if (!id) return;

		try {
			const response = await CompanyService.reloadUserData(id);

			if (response.status === 200) {
				const { user, token } = response.data;

				if (!user || !token) return;

				localStorage.setItem("user", JSON.stringify(user));
				localStorage.setItem("token", token);

				debugger;
			}
		} catch (error) {
			console.error("유저 데이터 갱신 실패:", error);
		}
	};

	return (
		<div>
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
				}}>
				<TextFieldMui label="아이디" value={id} />
				<TextFieldMui label="이름" value={name} />
				<TextFieldMui label="개인주소" value={addr} />
				<TextFieldMui label="개인연락처" value={tel} />
				<TextFieldMui label="이메일" value={email} />
			</div>
			{companyList?.map((record, index) => {
				return (
					<div style={{ border: "1px solid black", display: "flex", flexWrap: "wrap" }}>
						<TextFieldMui label="업체명" value={record.c_name} />
						<TextFieldMui label="사무실 전화번호" value={record.c_tel} />
						<TextFieldMui label="업체 주소" value={record.c_addr} />
						<TextFieldMui label="사업주명" value={record.c_boss} />
					</div>
				);
			})}

			<SwitchMui checked={companyAdd} onChange={() => setCompanyAdd(!companyAdd)} />

			{companyAdd && (
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
					}}>
					<TextFieldMui
						onChange={onChangeNewCompanyInfo}
						name="c_name"
						label="업체명"
						value={newCompanyInfo.c_name}
					/>
					<RadioMui
						label="업체구분"
						name="c_kind"
						value={newCompanyInfo.c_kind}
						onChange={onChangeNewCompanyInfo}
						labelList={radioList}
					/>
					<TextFieldMui
						onChange={onChangeNewCompanyInfo}
						name="c_tel"
						label="전화번호"
						value={newCompanyInfo.c_tel}
					/>
					<TextFieldMui
						onChange={onChangeNewCompanyInfo}
						name="c_addr"
						label="주소"
						value={newCompanyInfo.c_addr}
					/>
					<TextFieldMui
						onChange={onChangeNewCompanyInfo}
						name="c_info"
						label="소개"
						value={newCompanyInfo.c_info}
					/>
					<TextFieldMui
						onChange={onChangeNewCompanyInfo}
						name="c_boss"
						label="사업주 명"
						value={newCompanyInfo.c_boss}
					/>

					<Button variant="contained" color="primary" onClick={onClickAddNewCompany}>
						ADD
					</Button>
				</div>
			)}
		</div>
	);
};

export default CompanyInfo;

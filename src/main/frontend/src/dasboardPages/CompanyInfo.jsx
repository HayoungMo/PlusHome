import React from "react";
import TextFieldMui from "../components/TextFieldMui";

const CompanyInfo = ({userData}) => {
	const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;

	// const { c_addr, c_boss, c_id, c_info, c_kind, c_name, c_tel } = companyList;
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
		</div>
	);
};

export default CompanyInfo;

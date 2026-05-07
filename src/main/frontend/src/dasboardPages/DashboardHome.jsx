import React from "react";
import TextFieldMui from "../components/TextFieldMui";

const DashboardHome = ({userData}) => {
	const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;
	//  c_addr, c_boss, c_id, c_info, c_kind, c_name, c_tel
	console.log(userData);
	console.log(companyList);

	return (
		<div>
			{name} 님의 사업체 정보
			{companyList?.map((record, index) => {
				return (
					<div>
						{index}
						<div>
							{record.c_kind} & {record.c_name}
						</div>
						<div>{record.c_addr}</div>
					</div>
				);
			})}
		</div>
	);
};

export default DashboardHome;

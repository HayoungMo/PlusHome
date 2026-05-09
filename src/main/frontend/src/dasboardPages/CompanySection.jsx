import React from "react";
import EmptyCompanyGuide from "./EmptyCompanyGuide";
import TableMuiEditable from "../components/TableMuiEditable";

const CompanySection = ({
	type,
	title,
	onAddClick,
	companyList = [],
	columns = [],
	onChange,
	updateAvailable = true,
	readOnlyColumns = [],
}) => {
	const filteredList = companyList.filter((company) => company.c_kind === type);

	return (
		<div style={{ marginTop: "24px" }}>
			<h2>{title}</h2>

			{filteredList.length > 0 ? (
				<TableMuiEditable
					rowData={filteredList}
					onChange={onChange}
					updateAvailable={updateAvailable}
					readOnlyColumns={readOnlyColumns}
					columns={columns}
				/>
			) : (
				<EmptyCompanyGuide type={type} onClick={onAddClick} />
			)}
		</div>
	);
};

export default CompanySection;

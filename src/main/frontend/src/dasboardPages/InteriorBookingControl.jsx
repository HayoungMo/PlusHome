import React, { useEffect, useState } from "react";
import BookingUpdate from "../components/BookingUpdate";
import TableMui from "../components/TableMui";

const InteriorBookingControl = () => {
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);
	const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;

	const interior = companyList.filter((data) => data.c_kind === "interior");
	const [selectedCompany, setSelectedCompany] = useState(null);
	const [interiorCompanyList, setInteriorCompanyList] = useState([]);

	const [selectedInvoice, setSelectedInvoice] = useState(null);

	const reLoadData = async () => {
		const setIndexToCompanyList = interior.map((record, index) => ({ ...record, id: index }));

		setSelectedCompany(null);
		setInteriorCompanyList(setIndexToCompanyList);
	};

	useEffect(() => {
		console.log(selectedCompany);
	}, [selectedCompany]);

	useEffect(() => {
		reLoadData();
	}, [id]);

	useEffect(() => {
		console.log('selectedInvoice ======================');
		console.log(selectedInvoice);
	}, [selectedInvoice]);

	return (
		<div>
			<TableMui
				selectedRow={selectedCompany}
				setSelectedRow={setSelectedCompany}
				rowData={interiorCompanyList}
			/>

			<BookingUpdate
				company={selectedCompany}
				selectedInvoice={selectedInvoice}
				setSelectedInvoice={setSelectedInvoice}
			/>
		</div>
	);
};

export default InteriorBookingControl;

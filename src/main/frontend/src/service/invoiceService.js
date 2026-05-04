import http from "../http-common";

const getInvoiceList = async (params) => {
	try {
		const res = await http.post("/interior/invoice", params);
		return res;
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

const getInvoiceDetailList = async (params) => {
	try {
		const res = await http.post("/interior/invoicedetails", params);
		return res;
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

const getCompanyInfo = async (params) => {
    try {
        const res = await http.post("/interior/getCompany", params);
		return res;
    } catch (error) {
        console.error("API Error:", error);
		throw error;
    }
}

const InvoiceService = { getInvoiceList, getInvoiceDetailList,getCompanyInfo };

export default InvoiceService;

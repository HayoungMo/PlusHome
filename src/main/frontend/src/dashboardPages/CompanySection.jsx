import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import EmptyCompanyGuide from "./EmptyCompanyGuide";
import TableMuiEditable from "../components/TableMuiEditable";

const CompanySection = ({
  // type,
  // title,
  // onAddClick,
  setCompanyAddInfo,
  newCompanyInfo,
  setNewCompanyInfo,
  initCompanyInfo,
  companyList = [],
  columns = [],
  onChange,
  updateAvailable = true,
  readOnlyColumns = [],
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowKey,
  selectedRow,
  setSelectedRow,
}) => {
  const [tabValue, setTabValue] = useState("shop");

  // const filteredList = companyList.filter((company) => company.c_kind === type);
  const filteredList = companyList.filter((row) => {
    if (tabValue === "all") return true;
    return row.c_kind === tabValue;
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const tabTitle = [
    { label: "전체", value: "all" },
    { label: "쇼핑몰", value: "shop" },
    { label: "인테리어", value: "interior" },
  ];

  return (
    <div className="company-section">
      <Box className="company-section-tabs" sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="전체" value="all" />
          <Tab label="쇼핑몰" value="shop" />
          <Tab label="인테리어" value="interior" />
        </Tabs>
      </Box>

      <h2 className="company-section-title">{tabTitle.filter((item) => item.value === tabValue)[0].label}</h2>

      {/* <h2>{title}</h2> */}

      {filteredList.length > 0 ? (
        <TableMuiEditable
          rowData={filteredList}
          onChange={onChange}
          updateAvailable={updateAvailable}
          readOnlyColumns={readOnlyColumns}
          columns={columns}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
        />
      ) : (
        <EmptyCompanyGuide
          type={tabValue}
          onClick={() => {
            setCompanyAddInfo({ open: true, type: tabValue });
            setNewCompanyInfo({ ...initCompanyInfo, c_kind: tabValue });
          }}
        />
      )}
    </div>
  );
};

export default CompanySection;

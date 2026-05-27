import React, { useEffect, useMemo, useState } from "react";
import TextFieldMui from "../components/TextFieldMui";
import SwitchMui from "./../components/SwitchMui";
import { Button } from "@mui/material";
import RadioMui from "../components/RadioMui";
import CompanyService from "../service/companyService";
import AlertMui from "../components/AlertMui";
import DialogMui from "../components/DialogMui";
import CompanySection from "./CompanySection";
import ImageService from "../service/imageService";
import GetImgDir from "../resources/function/GetImgDir";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";


const CompanyInfo = (props) => {
  const localUserData = localStorage.getItem("user");
  const userData = JSON.parse(localUserData);
  const { addr, birth, code, email, gender, id, name, tel, type, companyList } =
    userData;
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

  const [alertInfo, setAlertInfo] = useState(initAlertInfo);

  const { companyAddInfo, setCompanyAddInfo, refreshUserData } = props;

  const companyAdd = companyAddInfo.open;

  const [companyUpdate, setCompanyUpdate] = useState(false);

  const [companyStateList, setCompanyStateList] = useState([]);
  const [editedCompanyList, setEditedCompanyList] = useState([]);
  const [selectedCompanyKeys, setSelectedCompanyKeys] = useState([]);

  const [newCompanyInfo, setNewCompanyInfo] = useState(initCompanyInfo);

  const [alertOpen, setAlertOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewDir, setPreviewDir] = useState(null);

  const [imageList, setImageList] = useState();
  const [selectedRow, setSelectedRow] = useState();
  const [imageVersion, setImageVersion] = useState(0);
  const [pendingLogoUpdate, setPendingLogoUpdate] = useState(null);

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
    try {
      const res = await CompanyService.insertCompany(newCompanyInfo);
      changeCompnayLogo();
      await reloadDataFunc();
      setCompanyAddInfo({
        open: false,
        type: newCompanyInfo.c_kind,
      });

      setNewCompanyInfo(initCompanyInfo);

      setAlertInfo({
        severity: "success",
        title: "등록 성공",
        text: "업체 정보가 등록되었습니다.",
      });

      setAlertOpen(!alertOpen);
    } catch (error) {
      setAlertInfo({
        severity: "error",
        title: "등록 실패",
        text: String(error),
      });

      setAlertOpen(!alertOpen);
    }
  };

  const reloadDataFunc = async () => {
    if (!id) return;
    console.log(" @ reloadDataFunc @");

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

        localStorage.setItem("user", JSON.stringify(user));

        if (token) {
          localStorage.setItem("token", token);
        }
        refreshUserData?.();
        setCompanyStateList(serverCompanyList);

        setEditedCompanyList((prevEditedList) => {
          if (prevEditedList.length === 0) {
            return serverCompanyList;
          }

          return mergeEditedListWithServerList(
            serverCompanyList,
            prevEditedList,
          );
        });
      }
    } catch (error) {
      console.error("유저 데이터 갱신 실패:", error);
    }
  };

  const handleRowUpdateInTable = async () => {
    const changedRows = getChangedRowsDetail(
      companyStateList,
      editedCompanyList,
    );

    try {
      console.log(changedRows);
      let result = { success: true, message: "수정되었습니다." };

      if (changedRows.length > 0) {
        result = await CompanyService.updateCompany(changedRows);
      }

      if (result.success && pendingLogoUpdate?.file && pendingLogoUpdate?.image) {
        const imageResult = await ImageService.updateImage([
          {
            file: pendingLogoUpdate.file,
            name: pendingLogoUpdate.image.img_originalName,
          },
        ]);

        if (imageResult?.success === false) {
          throw new Error("Image update failed");
        }
      }

      if (result.success) {
        setAlertInfo({
          severity: "success",
          title: "수정 성공",
          text: result.message,
        });
      } else {
        setAlertInfo({
          severity: "error",
          title: "수정 실패",
          text: result.message,
        });
      }
      console.log(result);
    } catch (error) {
      setAlertInfo({
        severity: "error",
        title: "에러 발생",
        text: error,
      });
      console.log(error);
    }
    await reloadDataFunc();
    setImageVersion((prev) => prev + 1);
    setPendingLogoUpdate(null);

    setConfirmOpen(!confirmOpen);
    setAlertOpen(!alertOpen);
  };

  const selectedImage = useMemo(() => {
    return imageList
      ?.flatMap((logo) => logo?.result || [])
      .find(
        (item) =>
          item.dir_b === selectedRow?.c_kind &&
          item.dir_c === selectedRow?.c_name,
      );
  }, [imageList, selectedRow]);

  const handleRowDeleteInTable = async () => {
    const selectedCompanyList = editedCompanyList.filter((row) =>
      selectedCompanyKeys.includes(makeCompanyKey(row)),
    );
    try {
      const result = await CompanyService.deleteCompany(selectedCompanyList);
      if (result.success) {
        setAlertInfo({
          severity: "success",
          title: "삭제 성공",
          text: result.message,
        });
      } else {
        setAlertInfo({
          severity: "error",
          title: "삭제 실패",
          text: result.message,
        });
      }
      console.log(result);
    } catch (error) {
      setAlertInfo({
        severity: "error",
        title: "에러 발생",
        text: error,
      });
      console.log(error);
    }
    reloadDataFunc();
    setDeleteConfirmOpen(!deleteConfirmOpen);
    setAlertOpen(!alertOpen);
  };

  const makeCompanyKey = (row) => {
    return `${row.c_id}__${row.c_name}__${row.c_kind}`;
  };

  const getChangedRowsDetail = (originRows, editedRows) => {
    return editedRows
      .map((editedRow) => {
        const originRow = originRows.find(
          (originRow) =>
            makeCompanyKey(originRow) === makeCompanyKey(editedRow),
        );

        if (!originRow) return null;

        const changedFields = {};

        Object.keys(editedRow).forEach((key) => {
          if (editedRow[key] !== originRow[key]) {
            changedFields[key] = editedRow[key];
          }
        });

        if (Object.keys(changedFields).length === 0) {
          return null;
        }

        return {
          c_id: editedRow.c_id,
          c_name: editedRow.c_name,
          c_kind: editedRow.c_kind,
          ...changedFields,
        };
      })
      .filter(Boolean);
  };

  const tableMuiEditableOnChange = (data) => {
    setEditedCompanyList((prevList) => {
      return prevList.map((prevRow) => {
        const updatedRow = data.find(
          (row) => makeCompanyKey(row) === makeCompanyKey(prevRow),
        );
        return updatedRow ? updatedRow : prevRow;
      });
    });
  };

  const mergeEditedListWithServerList = (serverList, editedList) => {
    return serverList.map((serverRow) => {
      const editedRow = editedList.find(
        (row) => makeCompanyKey(row) === makeCompanyKey(serverRow),
      );

      return editedRow ? editedRow : serverRow;
    });
  };

  const changeCompnayLogo = async () => {
    const logoFile =
      document.getElementsByName("logoFileInput")?.[0].files?.[0];
    if (!logoFile) {
      return;
    }
    const selectedCompanyList = editedCompanyList.filter((row) =>
      selectedCompanyKeys.includes(makeCompanyKey(row)),
    );
    if (selectedCompanyList.length === 0) {
      setAlertInfo({
        severity: "error",
        title: "오류",
        text: "선택된 데이터가 없습니다",
      });
      setAlertOpen(!alertOpen);
    } else if (selectedCompanyList.length > 1) {
      setAlertInfo({
        severity: "error",
        title: "오류",
        text: "선택된 데이터가 많습니다",
      });
      setAlertOpen(!alertOpen);
    }

    debugger;
    const dto = [
      {
        img_kind: "LOGO",
        img_tag: "LOGO",
        dir_a: newCompanyInfo.c_id,
        dir_b: newCompanyInfo.c_kind,
        dir_c: newCompanyInfo.c_name,
        dir_d: "Logo",
        img_idx: 0,
        file: logoFile,
      },
    ];

    const result = await ImageService.insertImage(dto);

    if (result.data.success) {
      setAlertInfo({
        severity: result.data.success ? "success" : "error",
        title: result.data.success ? "등록 성공" : "등록 실패",
        text: result.data.success
          ? "Logo 등록에 성공하였습니다"
          : "Logo 등록에 실패하였습니다",
      });
      setAlertOpen(true);
    }
  };

  const onChangeLogoPreview = (item, e) => {
    const file = e.target.files?.[0];

    if (!item?.img_name || !file) {
      return;
    }

    setPendingLogoUpdate((prev) => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }

      return {
        image: item,
        file,
        previewUrl: URL.createObjectURL(file),
      };
    });

    e.target.value = "";
  };

  const getSelectedImageSrc = () => {
    if (
      pendingLogoUpdate?.previewUrl &&
      pendingLogoUpdate?.image?.img_originalName === selectedImage?.img_originalName
    ) {
      return pendingLogoUpdate.previewUrl;
    }

    return selectedImage ? `${selectedImage.img_name}?v=${imageVersion}` : "";
  };

  const dialogConfirmButtonList = [
    {
      title: "Cancel",
      color: "error",
      variant: "outlined",
      onClick: () => setConfirmOpen(!confirmOpen),
    },
    {
      title: "Save",
      color: "primary",
      variant: "outlined",
      onClick: () => handleRowUpdateInTable(),
    },
  ];

  const dialogDeleteConfirmButtonList = [
    {
      title: "Cancel",
      color: "error",
      variant: "outlined",
      onClick: () => setDeleteConfirmOpen(!deleteConfirmOpen),
    },
    {
      title: "Save",
      color: "primary",
      variant: "outlined",
      onClick: () => handleRowDeleteInTable(),
    },
  ];

  useEffect(() => {
    reloadDataFunc();
  }, [id]);

  useEffect(() => {
    if (companyAddInfo.open) {
      setNewCompanyInfo({
        ...initCompanyInfo,
        c_kind: companyAddInfo.type,
      });
    }
  }, [companyAddInfo]);

  useEffect(() => {}, [selectedCompanyKeys]);

  useEffect(() => {
    const currentKeys = editedCompanyList.map((row) => makeCompanyKey(row));

    setSelectedCompanyKeys((prevKeys) =>
      prevKeys.filter((key) => currentKeys.includes(key)),
    );
  }, [editedCompanyList]);

  useEffect(() => {
    return () => {
      if (pendingLogoUpdate?.previewUrl) {
        URL.revokeObjectURL(pendingLogoUpdate.previewUrl);
      }
    };
  }, [pendingLogoUpdate]);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <TextFieldMui label="아이디" value={id} />
        <TextFieldMui label="이름" value={name} />
        <TextFieldMui label="개인주소" value={addr} />
        <TextFieldMui label="개인연락처" value={tel} />
        <TextFieldMui label="이메일" value={email} />
      </div>
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <SwitchMui
          label="Update"
          checked={companyUpdate}
          onChange={() => setCompanyUpdate(!companyUpdate)}
        />
        {companyUpdate && (
          <>
            <Button
              color="secondary"
              variant="outlined"
              onClick={() => setConfirmOpen(!confirmOpen)}
            >
              Save
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => {
                const selectedCompanyList = editedCompanyList.filter((row) =>
                  selectedCompanyKeys.includes(makeCompanyKey(row)),
                );
                if (selectedCompanyList.length === 0) {
                  setAlertInfo({
                    severity: "error",
                    title: "오류",
                    text: "선택된 데이터가 없습니다",
                  });
                  setAlertOpen(!alertOpen);
                } else setDeleteConfirmOpen(!deleteConfirmOpen);
              }}
            >
              Delete
            </Button>
          </>
        )}
        {selectedRow && selectedImage &&  (
          <>
            <img
              src={getSelectedImageSrc()}
              alt="업체 로고"
            />
            {companyUpdate && (
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
              >
                교체할 파일 업로드
                <input
                  type="file"
                  hidden
                  name={selectedImage.img_name}
                  className="updateFile"
                  onChange={(e) => onChangeLogoPreview(selectedImage, e)}
                />
              </Button>
            )}
          </>
        )}
      </div>
      <CompanySection
        setCompanyAddInfo={setCompanyAddInfo}
        newCompanyInfo={newCompanyInfo}
        setNewCompanyInfo={setNewCompanyInfo}
        initCompanyInfo={initCompanyInfo}
        companyList={editedCompanyList}
        onChange={tableMuiEditableOnChange}
        updateAvailable={companyUpdate}
        readOnlyColumns={["id", "c_id", "c_name", "c_kind"]}
        selectable={true}
        selectedRows={selectedCompanyKeys}
        onSelectionChange={setSelectedCompanyKeys}
        getRowKey={makeCompanyKey}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
      />

      {companyAdd && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            border: "1px solid black",
            margin: "15px",
            padding: "15px",
          }}
        >
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
          <Button variant="contained" color="secondary" component="label">
            이미지 등록
            <input
              type="file"
              hidden
              name="logoFileInput"
              onChange={(e) => {
                const file = e.target.files?.[0];
                const previewUrl = URL.createObjectURL(file);
                setPreviewDir(previewUrl);
              }}
            />
          </Button>
          <img src={previewDir} alt="Company_logo_preview" />

          <Button
            variant="contained"
            color="primary"
            onClick={onClickAddNewCompany}
          >
            ADD
          </Button>
        </div>
      )}
      {companyAdd ? (
        <Button
          color="error"
          variant="contained"
          onClick={() => {
            setCompanyAddInfo({ open: false, type });
            setNewCompanyInfo(initCompanyInfo);
          }}
        >
          Cancel
        </Button>
      ) : (
        <Button
          color="primary"
          variant="contained"
          onClick={() => setCompanyAddInfo({ open: true, type: "" })}
        >
          ADD
        </Button>
      )}
      {confirmOpen && (
        <DialogMui
          open={confirmOpen}
          onClose={() => setConfirmOpen(!confirmOpen)}
          title="Save changes?"
          text="Unsaved changes will be lost. Save now"
          buttons={dialogConfirmButtonList}
        />
      )}
      {deleteConfirmOpen && (
        <DialogMui
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(!deleteConfirmOpen)}
          title="Data delete?"
          text="Are you sure? Once deleted, this data cannot be recovered."
          buttons={dialogDeleteConfirmButtonList}
        />
      )}
      {alertOpen && (
        <AlertMui
          severity={alertInfo?.severity}
          variant="standard"
          title={alertInfo?.title}
          text={alertInfo?.text}
          onClose={() => setAlertOpen(!alertOpen)}
          autoHideDuration={3000}
          icon={true}
        />
      )}
    </div>
  );
};

export default CompanyInfo;

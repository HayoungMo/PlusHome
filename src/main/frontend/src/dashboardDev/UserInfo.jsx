import React, { useEffect, useState } from 'react';
import userService from '../service/userService';
import TableMui from '../components/TableMui';
import { Button } from '@mui/material';
import TableChkMui from '../components/TableChkMui';
import SwitchMui from '../components/SwitchMui';
import DialogMui from '../components/DialogMui';

const UserInfo = (props) => {
    const localUserData = localStorage.getItem("user");
    const userData= JSON.parse(localUserData) 
    const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;

   


    const initUserInfo = {
		id: id,
		name: "",
		type: "",
		tel: "",
		addr: "",
	};

    const initAlertInfo = {
		severity: "",
		title: "",
		text: "",
	};

    const [userList,setUserList] = useState([]);

    const [alertInfo,setAlertInfo] = useState(initAlertInfo);

    const { userAddInfo ={}, setUserAddInfo, refreshUserData } = props;

    const userAdd = userAddInfo.open;

    const [userUpdate,setUserUpdate] = useState(false);

    const [userStateList,setUserStateList] = useState([]);
    const [editedUserList,setEditedUserList] = useState([]);
    const [selectedUserKeys,setSelectedUserKeys] = useState([]);

    const [newUserInfo,setNewUserInfo] = useState(initUserInfo);

    const [alertOpen,setAlertOpen] = useState(false)
    const [deleteConfirmOpen,setDeleteConfirmOpen]=useState(false)
    const [confirmOpen,setConfirmOpen] = useState(false)
    const [restoreConfirmOpen,setRestoreConfirmOpen] = useState(false)

    const [userType,setUserType] = useState("user");

    const onChangeNewUserInfo = (e) =>{
        const {name,value} = e.target;

        setNewUserInfo({
            ...newUserInfo,
            [name]:value,
        })

    }

    const userColumns = [
    "id",
    "type",
    "code",
    "name",
    "email",
    "tel",
    "gender",
    "addr",
];

const companyColumns = [
    "id",
    "type",
    "code",
    "name",
    "email",

    "c_name",
    "c_kind",
    "c_info",
    "c_boss",
];

    

   
    const getUserList = async() =>{
        
        console.log("회원 조회")      
        

       const res = await userService.userGetAll(userType)
        console.log(res)

        if(res.success){
            
            setUserList(res.list)
            
            setUserStateList(res.list);

            setEditedUserList(res.list)

            console.log("유저조회결과:",res.list)


        }
        
    } 

    useEffect(()=>{
        getUserList();
    },[userType])

    
    const isAdmin = type ==='admin'

    useEffect(() =>{
        if(!isAdmin){
            alert("관리자만 접근 가능합니다.")
            
            window.location.href = "/";
        }
    },[])

    const handleRowDeleteInTable = async() =>{

        console.log("선택된 키")
        console.log(selectedUserKeys)

        console.log("삭제 전")
        console.log(userList)        

           const selectedUserList = userList.filter(
        (row) => selectedUserKeys.includes((row.id))
    );

    console.log("삭제 대상")
    console.log(selectedUserList)

    const filterdList = userList.filter((row)=> ! selectedUserKeys.includes((row.id)))

    console.log("삭제 후")
    console.log(filterdList)


    try {
        const result = await userService.deleteUser(selectedUserList)

        console.log(result)

        if(result.success){
            setAlertInfo({
                severity:"success",
                title:"삭제 성공",
                text:result.message,
            })
        }else{
            setAlertInfo({
                severity:"error",
                title:"삭제 실패",
                text:result.message,

            })
        }
        getUserList();
        console.log(result)

    } catch (error) {
        setAlertInfo({
            severity:"error",
            title:"에러 발생",
            text:error,
        })
        console.log(error)
    }
    
    setDeleteConfirmOpen(!deleteConfirmOpen)
    setAlertOpen(!alertOpen)
}

    const reloadDataFunc = async() =>{
        if(!id) return
        console.log("reloadDataFunc함수함수")

        try {
            const res = await userService.userGetAll(userType);

            if(res.success){
                setUserList(res.list)
                setUserStateList(res.list)
                setEditedUserList(res.list)                           

					
            }
		} catch (error) {
			console.error("유저 데이터 갱신 실패:", error);
		}
	};

   


    const handleRowRestoreInTable = async() =>{
       console.log("선택된 키")
        console.log(selectedUserKeys)

        console.log("복구 전")
        console.log(userList)        

           const selectedUserList = userList.filter(
        (row) => selectedUserKeys.includes((row.id))
    );

    console.log("복구 대상")
    console.log(selectedUserList)

    const filterdList = userList.filter((row)=> ! selectedUserKeys.includes((row.id)))

    console.log("복구 후")
    console.log(filterdList)


    try {
        const result = await userService.restoreUser(selectedUserList)

        console.log(result)

        if(result.success){
            setAlertInfo({
                severity:"success",
                title:"복구 성공",
                text:result.message,
            })
        }else{
            setAlertInfo({
                severity:"error",
                title:"복구 실패",
                text:result.message,

            })
        }
        getUserList();
        console.log(result)

    } catch (error) {
        setAlertInfo({
            severity:"error",
            title:"에러 발생",
            text:error,
        })
        console.log(error)
    }
    setRestoreConfirmOpen(false)
    setAlertOpen(true)
}




 const handleRowUpdateInTable = async() =>{
        const changedRows = getChangedRowsDetail(
            userStateList, editedUserList
        )
        try {
            console.log("changedRows",changedRows)

            let result = null

           if(userType==="user"){
            result = await userService.updateUser(changedRows)
           }
         else if(userType==="company"){        
            
            //users테이블
            await userService.updateUser(changedRows)

            //company테이블
            const companyRows = changedRows.map((row)=>({

                c_id: row.id ||  "",
                c_name:row.name || "",
                c_tel: row.tel || "",
                c_addr: row.addr || "",
                c_kind: row.c_kind || "",
                c_info: row.c_info || row.info || "",
               c_boss: row.c_boss || "",

            }))

            console.log("companyRows:",companyRows)

            result = await userService.updateCompany(companyRows)
         }

            if(result.success){
                setAlertInfo({
                    severity:"success",
                    title:"수정 성공",
                    text:result.message,
                })
            }else{
                setAlertInfo({
                    severity:"error",
                    title:"수정 실패",
                    text:result.message,
                })
            }
            console.log(result)

        } catch (error) {
            setAlertInfo({
                severity:"error",
                title:"에러 발생",
                text:error,
            })
            console.log(error)
            
        }

        await getUserList();
        console.log("재조회 완료")
        
        setConfirmOpen(!confirmOpen)
        setAlertOpen(!alertOpen)
    }

   

    const getChangedRowsDetail= (originRows,editedRows) =>{
        return editedRows
        .map((editedRow) =>{
            
            const rowKey = editedRow.id || editedRow.c_id

            const originRow = originRows.find(
                (originRow) =>
        (originRow.id || originRow.c_id)
        === rowKey
            )

            if(!originRow) return null

            const changedFields = {};

            Object.keys(editedRow).forEach((key)=>{
                if(editedRow[key] !== originRow[key]){
                    changedFields[key] = editedRow[key]
                }
            })

            if(Object.keys(changedFields).length===0){
                return null
            }

            return{
                id:editedRow.id,
                c_id:editedRow.c_id || editedRow.id,
                name:editedRow.name,
                type:editedRow.type,
                ...changedFields,
            }

        })
        .filter(Boolean)
    }

    const tableMuiEditableOnChange = (data) =>{
        setEditedUserList((prevList) =>{
            return prevList.map((prevRow) =>{
                const updatedRow = data.find(
                    (row) =>  (row.id || row.c_id)
                    ===
                    (prevRow.id || prevRow.c_id)
                )
                return updatedRow ? updatedRow : prevRow
            })
        })
    }

    const mergeEditedListWithServerList = (serverList, editedList) => {
            return serverList.map((serverRow) => {
                const editedRow = editedList.find(
                    (row) => row.id === serverRow.id,
                );
    
                return editedRow ? editedRow : serverRow;
            });
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

        const dialogRestoreConfirmButtonList =[
            {
                title: "cancel",
                color: "error",
                variant: "outlined",
                onClick: ()=>
                    setRestoreConfirmOpen(
                        !restoreConfirmOpen
                    )
            },
            {
                title: "Restore",
                color: "primary",
                variant: "outlined",
                onClick: ()=>
                    handleRowRestoreInTable(),

            }
        ]
    
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

        useEffect(()=>{
            if(userAddInfo.open) {
                setNewUserInfo({
                    ...initUserInfo,
                    type:userAddInfo.type,
                })
            }
        },[userAddInfo])

        useEffect(()=>{},[selectedUserKeys])

        useEffect(()=>{
            const currentKeys = editedUserList.map((row)=>row.id)

            setSelectedUserKeys((prevKeys) => prevKeys.filter((key) => currentKeys.includes(key)))
        },[editedUserList])
        
        
       

    return (
    <div>

        <div>

            <Button
                color='primary'
                variant='contained'
                onClick={() => setUserType("user")}>
                user
            </Button>

            <Button
                color='primary'
                variant='contained'
                onClick={() => setUserType("company")}>
                company
            </Button>

        </div>

        <div
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center"
            }}
        >

            <SwitchMui
                label="Update"
                checked={userUpdate}
                onChange={() => setUserUpdate(!userUpdate)}
            />

            {userUpdate && (
                <>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => setConfirmOpen(!confirmOpen)}>
                        저장하기
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={() =>
                            setDeleteConfirmOpen(
                                !deleteConfirmOpen
                            )
                        }>
                        삭제하기
                    </Button>

                    {deleteConfirmOpen && (
                        <DialogMui
                            open={deleteConfirmOpen}
                            onClose={() =>
                                setDeleteConfirmOpen(
                                    !deleteConfirmOpen
                                )
                            }
                            title="Delete User"
                            text="사용자를 삭제하시겠습니까?"
                            buttons={dialogDeleteConfirmButtonList}
                        />
                    )}

                    <Button
                        color='inherit'
                        variant='outlined'
                        onClick={() =>
                            setRestoreConfirmOpen(
                                !restoreConfirmOpen
                            )
                        }>
                        복구하기
                    </Button>

                    {restoreConfirmOpen && (
                        <DialogMui
                            open={restoreConfirmOpen}
                            onClose={() =>
                                setRestoreConfirmOpen(
                                    !restoreConfirmOpen
                                )
                            }
                            title="Restore User"
                            text="선택된 사용자를 복구하시겠습니까?"
                            buttons={dialogRestoreConfirmButtonList}
                        />
                    )}

                    {confirmOpen && (
    <DialogMui
        open={confirmOpen}
        onClose={() =>
            setConfirmOpen(!confirmOpen)
        }
        title="Update User"
        text="사용자 정보를 수정하시겠습니까?"
        buttons={dialogConfirmButtonList}
    />
)}




                </>
            )}
        </div>

        <div>

            {userList.length !== 0 ? (

                <TableChkMui
                    rowData={editedUserList}

                    columns = {
                        userType ==="user"
                        ? userColumns
                        : companyColumns
                    }

                    editable={userUpdate}
                    editableOnChange={tableMuiEditableOnChange}
                    setSelectedKeys={setSelectedUserKeys}
                    selectedKeys={selectedUserKeys}
                />

            ) : (

                <div>등록된 회원이 없습니다.</div>

            )}

        </div>

    </div>
);
};

export default UserInfo;
import React, { useEffect, useState } from 'react';
import userService from '../service/userService';
import TableMui from '../components/TableMui';
import { Button } from '@mui/material';
import TableChkMui from '../components/TableChkMui';



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

    const [useStateList,setUserStateList] = useState([]);
    const [editedUserList,setEditedUserList] = useState([]);
    const [selectedUserKeys,setSelectedUserKeys] = useState([]);

    const [newUserInfo,setNewUserInfo] = useState(initUserInfo);

    const [alertOpen,setAlertOpen] = useState(false)
    const [deleteConfirmOpen,setDeleteConfirmOpen]=useState(false)
    const [confirmOpen,setConfirmOpen] = useState(false)

    const onChangeNewUserInfo = (e) =>{
        const {name,value} = e.target;

        setNewUserInfo({
            ...newUserInfo,
            [name]:value,
        })

    }

    

   
    const getUserList = async() =>{
        
        console.log("회원 조회")      

       const res = await userService.userGetAll()
        console.log(res)

        if(res.success){
            setUserList(res.list)
        }
        
    } 

    useEffect(()=>{
        getUserList();
    },[])

    const handleRowDeleteInTable = async() =>{

        console.log("선택된 키")
        console.log(selectedUserKeys)

        console.log("삭제 전")
        console.log(userList)        

           const selectedUserList = userList.filter(
        (row) => !selectedUserKeys.includes(makeUserKey(row))
    );

    console.log("삭제 후")
    console.log(selectedUserList)

    setUserList(selectedUserList)

    try {
        const result = await userService.deleteUser(selectedUserList)
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

    

    const makeUserKey = (row) =>{
        return `${row.id}_${row.name}_${row.type}`
    }

    const getChangedRowsDetail= (originRows,editedRows) =>{
        return editedRows
        .map((editedRow) =>{
            const originRow = originRows.find(
                (originRow) => makeUserKey(originRow) === makeUserKey(editedRow),
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
                    (row) => makeUserKey(row) ===makeUserKey(prevRow),
                )
                return updatedRow ? updatedRow : prevRow
            })
        })
    }

    const mergeEditedListWithServerList = (serverList, editedList) => {
            return serverList.map((serverRow) => {
                const editedRow = editedList.find(
                    (row) => makeUserKey(row) === makeUserKey(serverRow),
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
            // {
            //     title: "Save",
            //     color: "primary",
            //     variant: "outlined",
            //     onClick: () => handleRowUpdateInTable(),
            // },
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
            const currentKeys = editedUserList.map((row)=> makeUserKey(row))

            setSelectedUserKeys((prevKeys) => prevKeys.filter((key) => currentKeys.includes(key)))
        },[editedUserList])    
       

    return (
        <div>
            
             <Button
				color="error"
				variant="contained"
				onClick={handleRowDeleteInTable}>
				Delete
			</Button>


           
            <div>
			{userList.length !== 0 ? (

                <TableChkMui rowData={userList}
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
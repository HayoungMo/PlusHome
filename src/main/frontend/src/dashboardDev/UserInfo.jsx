import React, { useEffect, useState } from 'react';
import userService from '../service/userService';
import TableMui from '../components/TableMui';
import { Box, Button, Tab, Tabs } from '@mui/material';
import TableChkMui from '../components/TableChkMui';
import SwitchMui from '../components/SwitchMui';
import DialogMui from '../components/DialogMui';
import SelectMui from '../components/SelectMui';
import TextFieldMui from '../components/TextFieldMui';
import AlertMui from '../components/AlertMui';

const UserInfo = (props) => {
    const localUserData = localStorage.getItem("user");
    const userData= JSON.parse(localUserData) 
    const { addr, birth, code, email, gender, id, name, tel, type, companyList } = userData;

   const tabTitle = [

    {
        label:"일반 유저",
        value:"user"
    },

    {
        label:"기업 유저",
        value:"company"
    }

]

    const [tabValue,setTabValue] = useState("user")

   


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


    const [searchInfo,setSearchInfo] = useState({})

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
    "joined",
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

    "joined",
];

    

   
    const getUserList = async() =>{
        
        console.log("회원 조회")      
        

       const res = await userService.userGetAll(userType)
        console.log(res)
        console.table("리스트 찍히는지 확인",res.list)

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

    let oneTimeCheck = 0;

    useEffect(() =>{
        if(!isAdmin){
            if(oneTimeCheck <= 0)
            alert("관리자만 접근 가능합니다.")
            
            oneTimeCheck++;
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

    console.log("선택된 키",selectedUserKeys)
    console.log("선택된 키",selectedUserKeys)

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
            await reloadDataFunc()
            setSelectedUserKeys([])
            setUserUpdate(false)
            setRelatedCompanyList([])
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
                setRelatedCompanyList(res.list)                           

					
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
            await reloadDataFunc()
            setSelectedUserKeys([])
            setUserUpdate(false)
            setRelatedCompanyList([])
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
                await reloadDataFunc()
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

        setSelectedUserKeys([]);
        setUserUpdate(false);
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
                onClick: async() =>{
                    await reloadDataFunc()
                    setSelectedUserKeys([])
                    setUserUpdate(false)
                    setConfirmOpen(false)
                } 
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

        const onChangeSearchState = (e) => {
            const {name,value} = e.target;
            setSearchInfo({
                ...searchInfo,
                [name]:value
            })
        }

        const userSearchFunction = () => {
            setRelatedCompanyList([])
            if(!searchInfo || !searchInfo.searchKey){
                return;
            }

            const { searchKey,searchText } = searchInfo

            if(searchText === '' || searchText === null) {
                getUserList();
                return
            }
            const searchUserList = userList.filter((data) => {
            // 데이터가 없거나 속성이 없는 경우를 대비해 안전하게 문자열로 변환
            const targetValue = data[searchKey]?.toString().toLowerCase() || "";
            const searchValue = searchText.trim().toLowerCase();

            //쇼핑몰 검색
            if(searchKey === 'shop'){

                return (

                    data.c_kind === 'shop'

                    &&

                    data.c_name
                        ?.toLowerCase()
                        .includes(searchValue)

                )

            }
            //인테리어 검색
            if(searchKey === 'interior'){

                return(

                    data.c_kind === 'interior'

                    &&

                    data.c_name
                        ?.toLowerCase()
                        .includes(searchValue)

                )

            }

            if(searchKey ==='c_boss'){
                return( data.c_boss
                ?.toLowerCase()
                .includes(searchValue)
                )
            }



            // 검색어가 포함되어 있으면 true 반환
            return targetValue.includes(searchValue);
            });

            setEditedUserList(searchUserList)
        }

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
        
        const handleTabChange = (evt,newValue) =>{
            setRelatedCompanyList([]);
            setSearchInfo({})
            setTabValue(newValue)
            setUserType(newValue)
        }

        const [relatedCompanyList,setRelatedCompanyList] = useState([])

        const getRelatedCompanyList = (row) =>{
            return userList.filter((data)=>{
                return (
                    data.code === row.code

                    && data.c_boss === row.c_boss

                )
            })
        }

        const handleRowClick = (row) =>{

            if(userType !=='company'){
                setRelatedCompanyList([])
                return
            }

            const relatedList = getRelatedCompanyList(row)

            setRelatedCompanyList(relatedList)
        }

       

        
       

    return (
    <div>

        <div>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                   
                    <Tab label="일반 유저" value="user" />
                    <Tab label="기업 유저" value="company" />
                </Tabs>
            </Box>

            <h2>{tabTitle.filter((item) => item.value === tabValue)[0].label}</h2>            

        </div>

        <div>
            <SelectMui
            label='검색 조건'
            name='searchKey'
            option={
                userType === "user"
                ? [
                {title:'아이디',value:'id'},
                {title:'이름',value:'name'},
            ]
            :[
                {title:'아이디',value:'id'},
                {title:'이름',value:'name'},
                {title:'쇼핑몰',value:'shop'},
                {title:'인테리어',value:'interior'},
                {title:'사업주명',value:'c_boss'},
            ]
        }
            onChange={onChangeSearchState}
            value={searchInfo.searchKey}
            />
            <TextFieldMui
            name='searchText'
            onChange={onChangeSearchState}
            value={searchInfo.searchText}
            />
            <Button variant='contained' color='primary' onClick={userSearchFunction}>
                검색
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

        {alertOpen && (
                <AlertMui
                    severity={alertInfo.severity}
                    title={alertInfo.title}
                    text={alertInfo.text}
                    onClose={() => setAlertOpen(false)}
                    autoHideDuration={3000}
                />
            )}

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
                    onRowClick={handleRowClick}
                    
                    
                />

            ) : (

                <div>등록된 회원이 없습니다.</div>

            )}

            

            {relatedCompanyList.length > 0 && 
            (
            <div style={{marginTop:"20px"}}>
                <h3>동일 대표 회사 목록</h3>
                <TableMui
                    rowData={relatedCompanyList}

    col={
        userType === "user"
        ? userColumns
        : companyColumns
    }

    columns={
        userType === "user"

        ? [
            "아이디",
            "타입",
            "코드",
            "이름",
            "이메일",
            "전화번호",
            "성별",
            "주소",
            "가입상태"
        ]

        : [
            "아이디",
            "타입",
            "코드",
            "이름",
            "이메일",
            "회사명",
            "기업종류",
            "회사정보",
            "대표자",
            "가입상태"
        ]
    }
    pagination={true}
    defaultRowPerPage={5}
                    />
            </div>)}

        </div>

    </div>
);
};

export default UserInfo;
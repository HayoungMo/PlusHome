import React, { useEffect,useState } from 'react';
import userService from '../service/userService';
import TableChkMui from '../components/TableChkMui';
import { Button } from '@mui/material';
import TableMui from '../components/TableMui';

const Saleslist = () => {

    const [statisticsList,setStatisticsList] = useState([]);

    const [openCategory,setOpenCategory]=useState(null)

    const [category1List,setCategory1List] =  useState([])
    const [category2List,setCategory2List] =  useState([])
    const [category3List,setCategory3List] =  useState([])
    const [category4List,setCategory4List] =  useState([])
    const [category5List,setCategory5List] =  useState([])

    const [category1SelectedRow,setCategory1SelectedRow] = useState(null)
    const [category2SelectedRow,setCategory2SelectedRow] = useState(null)
    const [category3SelectedRow,setCategory3SelectedRow] = useState(null)
    const [category4SelectedRow,setCategory4SelectedRow] = useState(null)

    const loadStatistics = async() =>{
        try {
            const result = await userService.getCatagoryStatistics({f_catagory1: "y",})
            setStatisticsList(result.list)

            
        } catch (error) {
            console.log(error)
        }
    }

    const loadCategory2 = async () =>{
        try {
            if(!category1SelectedRow) return;

            const result = await userService.getCatagoryStatistics
            ({f_catagory1: category1SelectedRow.f_catagory1,f_catagory2:'y',})        
            setCategory2List(result.list)
        } catch (error) {
            console.log(error)
        }
    }

    const loadCategory3 = async () =>{
        try {
            if(!category2SelectedRow) return;

            const result = await userService.getCatagoryStatistics
            ({f_catagory1: category1SelectedRow.f_catagory1,
            f_catagory2:category2SelectedRow.f_catagory2,
                f_catagory3:'y'})        
            setCategory3List(result.list)
        } catch (error) {
            console.log(error)
        }
    }

    const loadCategory4 = async () =>{
        try {
            if(!category3SelectedRow) return;

            const result = await userService.getCatagoryStatistics
                ({f_catagory1: category1SelectedRow.f_catagory1,
                f_catagory2:category2SelectedRow.f_catagory2,
                f_catagory3:category3SelectedRow.f_catagory3,
                f_catagory4:'y'
             })
                        
            setCategory4List(result.list)
        } catch (error) {
            console.log(error)
        }
    }

    const loadCategory5 = async () =>{
        try {
            if(!category4SelectedRow) return;

            const result = await userService.getCatagoryStatistics
                ({f_catagory1: category1SelectedRow.f_catagory1,
                f_catagory2:category2SelectedRow.f_catagory2,
                f_catagory3:category3SelectedRow.f_catagory3,
                f_catagory4:category4SelectedRow.f_catagory4,
                f_catagory5:'y'
             })
                        
            setCategory5List(result.list)
        } catch (error) {
            console.log(error)
        }
    }

    

    useEffect(() => {
        loadStatistics();
    },[])

    useEffect(() => {            
        setOpenCategory(category1SelectedRow?.f_catagory1 || null)
        loadCategory2()
    },[category1SelectedRow])

    useEffect(() => {            
        loadCategory3()
    },[category2SelectedRow])

    useEffect(() => {            
        loadCategory4()
    },[category3SelectedRow])

    useEffect(() => {            
        loadCategory5()
    },[category4SelectedRow])

    return (
        <div>
            <h2>카테고리별 판매 통계</h2>

            <TableMui
                rowData = {statisticsList}
                col = {[
                    "f_catagory1",
                    "f_count",
                    "f_price",
                ]}
                columns = {[
                    "카테고리1",                    
                    "판매량",
                    "매출액",
                ]}
                selectedRow={category1SelectedRow}
                setSelectedRow={setCategory1SelectedRow}
            />
                    <div style={{ marginTop: "30px" }}>
                        <h3>{openCategory}상세 통계</h3>

                        <TableMui
                            rowData={category2List}
                            col={[
                                "f_catagory2",
                                "f_count",
                                "f_price",
                            ]}
                            columns={[
                                "카테고리2",
                                "판매량",
                                "매출액",
                            ]}
                            selectedRow={category2SelectedRow}
                            setSelectedRow={setCategory2SelectedRow}
                        />

                        <TableMui
                            rowData={category3List}
                            col={[
                                "f_catagory3",
                                "f_count",
                                "f_price",
                            ]}
                            columns={[
                                "카테고리3",
                                "판매량",
                                "매출액",
                            ]}
                            selectedRow={category3SelectedRow}
                            setSelectedRow={setCategory3SelectedRow}
                        />
                        <TableMui
                            rowData={category4List}
                            col={[
                                "f_catagory4",
                                "f_count",
                                "f_price",
                            ]}
                            columns={[
                                "카테고리4",
                                "판매량",
                                "매출액",
                            ]}
                            selectedRow={category4SelectedRow}
                            setSelectedRow={setCategory4SelectedRow}
                        />
                        <TableMui
                            rowData={category5List}
                            col={[
                                "f_catagory5",
                                "f_count",
                                "f_price",
                            ]}
                            columns={[
                                "카테고리5",
                                "판매량",
                                "매출액",
                            ]}
                            
                        />
                    </div>
        </div>
    );
};

export default Saleslist;
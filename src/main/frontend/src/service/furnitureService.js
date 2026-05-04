import http from "../http-common";

const getFurniture = async ({pageNum=1, searchKey, searchValue}={}) => {
    const params = {pageNum}
    if(searchKey && searchValue){
        params.searchKey=searchKey
        params.searchValue=searchValue
    }

    const res = await http .get('/furniture/list',{params})
    return res.data
}

const insertFurniture = async (formData) =>{
    const res = await http.post('/furniture/add',formData, {
        headers: {
            "Content-Type" : "multipart/form-data"
        }
    })
    return res.data
}

const getFurnitureItem = async (f_code) => {
    const res = await http.get('furniture/list/item',{params: {f_code}})
    return res.data
}

const FurnitureService={
    getFurniture,
    insertFurniture,
    getFurnitureItem
};

export default FurnitureService;
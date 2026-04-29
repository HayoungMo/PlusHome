import http from "../http-common";

const getFurniture = async () => {
    const res = await http .get('/furniture')
    return res.data
}

const insertFurniture = async (dto) =>{
    const res = await http.post('/furniture/add',dto)
    return res.data
}

const FurnitureService={
    getFurniture,
    insertFurniture
};

export default FurnitureService;
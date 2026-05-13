import http from "../http-common";

const getFurnitureOptions = (f_code) => {
    return http.get(`/options/furniture/${f_code}`);
};

const insertOption = (option) => {
    return http.post("/options", option);
};

const updateOption = (option) => {
    return http.put("/options", option);
};

const deleteFurnitureOptions = (f_code) => {
    return http.delete(`/options/furniture/${f_code}`);
};

const deleteOneOption = (o_code) => {
    return http.delete(`/options/${o_code}`);
};

const OptionsService = {
    getFurnitureOptions,
    insertOption,
    updateOption,
    deleteFurnitureOptions,
    deleteOneOption
};

export default OptionsService;

import http from "../http-common";

const getMyWallet = async (id) => {
    const res = await http.get('/wallet/mywallet', {
        params: { id }
    })
    return res.data
}

const chargeWallet = async (dto) =>{
    const res = await http.post('/wallet/charge',dto)
    return res.data
}

const WalletService={
    getMyWallet,
    chargeWallet
};

export default WalletService;
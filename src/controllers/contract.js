const { Op } = require("sequelize");

module.exports = {
    getContract: async (req, res) => {
        try {
            const {Contract} = req.app.get('models')
            const {id} = req.params
            const profile = req.profile
            const contract = await Contract.findOne({
                where: {
                    id,
                    [Op.or]: [{ContractorId: profile.id}, {ClientId: profile.id}]
                }
            })
            if(!contract) return res.status(404).end()

            if (contract.ContractorId === profile.id && contract.status !== 'in_progress')
                return res.status(403).send({
                    status: 'failed',
                    message: 'You are not allowed to access the contract'
                })

            res.json(contract)
        } catch (err) {
            res.status(400).send({
                status: 'error',
                message: 'error while getting a contract'
            });
        }
    },

    getAllContracts: async (req, res) => {
        try {
            const {Contract} = req.app.get('models')
            const profile = req.profile
            const contracts = await Contract.findAll({
                where: {
                    [Op.or]: [{ContractorId: profile.id}, {ClientId: profile.id}],
                    status: {
                        [Op.ne]: 'terminated'
                    }
                }
            })
            if (!contracts.length) return res.status(404).end()

            res.json(contracts)
        } catch (err) {
            res.status(400).send({
                status: 'error',
                message: 'error while getting a contract'
            });
        }
    }
};

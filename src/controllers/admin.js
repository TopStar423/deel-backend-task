const { Op } = require("sequelize");

module.exports = {
    getBestProfession: async (req, res) => {
        try {
            const {Job, Contract} = req.app.get('models')
            const sequelize = req.app.get('sequelize')
            const {start, end} = req.query

            const jobs = await Job.findAll({
                limit: 1,
                where: {
                    paid: true,
                    [Op.and]: [
                        sequelize.where(sequelize.fn('date', sequelize.col('Job.createdAt')), '>=', start),
                        sequelize.where(sequelize.fn('date', sequelize.col('Job.createdAt')), '<=', end)
                    ]
                },
                attributes: [
                    [sequelize.fn('sum', sequelize.col('price')), 'total_price'],
                ],
                group: ['Contract.ContractorId'],
                order: sequelize.literal('total_price DESC'),
                include: [{
                    model: Contract,
                    attributes: ['ContractorId'],
                    include: ['Contractor']
                }]
            })

            if (!jobs.length)
                return res.status(404).send({
                    status: 'error',
                    message: 'No jobs between the start date and and end date'
                })

            res.status(200).send(jobs[0].Contract.Contractor.profession)
        } catch (err) {
            res.status(400).send({
                status: 'error',
                message: 'error while getting a best profession'
            });
        }
    },

    getBestClients: async (req, res) => {
        try {
            const {Profile, Job, Contract} = req.app.get('models')
            const sequelize = req.app.get('sequelize')
            const {start, end, limit = 2} = req.query

            const jobs = await Job.findAll({
                limit,
                where: {
                    paid: true,
                    [Op.and]: [
                        sequelize.where(sequelize.fn('date', sequelize.col('Job.createdAt')), '>=', start),
                        sequelize.where(sequelize.fn('date', sequelize.col('Job.createdAt')), '<=', end)
                    ]
                },
                attributes: [
                    [sequelize.fn('sum', sequelize.col('price')), 'total_price'],
                ],
                group: ['Contract.ClientId'],
                order: sequelize.literal('total_price DESC'),
                include: [{
                    model: Contract,
                    attributes: ['ClientId'],
                    include: ['Client']
                }]
            })

            if (!jobs.length)
                return res.status(404).send({
                    status: 'error',
                    message: 'No jobs between the start date and and end date'
                })


            const bestClients = [];
            for (const job of jobs) {
                const client = job.Contract.Client
                const bestClient = {
                    id: client.id,
                    fullName: client.firstName + ' ' + client.lastName,
                    paid: job.dataValues.total_price
                }

                bestClients.push(bestClient)
            }

            return res.json(bestClients)
        } catch (err) {
            res.status(400).send({
                status: 'error',
                message: 'error while getting a best clients'
            });
        }
    },
};

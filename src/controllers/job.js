const { Op } = require("sequelize");

module.exports = {
    getUnpaid: async (req, res) => {
        try {
            const {Job, Contract} = req.app.get('models')
            const profile = req.profile
            const jobs = await Job.findAll({
                where: {
                    paid: {
                        [Op.not]: true
                    }
                },
                include: [{
                    model: Contract,
                    where: {
                        [Op.or]: [{ContractorId: profile.id}, {ClientId: profile.id}],
                        status: 'in_progress',
                    }
                }]
            })
            if (jobs.length) {
                res.json(jobs)
            } else {
                return res.status(404).end()
            }
        } catch (err) {
            res.status(400).send({
                status: 'error',
                message: 'error while getting a jobs unpaid'
            });
        }
    },
    payJob: async (req, res) => {
        try {
            const {Job, Contract, Profile} = req.app.get('models')
            const client = req.profile
            const {job_id: id} = req.params

            const job = await Job.findOne({
                where: {id},
                include: [{
                    model: Contract,
                    where: {
                        ClientId: client.id
                    }
                }]
            })

            if (!job) return res.status(404).end()

            if (job.paid === true) {
                return res.status(400).send({
                    status: 'failed',
                    message: 'Job is already paid'
                });
            }

            if (client.balance < job.balance) {
                return res.status(400).send({
                    status: 'payment failed',
                    message: 'Your balance is not enough'
                });
            }

            const contractorId = job.Contract.ContractorId

            const contractor = await Profile.findOne({
                where: {
                    id: contractorId
                }
            })

            await client.update({
                balance: client.balance - job.price
            });
            await contractor.update({
                balance: contractor.balance + job.price
            })
            await job.update({
                paid: true
            })

            res.json(job)
        } catch (err) {
            res.status(400).send({
                status: 'error',
                message: 'error while paying job'
            });
        }
    },
};

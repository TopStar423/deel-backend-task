const { Op } = require("sequelize");

module.exports = {
    deposit: async (req, res) => {
        try {
            const {Job, Contract} = req.app.get('models')
            const sequelize = req.app.get('sequelize')
            const {userId} = req.params
            const {amount} = req.body
            const profile = req.profile

            if (profile.type !== 'client' || userId != profile.id)
                return res.status(403).send({
                    status: 'forbidden',
                    message: 'You are not allowed to deposit to the user'
                })

            const jobs = await Job.findAll({
                where: {
                    paid: {
                        [Op.not]: true
                    }
                },
                attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'total']],
                include: [{
                    model: Contract,
                    where: {
                        ClientId: userId
                    }
                }]
            })
            if (!jobs.length) return res.status(404).end()

            const limitAmount = jobs[0].total * 0.25
            if (amount > limitAmount)
                return res.status(400).send({
                    status: 'failed',
                    message: 'You cannot exceed 25% of all the jobs price to pay'
                })

            await profile.update({
                balance: profile.balance + amount
            })

            res.json(profile)
        } catch (err) {
            res.status(400).send({
                status: 'error',
                message: 'error while getting a jobs unpaid'
            });
        }
    }
};

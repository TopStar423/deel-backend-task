const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

const contractController = require('./controllers').contract
const jobController = require('./controllers').job
const balanceController = require('./controllers').balance
const adminController = require('./controllers').admin

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id',getProfile ,contractController.getContract)

/**
 * @returns list of contracts belongs to user
 */
app.get('/contracts',getProfile ,contractController.getAllContracts)

/**
 * @returns all unpaid jobs for a user
 */
app.get('/jobs/unpaid', getProfile, jobController.getUnpaid)

/**
 * @returns Pay for a job
 */
app.post('/jobs/:job_id/pay', getProfile, jobController.payJob)

/**
 * @returns Deposits money into the the the balance of a client
 */
app.post('/balances/deposit/:userId', getProfile, balanceController.deposit)

/**
 * @returns the profession that earned the most money
 */
app.get('/admin/best-profession', getProfile, adminController.getBestProfession)

/**
 * @returns the clients the paid the most for jobs
 */
app.get('/admin/best-clients', getProfile, adminController.getBestClients)

module.exports = app;

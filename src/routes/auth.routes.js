const router = require('express').Router()
const { register, login } = require('../controllers/auth.controller')
const { registroRules, loginRules, validar } = require('../validations/auth.validation')

router.post('/register', registroRules, validar, register)
router.post('/login',    loginRules,    validar, login)

module.exports = router

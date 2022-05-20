const express = require('express')
const bodyParser = require('body-parser')
const log = require('debug')('phoenix')
const app = require('./app')
var cors = require('cors')
const server = express()
server.use(bodyParser.json())
server.use(bodyParser.json({limit: '5mb'}));
server.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
server.use(bodyParser.urlencoded({ extended: false }))
server.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Token', 'crossDomain')
  
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
 
  next()
})

server.use('/', app)
server.use(cors())
server.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

server.use((err, req, res, next) => {
  const message = req.app.get('env') === 'development' ? err : {}
  log(`${message}`)
  log(err)
  res.status(err.status || 500)
  res.json({
    status: 'error'
  })
})

const port = process.env.PORT || 3000
server.listen(port, function () {
  log(`Listening at port ${port}`)
})

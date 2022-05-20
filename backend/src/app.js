const express = require('express')
const app = express.Router()
const fs = require("fs");
const { spawn } = require("child_process");
const {streamWrite, streamEnd, onExit} = require('@rauschma/stringio');
const { stdout } = require('process');
const py = spawn("python", ["test.py"], {stdio: ['pipe', process.stdout, process.stderr] });
  let data2send
  // py.stdin.setEncoding('utf-8');
  // py.stdout.pipe(process.stdout);

  // py.stdin.cork();
  // py.stdin.write("print('Hello World')\n");
  // py.stdin.uncork();

  // py.stdout.read("data", (data) => {
  //   console.log("OUT")
  //   data2send = data.toString();
  //   console.log(data2send)
  // });

  // py.stdout.on("data", (data) => {
  //   console.log("OUT")
  //   data2send = data.toString();
  //   console.log(data2send)
  // });

  // py.stderr.on('data', (data) => {
  //   console.log("ERROR :");
  //   console.log(data.toString())
  // });
  
  py.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    // send data to browser
    console.log(data2send)
    // return res.status(200).json({ status: 'success' , value:data2send});
 });

 
app.post('/count', (req, res) =>{
  console.log("BACKEND")


  
  // const base64Image = req.body.image.split(";base64,").pop();
  // console.log(base64Image.length)

  
  // fs.writeFileSync("./utils/test.jpg", base64Image, { encoding: "base64" })
  // py.stdin.setEncoding('utf-8');
  // py.stdin.cork();
  py.stdin.write("./utils/test.jpg");
  // py.stdin.write("print('hello')\n");
  // py.stdin.uncork();
  // py.stdin.end();
//   const py = spawn("python", ["test.py", "./utils/test.jpg"]);
//   let data2send

//   py.stdout.on("data", (data) => {
//     data2send = data.toString();
//   });

//   py.stderr.on('data', (data) => {
//     console.log("ERROR :");
//     console.log(data.toString())
//   });

//   py.on('close', (code) => {
//     console.log(`child process close all stdio with code ${code}`);
//     // send data to browser
//     console.log(data2send)
//     return res.status(200).json({ status: 'success' , value:data2send});
//  });


console.log("END OF FUNCTION")


  
})

module.exports = app
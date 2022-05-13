const express = require('express');
const app = express();

const path = require('path');

const port = process.env.port || 5000;

app.use(express.static('build'));
console.log("here")
app.get('*', (req,res) => {
    req.sendFile(path.resolve(__dirname, 'build', 'index.html'));
})

app.listen(port, (err) => {
    if (err) return console.log(err)
    console.log('Server running on port:', port);
})


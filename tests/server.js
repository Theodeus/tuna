const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..')));
app.listen(8000, () => console.log('Tuna Test is listening on port 8000!'));
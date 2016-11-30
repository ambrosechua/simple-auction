/* eslint-env node, es6 */

const express = require('express');
const routes = require('./routes');

const app = express();
app.use(routes);

app.listen(process.env.PORT || 8080, process.env.IP || "127.0.0.1");

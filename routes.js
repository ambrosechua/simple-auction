/* eslint-env node, es6 */

const path = require('path');

const express = require('express');
const bodyparser = require('body-parser');
const hbs = require('express-handlebars');
const Logic = require('./logic');

const routes = express();
routes.engine('hbs', hbs({
	extname: '.hbs',
	defaultLayout: 'default',
	helpers: {
		ifincludes: (a, b, options) => {
			if (a && a.includes && a.includes(b)) {
				return options.fn(this);
			}
			return options.inverse(this);
		},
	},
}));
routes.set('view engine', 'hbs');
routes.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
routes.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
routes.use('/imgix.js', express.static(path.join(__dirname, 'node_modules/imgix.js/dist')));
routes.use('/assets', express.static(path.join(__dirname, 'assets')));
routes.use(bodyparser.urlencoded({
	extended: true,
}));

const logic = new Logic();
const config = logic.getConfig();

routes.get('/*', (req, res, next) => {
	res.set('Cache-Control', 'no-cache, no-store');
	next();
});

routes.get('/', (req, res, next) => {
	logic.getIndex().then((content) => {
		res.render('index', {
			content,
			config,
		});
	}).catch((err) => {
		next(err);
	});
});

routes.get('/items/', (req, res, next) => {
	logic.getItems().then((items) => {
		switch (req.accepts(['json', 'html'])) {
		case 'json':
			return res.json(items);
		case 'html':
		default:
			return res.render('items', {
				items,
				config,
			});
		}
	}).catch((err) => {
		next(err);
	});
});

routes.get('/items/:id', (req, res, next) => {
	logic.getItem(parseInt(req.params.id, 10)).then((item) => {
		switch (req.accepts(['json', 'html'])) {
		case 'json':
			return res.json(item);
		case 'html':
		default:
			return res.render('item', {
				item,
				config,
			});
		}
	}).catch((err) => {
		next(err);
	});
});

routes.put('/items/:id/bids/', (req, res) => {
	logic.putItemBid(parseInt(req.params.id, 10), req.body).then(() => {
		res.json({
			success: true,
		});
	}).catch((err) => {
		res.status(400).json({
			error: true,
			message: err.message,
		});
	});
});

module.exports = routes;

/* eslint-env node, es6 */

const fs = require('fs');
const path = require('path');

const low = require('lowdb');
const fileAsync = require('lowdb/lib/file-async');

class Logic {
	constructor() {
		const BASE_DIR = path.join(__dirname, 'data');
		const DB_FILE = path.join(BASE_DIR, 'data.json');
		const CONFIG_FILE = path.join(BASE_DIR, 'config.json');

		this.config = require(CONFIG_FILE); // TODO: Replace with readFileSync
		this.db = low(DB_FILE, {
			storage: fileAsync,
		});
		this.db.defaults({ items: [] }).value();
		this.baseDir = BASE_DIR;
	}

	getConfig() {
		return this.config;
	}

	async getIndex() {
		return await new Promise((resolve, reject) => {
			fs.readFile(path.join(this.baseDir, 'index.html'), 'utf8', (err, content) => {
				if (err) return reject(err);
				return resolve(content);
			});
		});
	}

	async getItems() {
		return this.db.get('items').value();
	}

	async getItem(id) {
		const dbitem = this.db.get('items').find({ id });
		const item = Object.assign({}, dbitem.value());
		item.bid.next = (item.bid.highest || item.bid.starting) + item.bid.increment;
		return item;
	}

	async putItemBid(id, bid) {
		const dbitem = this.db.get('items').find({ id });
		const item = Object.assign({}, dbitem.value());
		item.bid.next = (item.bid.highest || item.bid.starting) + item.bid.increment;

		const amount = parseInt(bid.amount, 10);
		const name = bid.name;
		const phone = bid.phone;
		if (!item.bid.bids) {
			dbitem.get('bid').set('bids', []).value();
		}
		if (amount < item.bid.next) {
			throw new Error(`Please bid $${item.bid.next} or higher`);
		}
		if (!name) {
			throw new Error('Please give us your name');
		}
		if (!phone || phone.length < 8) {
			throw new Error('Please give us a valid phone number');
		}
		dbitem.get('bid').get('bids').push({
			amount,
			name,
			phone,
		}).value();
		dbitem.get('bid').set('highest', amount).value();
	}
}

module.exports = Logic;

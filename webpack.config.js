const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
	target: 'node',
	externals: [ nodeExternals() ],
	entry: './build/Binato.js',
	output: {
		path: path.join(__dirname, 'bundle'),
		filename: 'Binato.js',
	},
	optimization: {
		minimize: true,
	},
};
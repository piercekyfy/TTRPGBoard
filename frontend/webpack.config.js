// @ts-check

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports =  {
    entry: './src/index.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './public/dist'),
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html', // Your source HTML file
        }),
    ],
    devServer: {
        hot: true,
        watchFiles: ['src/**/*'],
        client: {
            logging: 'verbose',
            overlay: true
        },
        compress: true,
        port: 3000,
    },
    devtool: 'source-map'
}
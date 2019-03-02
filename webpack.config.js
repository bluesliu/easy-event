const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './example/index.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: "index_bundle.js"
    },
    devtool: 'source-map',
    devServer: {
        contentBase: './example',
        hot: true,
        port: 3002,
        open: true
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    presets: ['@babel/preset-env'],
                    plugins: ['@babel/plugin-proposal-class-properties']
                }
            },

        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(__dirname, 'example/index.html')
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
};
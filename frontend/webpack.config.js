'use strict';

const path = require('path');
const srcDir = path.join(__dirname, 'src');
const buildDir = path.join(__dirname, '../static/build');

const DEVELOPMENT_ENV = 'development';
const PRODUCTION_ENV = 'production';
const NODE_ENV = process.env.NODE_ENV || DEVELOPMENT_ENV;

const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackOnBuildPlugin = require('on-build-webpack');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const devMode = process.env.NODE_ENV !== PRODUCTION_ENV;
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    cache: true,

    context: srcDir,

    entry: {
        vendor: ["vue"],
        main: "./main.js", // vue.js
    },

    output: {
        path: buildDir,
        publicPath: "/build/", // url prefix
        filename: "[name].js",
        library: "[name]"
    },

    optimization: {
        splitChunks: {
            cacheGroups: {
                default: false,
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all",
                }
            }
        }
    },

    watch: devMode,
    watchOptions: {
        aggregateTimeout: 100,
        poll: 250
    },

    devtool: devMode ? "source-map" : false,

    plugins: [
        new CopyWebpackPlugin([
            { from: '../node_modules/@mdi/font/css', to: path.join(buildDir, 'css') },
            { from: '../node_modules/@mdi/font/fonts', to: path.join(buildDir, 'fonts') },
        ]),
        new VueLoaderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /^$/),
        new CleanWebpackPlugin([buildDir], {
            watch: false,
            allowExternal: true,
            verbose: true,
            dry: false
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
        }),
        new WebpackOnBuildPlugin(function (stats) {
            var currentdate = new Date();
            console.log("Built with environment:", NODE_ENV, "at", currentdate.toLocaleString());
        }),
    ],

    resolve: {
        alias: {
            // 'vue': path.resolve(path.join(__dirname, 'node_modules', 'vue/dist/vue.js')), // fix "Vue is not constructor" in vue-online
            'vue$': path.resolve(path.join(__dirname, 'node_modules', 'vue/dist/vue.esm.js')), // it's important, else you will get "You are using the runtime-only build of Vue where the template compiler is not available. Either pre-compile the templates into render functions, or use the compiler-included build."
            '@': path.resolve(__dirname, 'src')
        },
        extensions: ['.js', '.vue']
    },

    // disable extract-test-plugin spam
    stats: {
        children: false
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader?sourceMap"
                ]
            },
            {
                test: /\.styl|stylus$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader?sourceMap",
                    'stylus-loader'
                ]
            },
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                // for fix MemoryFs error with Karma -- remove limit
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[path][name].[ext]',
                            limit: '4096'
                        }
                    }
                ],
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                            // publicPath: '/static/build/',
                        }
                    }
                ]
            },
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        minimize: true
                    }
                }],
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    extractCSS: true
                }
            }
        ]

    }
};

if (devMode) {
    module.exports.plugins.push(
        new LiveReloadPlugin({
            appendScriptTag: true
        })
    );
}

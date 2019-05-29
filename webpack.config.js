const ENVIRONMENT = process.env.NODE_ENV;
const BUILD_NUMBER = process.env.build_number;
const EDITOR_VER = process.env.version_number;

const CONFIG_STRING_REPLACE = [
    { search: '/plugins', replace: '/content-plugins' },
    { search: "/api", replace: '/action' },
    { search: 'https://dev.ekstep.in', replace: '' }
];

const BUILD_FOLDER_NAME = 'collection-editor.zip';
const NPM_BUILD_FOLDER_NAME = 'collection-editor'

const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const glob = require('glob-all');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OnBuildSuccess = require('on-build-webpack');
const extract = require('extract-zip');
const { exec } = require('child_process');
const cpy = require('cpy');
const gulp = require('gulp');


/**
 * External files 
 */
const VENDOR = [
    "./app/bower_components/jquery/dist/jquery.js",
    "./app/bower_components/semantic/dist/semantic.js",
    "./app/bower_components/jquery-ui/jquery-ui.js",
    "./app/libs/please-wait.min.js",
    "./app/bower_components/async/dist/async.min.js",
    "./app/bower_components/angular/angular.js",
    "./app/bower_components/lodash/lodash.js",
    "./app/bower_components/x2js/index.js",
    "./app/bower_components/uuid/index.js",
    "./app/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js",
    "./app/bower_components/ng-dialog/js/ngDialog.js",
    "./app/bower_components/ngSafeApply/index.js",
    "./app/bower_components/oclazyload/dist/ocLazyLoad.min.js",
    "./app/scripts/collectioneditor/md5.js",
    "./app/libs/tokens.js",
    "./app/libs/ng-tags-input.js",
    "./app/libs/contextmenu.min.js"
];

var EDITOR_APP = [
    "./app/scripts/dev/localhost-ce.js",
    "./app/libs/eventbus.min.js",
    "./app/bower_components/contenteditor/index.js",
    "./app/scripts/collectioneditor/bootstrap-editor.js",
    "./app/scripts/collectioneditor/collectioneditor-config.js",
    "./app/scripts/collectioneditor/collection-editor-api.js",
    "./app/scripts/collectioneditor/collectioneditor-base-plugin.js",
    "./app/scripts/collectioneditor/manager/container-manager.js",
    "./app/scripts/collectioneditor/manager/metapage-manager.js",
    "./app/scripts/collectioneditor/service/collection-service.js",
    "./app/scripts/collectioneditor/service/state-service.js",
    "./app/scripts/angular/controller/main.js",
    "./app/scripts/angular/directive/template-compiler-directive.js",
];
const APP_STYLE = [
    "./app/styles/jquery-ui.css",
    './app/scripts/plugin-vendor.min.css',
    "./app/styles/semantic.min.css",
    "./app/styles/content-editor.css",
    "./app/styles/metaform.css",
    "./app/styles/MyFontsWebfontsKit.css",
    "./app/bower_components/font-awesome/css/font-awesome.css",
    "./app/bower_components/ng-dialog/css/ngDialog.min.css",
    "./app/bower_components/ng-dialog/css/ngDialog-theme-plain.min.css",
    "./app/bower_components/ng-dialog/css/ngDialog-theme-default.min.css",
    "./app/libs/spinkit.css",
    "./app/libs/please-wait.css",
    "./app/libs/tokens.css",
    "./app/libs/ng-tags-input.css",
    "./app/libs/prism.css",
    './app/styles/noto.css',
    './app/styles/iconfont.css',
    './app/styles/fonts/notosans-bengali/notosansbengali.css',
    './app/styles/fonts/notosans-malayalam/notosansmalayalam.css',
    './app/styles/fonts/notosans-gurmukhi/notosansgurmukhi.css',
    './app/styles/fonts/notosans-devanagari/notosansdevanagari.css',
    './app/styles/fonts/notosans-gujarati/notosansgujarati.css',
    './app/styles/fonts/notosans-telugu/notosanstelugu.css',
    './app/styles/fonts/notosans-tamil/notosanstamil.css',
    './app/styles/fonts/notosans-kannada/notosanskannada.css',
    './app/styles/fonts/notosans-oriya/notosansoriya.css',
    './app/styles/fonts/noto-nastaliqurdu/notonastaliqurdu.css',
    './app/styles/fonts-override.css'
];

// removing the duplicate files
const APP_SCRIPT = [...new Set([...VENDOR, ...EDITOR_APP])];

if (!BUILD_NUMBER && !EDITOR_VER) {
    console.error('Error!!! Cannot find version_number and build_number env variables');
    return process.exit(1)
}
const VERSION = EDITOR_VER + '.' + BUILD_NUMBER;

module.exports = (env, argv) => {
    return {
        entry: {
            'script': APP_SCRIPT,
            'style': APP_STYLE,
        },
        output: {
            filename: `[name].min.${VERSION}.js`,
            path: path.resolve(__dirname, 'dist')
        },
        resolve: {
            alias: {
                'jquery': path.resolve('./node_modules/jquery/dist/jquery.js'),
                'jquery-ui/ui/widgets/menu': path.resolve('./app/bower_components/jquery-ui/ui/widgets/menu.js'),
                'angular': path.resolve('./app/bower_components/angular/angular.js'),
                'Fingerprint2': path.resolve('./app/bower_components/fingerprintjs2/fingerprint2.js'),
                'UAParser': path.resolve('./app/libs/ua-parser.min.js')
            }
        },
        module: {
            rules: [{
                    test: /\.js$/,
                    loader: 'string-replace-loader',
                    options: {
                        multiple: CONFIG_STRING_REPLACE,
                        strict: true
                    }
                },
                {
                    test: require.resolve('./app/bower_components/async/dist/async.min.js'),
                    use: [{
                        loader: 'expose-loader',
                        options: 'async'
                    }]
                },
                {
                    test: require.resolve('jquery'),
                    use: [{
                        loader: 'expose-loader',
                        options: '$'
                    }]
                },
                {
                    test: require.resolve('jquery'),
                    use: [{
                        loader: 'expose-loader',
                        options: 'jQuery'
                    }]
                },
                {
                    test: require.resolve('./app/libs/eventbus.min.js'),
                    use: [{
                        loader: 'expose-loader',
                        options: 'EventBus'
                    }]
                },
                {
                    test: require.resolve('./app/libs/please-wait.min.js'),
                    use: [{
                        loader: 'expose-loader',
                        options: 'pleaseWait'
                    }]
                },
                {
                    test: require.resolve('./app/bower_components/fingerprintjs2/fingerprint2.js'),
                    use: [{
                        loader: 'expose-loader',
                        options: 'Fingerprint2'
                    }]
                },
                {
                    test: require.resolve('./app/libs/ua-parser.min.js'),
                    use: [{
                        loader: 'expose-loader',
                        options: 'UAParser'
                    }]
                },
                {
                    test: require.resolve('./app/bower_components/uuid/index.js'),
                    use: [{
                        loader: 'expose-loader',
                        options: 'UUID'
                    }]
                },
                {
                    test: /\.(s*)css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: false,
                                minimize: true,
                                "preset": "advanced",
                                discardComments: {
                                    removeAll: true
                                }
                            }
                        }
                    ]
                },
                {
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    use: [
                        'file-loader',
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 50, //it's important
                                outputPath: './images',
                                name: '[name].[ext]',
                            }
                        },
                    ],
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf|svg|png)$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: './fonts/',
                            limit: 10000,
                            fallback: 'responsive-loader'
                        }
                    }]
                },
            ]
        },
        plugins: [
            new CleanWebpackPlugin(['dist']),
            new UglifyJsPlugin({
                cache: false,
                parallel: true,
                uglifyOptions: {
                    compress: {
                        dead_code: true,
                        drop_console: false,
                        global_defs: {
                            DEBUG: true
                        },
                        passes: 1,
                    },
                    ecma: 5,
                    mangle: true
                },
                sourceMap: true
            }),
            // copy the index.html and templated to eidtor filder
            new CopyWebpackPlugin([{
                    from: './app/index.html',
                    to: './[name].[ext]',
                    toType: 'template'
                },
                {
                    from: './app/bower_components/jquery/dist/jquery.min.js',
                    to: './'
                },
                {
                    from: './app/scripts/coreplugins.js',
                    to: './'
                },
                {
                    from: './deploy/gulpfile.js',
                    to: './'
                },
                {
                    from: './deploy/package.json',
                    to: './'
                },
                {
                    from: './app/libs/jquery-ui.min.js',
                    to: './'
                },
                {
                    from: './app/libs/semantic.min.js',
                    to: './'
                },
                {
                    from: './app/libs/contextmenu.min.js',
                    to: './'
                },

            ]),
            new ImageminPlugin({
                test: /\.(jpe?g|png|gif|svg)$/i,
                name: '[name].[ext]',
                outputPath: './images',
                pngquant: {
                    quality: '65-70'
                }
            }),
            new MiniCssExtractPlugin({
                filename: `[name].min.${VERSION}.css`,
            }),
            new webpack.ProvidePlugin({
                Fingerprint2: 'Fingerprint2',
                UAParser: 'UAParser',
                Ajv: 'ajv',
                $: "jquery",
                jQuery: "jquery",
                "window.jQuery": 'jquery',
                "window.$": 'jquery',
                async: 'async'
            }),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.optimize\.css$/g,
                cssProcessor: require('cssnano'),
                cssProcessorOptions: {
                    safe: true,
                    discardComments: {
                        removeAll: true
                    }
                },
                canPrint: true
            }),
            new ZipPlugin({
                path: path.join(__dirname, '.'),
                filename: BUILD_FOLDER_NAME,
                fileOptions: {
                    mtime: new Date(),
                    mode: 0o100664,
                    compress: true,
                    forceZip64Format: false,
                },
                pathMapper: function(assetPath) {
                    console.log("AssesPath", assetPath)
                    if (assetPath.startsWith('gulpfile')) {
                        return path.join('.', path.basename(assetPath));
                    }
                    if (assetPath.endsWith('.js'))
                        return path.join(path.dirname(assetPath), 'scripts', path.basename(assetPath));
                    if (assetPath.endsWith('.css'))
                        return path.join(path.dirname(assetPath), 'styles', path.basename(assetPath));
                    if (assetPath.startsWith('fonts')) {
                        return path.join('styles', 'fonts', path.basename(assetPath));
                    };
                    return assetPath;
                },
                exclude: [`style.min.${VERSION}.js`],
                zipOptions: {
                    forceZip64Format: false,
                },
            }),
            new OnBuildSuccess(function(stats) {
                if (env && env.channel.toUpperCase() === 'NPM_PACKAGE') {
                    build_npm_package();
                }
            }),
        ],
        optimization: {
            splitChunks: {
                chunks: 'async',
                minSize: 30000,
                minChunks: 1,
                maxAsyncRequests: 5,
                maxInitialRequests: 3,
                automaticNameDelimiter: '~',
                name: true,
                cacheGroups: {
                    styles: {
                        name: 'style',
                        test: /\.css$/,
                        chunks: 'all',
                        enforce: false
                    }
                },
            }
        }
    }
};

function build_npm_package() {
    extract(BUILD_FOLDER_NAME, { dir: path.resolve(__dirname, NPM_BUILD_FOLDER_NAME) }, function(err, res) {
        if (err) {
            console.error("Fails to extract", err)
            return
        } else {
            console.log("success", res);
            cpy(['./package.json', './README.md'], path.resolve(__dirname, NPM_BUILD_FOLDER_NAME));
            console.log(`NPM ${NPM_BUILD_FOLDER_NAME} package is Ready!!!, Please wait we are updating index.html file`);
        }
    })
}
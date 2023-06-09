const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    optimization: { minimize: true },
    experiments: { outputModule: true },
    output: {
        path: path.resolve('build'),
        filename: 'geoonlineutil.min.js',
        libraryTarget: 'module', // module/commonjs2/window // https://webpack.js.org/configuration/output/#outputlibrarytarget
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /(node_modules)/,
                use: 'babel-loader',
            },
        ],
    },
    resolve: { extensions: ['.js'] },
};

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const isProd = process.env.NODE_ENV === 'production';
const minifiedExt = isProd ? '.min' : '';

const webpackConfig = {
  entry: [
    './js/index.js',
  ],
  output: {
    filename: `js/bundle${minifiedExt}.js`,
    path: path.resolve(__dirname, isProd ? 'dist' : 'build'),
  },
  module: {
    rules: [
      {
        test: require.resolve('./vendor/viewportSize.min.js'),
        use: 'imports-loader?this=>window',
      },
      {
        test: require.resolve('./vendor/dat-gui/dat.gui-0.5.1-plus.min.js'),
        use: 'exports-loader?dat'
      },
      {
        test: require.resolve('./vendor/sprintf.js'),
        use: 'exports-loader?sprintf'
      },
      {
        test: require.resolve('./vendor/circos.min.js'),
        use: 'exports-loader?Circos'
      },
      {
        test: /\.js$/,
        exclude: [ /node_modules/, /vendor/ ],
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        })
      },
      {
        test: /\.(jpe?g|gif|png)$/,
        loader: 'file-loader?emitFile=false&name=[path][name].[ext]'
      },
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader?publicPath=../&name=fonts/[name].[ext]',
      },
    ],
  },
  devtool: isProd ? false : 'inline-source-map',
  resolve: {
    extensions: ['.js'],
  },
  devServer: {
    hot: true,
    port: 8000,
    watchContentBase: true,
    contentBase: './',
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      d3: 'd3',
    }),
    // from https://stackoverflow.com/questions/25384360/
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({ filename: 'GenomePlot.html', template: './GenomePlot.html' }),
    new ExtractTextPlugin({ filename: `css/style${minifiedExt}.css`, disable: !isProd }),
  ],
};

if (isProd) {
  // from: https://stackoverflow.com/a/41041580/1980846
  webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
      pure_funcs: [
        'console.log',
        'console.debug',
        'console.time',
        'console.timeEnd',
        'console.log.apply',
        'console.debug.apply',
        'console.time.apply',
        'console.timeEnd.apply',
        'console.verbose',
      ],
    },
  }));
}

export default webpackConfig;

const path = require('path')

const distFolder = path.resolve(__dirname, '../src/neural-networks/dist')


module.exports = {
  entry: path.resolve(__dirname, '../src/neural-networks/examples.js'),
  output: {
    filename: 'bundle.js',
    path: distFolder
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: distFolder
  }
}

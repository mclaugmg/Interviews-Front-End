import express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import fs from 'fs';

import config from '../config';
import webpackConfig from './dev.config.babel';

const compiler = webpack(webpackConfig);
const app = express();

const serverOptions = {
//  contentBase: `http://${config.server_host}:${config.server_port}`,
  contentBase: 'src',
  quiet: true,
  noInfo: true,
  hot: true,
  inline: true,
  lazy: false,
  publicPath: webpackConfig.output.publicPath,
  stats: {colors: true},
};

function readJsonFileSync(filepath, encoding){

    if (typeof (encoding) == 'undefined'){
        encoding = 'utf8';
    }
    var file = fs.readFileSync(filepath, encoding);
    return JSON.parse(file);
}

const middleware = webpackMiddleware(compiler, serverOptions);
app.use(middleware);
app.use(webpackHotMiddleware(compiler));
app.use('/static', express.static('./src/web-api'));

app.use('/api/search', function(req, res) {

  const service = req.query.service;
  let file = 'search.json';

  if(service) {
    file = `search-${service}.json`;
  }

  let json = {
    search: []
  };

  try {
    json = readJsonFileSync(`./src/web-api/${file}`);
  } catch(err) {
    res.status(404);
  }

  res.json(json);

});

app.listen(config.server_port, function onAppListening(err) {
  if (err) {
    console.error(err);
  } else {
    console.info('==> 🚧  Webpack development server listening on port %s', config.server_port);
  }
});

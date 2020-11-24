var request = require('request'),
  stream = require('stream'),
  util = require('util'),
  express = require('express'),
  router = express.Router();

function Buffer() {
  var pumping = true,
    queue = [],
    push = this.push.bind(this);

  function flush() {
    if (!pumping) return;
    while (queue.length && (pumping = push.apply({}, queue.shift())));
  }
  this._read = function () {
    pumping = true;
    flush();
  };
  this._write = function (chunk, encoding, callback) {
    queue.push([chunk, encoding]);
    callback();
  };
  stream.Duplex.call(this);
}
util.inherits(Buffer, stream.Duplex);

router.get('/:filePath', function(req, res, next) {
  var host = 'https://xr-tietoa-online-001-assets-69a9cde0.s3-eu-west-1.amazonaws.com/hubs/assets/js/umbra/UmbraAssetWorker.js',
    buffer = new Buffer();
  request(host, function(err, proxyRes, body) {
    if (err) {
      next(err);
    }
    if (proxyRes.statusCode === 404) {
      body.pipe(res);
    }
    else {
      res.set(proxyRes.headers);
      buffer.pipe(res);
    }
  }).pipe(buffer);
});

module.exports = router;

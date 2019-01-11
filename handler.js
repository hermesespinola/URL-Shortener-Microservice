const dns = require('dns');
const URL = require('./URLModel');
var Counter = require('./CounterModel.js');

const URLRegex = /(^https?:\/\/)(.*?(?=\/))(\/.*)*/i

const createURL = (url, index, callback) => {
  console.log(url, index);
  const newURL = new URL({
    url,
    index,
  });
  newURL.save(callback);
};

module.exports = {
  createShortURL(req, res) {
    let { url } = req.body;
    if (!url.endsWith('/')) {
      url = `${url}/`;
    }
    const match = url.match(URLRegex);
    url = url.slice(0, -1);
    if (!match) {
      return res.json({ error: 'invalid URL' });
    }
    const [_, protocol, host, path] = match;
    dns.lookup(host, (err) => {
      if (err) {
        return res.json({"error": "invalid Hostname"});
      }
      URL.findOne({ url }, (err, storedUrl) => {
        if (err) {
          return res.send({ error: "Error searching for existing url :c" });
        }
        if (storedUrl) {
          res.json({ original_url: url, short_url: storedUrl.index});
        } else {
          Counter.findOneAndUpdate({}, {$inc: {count: 1}}, (err, counter) => {
            if (err) {
              return res.send({ error: "Error updating counter :c" });
            }
            if (counter) {
              createURL(url, counter.count, (err) => {
                if (err) {
                  return res.send({ error: "Error creating url :c" });
                }
                return res.json({ original_url: url, index: counter.count });
              });
            } else {
              var newCounter = new Counter();
              newCounter.save(function(err) {
                if (err) {
                  return res.send({ error: "Error creating counter :c" });
                }
                Counter.findOneAndUpdate({}, {$inc:{ count: 1 }},function(err, counter) {
                  if (err) {
                    return res.send({ error: "Error updating count after creation :c" });
                  }
                  createURL(url, counter.count, (err) => {
                    if (err) {
                      return res.send({ error: "Error creating url the first time :c" });
                    }
                    return res.json({ original_url: url, index: counter.count });
                  });
                });
              });
            }
          });
        }
      });
    });
  },

  redirectToURL(req, res) {
    const { short } = req.params;
    const index = parseInt(short);
    if (!index) {
      return res.json({ error: 'Wrong Format' });
    }
    URL.findOne({ index }, function (err, shortenedURL) {
      if (err) {
        return res.send({ error: 'error searching for short url' });
      };
      if (shortenedURL) {
        // redirect to the stored page
        res.redirect(shortenedURL.url);
      } else {
        res.json({ error: 'No short url found for given input' });
      }
    });
  }
}

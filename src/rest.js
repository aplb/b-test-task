const crypto = require('crypto');
const qs = require('querystring');
const rp = require('request-promise');
const { apiKey, secretKey, testnetAPIUrl, mainnetAPIUrl } = require('./config');

const defaultHeaders = {
  'X-MBX-APIKEY': apiKey,
};

const updateKeyInterval = 1000 * 60 * 30; // 30 min

const doRequest = async (options) => {
  const finalOptions = {
    ...{ headers: defaultHeaders },
    ...options,
  };
  return rp(finalOptions);
};

const listenKeyRequest = async (method, listenKey) => {
  try {
    const res = await doRequest({
      uri: `${testnetAPIUrl}/userDataStream`,
      method,
      headers: defaultHeaders,
      qs: {
        listenKey,
      },
      json: true,
    });

    return res;
  } catch (e) {
    console.log(e);
  }
};

class ListenerKeyMgr {
  constructor() {
    this.intervalId = null;
    this.listenKey = null;
  }

  async start() {
    try {
      const res = await listenKeyRequest('POST');
      this.intervalId = setInterval(this.updateListenKey.bind(this), updateKeyInterval);
      this.listenKey = res.listenKey;
      return res;
    } catch (err) {
      console.log(err);
    }
  }

  async updateListenKey() {
    try {
      await listenKeyRequest('PUT', this.listenKey);
    } catch (err) {
      console.log(err);
    }
  }

  async deleteListenKey() {
    try {
      await listenKeyRequest('DELETE', this.listenKey);
    } catch (err) {
      console.log(err);
    }
  }
}

const ping = async () => {
  try {
    const res = await doRequest({
      uri: `${testnetAPIUrl}/ping`,
      method: 'GET',
    });

    return res;
  } catch (e) {
    console.log(e);
  }
};

const get24hTopPairs = async () => {
  try {
    const res = await doRequest({
      uri: `${mainnetAPIUrl}/ticker/24hr`,
      method: 'GET',
      json: true,
    });

    return res;
  } catch (e) {
    console.log(e);
  }
};

// it seems the most right way is query serverTime, adjust drift and send again
const getAccountInfo = async () => {
  let ts = new Date().getTime();

  for (let retry = 0; retry < 5; retry++) {
    try {
      ts -= 3000;
      signature = crypto.createHmac('sha256', secretKey).update(qs.stringify({ timestamp: ts })).digest('hex');
      const res = await doRequest({
        uri: `${testnetAPIUrl}/account`,
        method: 'GET',
        qs: {
          timestamp: ts,
          signature,
        },
        json: true,
      });

      return res;
    } catch (e) {
      if (e.error.code = -1021) {
        console.log('Time drift detected, retry');
      }
    }
  }
};

module.exports = {
  ListenerKeyMgr,
  get24hTopPairs,
  getAccountInfo,
  ping,
};

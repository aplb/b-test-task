const WebSocket = require('ws');
const {  testnetWSUrl, mainnetWSUrl } = require('./config');

const openUserDataStream = (listenKey, callback) => {
  const ws = new WebSocket(`${testnetWSUrl}/${listenKey}`);
  ws.on('open', () => {
    console.log('connected to testnet ws userDataStream');

    if (typeof callback === 'function') {
      cb();
    }

    ws.on('message', (payload) => {
      try {
        payload = JSON.parse(payload);

        if (payload.e === 'outboundAccountPosition') {
          console.log('Account update!');
          console.log(JSON.stringify(payload), null, 2);
        } else if (payload.e === 'balanceUpdate') {
          console.log('Balance update!');
          console.log(JSON.stringify(payload), null, 2);
        }
      } catch (e) {
        console.error('Failed parsing json payload from userDataStream')
      }
    });
  });

  return ws;
};

const openTradePairStream = (pair, callback) => {
  const ws = new WebSocket(`${mainnetWSUrl}/${pair.symbol.toLowerCase()}@trade`);
  ws.on('open', () => {
    console.log(`connected to ${pair.symbol} stream`);

    if (typeof callback === 'function') {
      cb();
    }
  });

  return ws;
};

module.exports = {
  openUserDataStream,
  openTradePairStream,
};

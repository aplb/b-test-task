const { ListenerKeyMgr, get24hTopPairs, getAccountInfo } = require('./rest');
const Monitor = require('./monitoring');
const { openUserDataStream, openTradePairStream } = require('./ws');
const { getTop10PairsByVolume } = require('./utils');

const run = async () => {
  const keyMgr = new ListenerKeyMgr();
  const maybeKey = await keyMgr.start();

  if (!maybeKey.listenKey) {
    console.log('Oops, we were unable to fetch listenKey, exiting...');
    return;
  }

  const { listenKey } = maybeKey;

  const acc = await getAccountInfo();
  printPositiveBalances(acc);

  let pairs = await get24hTopPairs();
  pairs = getTop10PairsByVolume(pairs);
  printHighestVolumePairs(pairs);

  for (const pair of pairs) {
    openTradePairStream(pair);
  }

  openUserDataStream(listenKey);
  new Monitor().start();
};

const printHighestVolumePairs = (pairs) => {
  const out = [];
  out.push('\x1b[34m==== Highest 24h pairs ====');

  for (const pair of pairs) {
    out.push(`${pair.symbol} - ${pair.volume}`);
  }

  out.push('===========================\x1b[0m');
  console.log(out.join('\n'));
};

const printPositiveBalances = (acc) => {
  const out = [];
  out.push('\x1b[35m==== Available: ====');

  for (const item of acc.balances) {
    if (parseFloat(item.free) > 0) {
      out.push(`${item.asset} - ${item.free}`);
    }
  }

  out.push('\x1b[0m');
  console.log(out.join('\n'));
};

function initProcess() {
  process.on('uncaughtException', error => {
    console.error('Uncaught exception', error.message, error.stack);

    const message = error.message || '';
    const stack = (error.stack || '').split('\n');
    console.error('Uncaught exception. Exiting.', {
      error: { message, stack }
    });

    process.exit(100);
  });

  process.on('unhandledRejection', error => {
    console.error('UnhandledRejection', error.message, error.stack);
  });
}

initProcess();
run()
  .catch((err) => {
    console.log('Unexpected error;');
    console.log(err);
    process.exit(1);
  });

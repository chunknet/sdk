import assert from 'assert';
import { describe, it } from 'node:test';
import { ChunknetOracle } from '../src/index.js';
import { MockOracle, MockProvider } from './helpers/mockOracle.js';

const ADDRESS = '0x0000000000000000000000000000000000000001';

const setup = () => {
  const provider = new MockProvider();
  const oracleContract = new MockOracle();
  provider.register(ADDRESS, oracleContract);
  const chunknet = new ChunknetOracle(provider, ADDRESS);
  return { provider, oracleContract, chunknet };
};

const waitForTick = () => new Promise((resolve) => setImmediate(resolve));

describe('ChunknetOracle', () => {
  it('reads metrics information', async () => {
    const { oracleContract, chunknet } = setup();
    oracleContract.addMetric({ name: 'eth-usd', description: 'ETH price', currency: 'USD', tags: ['price'] });
    oracleContract.addMetric({ name: 'btc-usd', description: 'BTC price', currency: 'USD', tags: ['price'] });

    const count = await chunknet.getMetricsCount();
    assert.strictEqual(count, 2);

    const allMetrics = await chunknet.getMetrics();
    assert.deepStrictEqual(allMetrics[0].name, 'eth-usd');
    assert.deepStrictEqual(allMetrics[1].name, 'btc-usd');

    const firstMetric = await chunknet.getMetric(0);
    assert.strictEqual(firstMetric.description, 'ETH price');

    const hasMetric = await chunknet.hasMetric('btc-usd');
    assert.strictEqual(hasMetric.has, true);
    assert.strictEqual(hasMetric.id, 1);
  });

  it('quotes metrics by name and id', async () => {
    const { oracleContract, chunknet } = setup();
    oracleContract.addMetric({ name: 'eth-usd', description: 'ETH price', currency: 'USD', tags: ['price'] });
    oracleContract.addMetric({ name: 'btc-usd', description: 'BTC price', currency: 'USD', tags: ['price'] });

    oracleContract.updateQuoteByName('eth-usd', 2000n, 1234);
    oracleContract.updateQuoteByName('btc-usd', 30000n, 1235);

    const quotesByName = await chunknet.quoteMetricsByNames(['eth-usd', 'btc-usd']);
    assert.deepStrictEqual(quotesByName[0], { value: 2000n, updateTS: 1234 });
    assert.deepStrictEqual(quotesByName[1], { value: 30000n, updateTS: 1235 });

    const quotesByIds = await chunknet.quoteMetricsByIds([0, 1]);
    assert.deepStrictEqual(quotesByIds[0], { value: 2000n, updateTS: 1234 });
    assert.deepStrictEqual(quotesByIds[1], { value: 30000n, updateTS: 1235 });
  });

  it('subscribes and unsubscribes from events', async () => {
    const { oracleContract, chunknet } = setup();
    const received = { newMetric: [], metricInfo: [], metricUpdated: [] };

    const offNewMetric = chunknet.onNewMetric((name) => received.newMetric.push(name));
    const offMetricInfo = chunknet.onMetricInfoUpdated((name) => received.metricInfo.push(name));
    const offMetricUpdated = chunknet.onMetricUpdated((epochId, metricId) =>
      received.metricUpdated.push({ epochId, metricId })
    );

    oracleContract.addMetric({ name: 'eth-usd', description: 'ETH price', currency: 'USD', tags: ['price'] });
    oracleContract.updateMetricInfo(0, { description: 'Updated description' });
    oracleContract.updateQuoteByName('eth-usd', 2000n, 1000);

    await waitForTick();

    assert.deepStrictEqual(received.newMetric, ['eth-usd']);
    assert.deepStrictEqual(received.metricInfo, ['eth-usd']);
    assert.deepStrictEqual(received.metricUpdated, [{ epochId: 1, metricId: 0 }]);

    offNewMetric();
    offMetricInfo();
    offMetricUpdated();

    oracleContract.addMetric({ name: 'btc-usd', description: 'BTC price', currency: 'USD', tags: ['price'] });
    oracleContract.updateMetricInfo(1, { description: 'BTC updated' });
    oracleContract.updateQuoteByName('btc-usd', 30000n, 1200);

    await waitForTick();

    assert.deepStrictEqual(received.newMetric, ['eth-usd']);
    assert.deepStrictEqual(received.metricInfo, ['eth-usd']);
    assert.deepStrictEqual(received.metricUpdated, [{ epochId: 1, metricId: 0 }]);
  });
});

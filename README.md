# @chunknet/sdk

`@chunknet/sdk` is a lightweight Ethers.js wrapper for the `ICoreMultidataFeedsReader` oracle interface. It exposes typed helpers to read metrics and quotes and to subscribe to oracle events.

## Installation

```
npm install @chunknet/sdk ethers
```

## Usage

```javascript
import { ethers } from 'ethers';
import { ChunknetOracle } from '@chunknet/sdk';

const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const oracleAddress = '0xYourOracleContractAddress';

const oracle = new ChunknetOracle(provider, oracleAddress);

// Read metrics
const metrics = await oracle.getMetrics();
const { has, id } = await oracle.hasMetric('eth-usd');
const quotes = await oracle.quoteMetricsByNames(['eth-usd']);
const quotesByIds = await oracle.quoteMetricsByIds([0]);

// Listen for updates
const unsubscribeNewMetric = oracle.onNewMetric((name) => {
  console.log('New metric added:', name);
});

const unsubscribeMetricInfo = oracle.onMetricInfoUpdated((name) => {
  console.log('Metric info updated:', name);
});

const unsubscribeMetricUpdated = oracle.onMetricUpdated((epochId, metricId) => {
  console.log('Metric updated', { epochId, metricId });
});

// Stop listening
unsubscribeNewMetric();
unsubscribeMetricInfo();
unsubscribeMetricUpdated();
```

## API

### Constructor
`new ChunknetOracle(provider, address, options?)`
- `provider`: Ethers.js provider or signer.
- `address`: Oracle contract address.
- `options.contract` (optional): Pre-built contract instance, useful for testing.

### Methods
- `getMetrics()` → `Promise<Metric[]>`
- `getMetricsCount()` → `Promise<number>`
- `getMetric(id)` → `Promise<Metric>`
- `hasMetric(name)` → `Promise<{ has: boolean, id: bigint }>`
- `quoteMetricsByNames(names)` → `Promise<Quote[]>`
- `quoteMetricsByIds(ids)` → `Promise<Quote[]>`

### Event subscriptions
Each subscription returns an unsubscribe function.
- `onNewMetric(listener: (name: string) => void)`
- `onMetricInfoUpdated(listener: (name: string) => void)`
- `onMetricUpdated(listener: (epochId: bigint, metricId: bigint) => void)`

## Development

Run the test suite (uses Node's built-in test runner and local stubs so it does not require network access):

```
npm test
```

## CI/CD
- Tests run automatically on every push or pull request via GitHub Actions.
- Publishing to npm is available through a manual `workflow_dispatch` run of the release workflow.

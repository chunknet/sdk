import { Contract } from 'ethers';

export const MULTIDATA_FEEDS_ABI = [
  {
    "inputs": [],
    "name": "getMetrics",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "string", "name": "currency", "type": "string" },
          { "internalType": "string[]", "name": "tags", "type": "string[]" }
        ],
        "internalType": "struct ICoreMultidataFeedsReader.Metric[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMetricsCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "getMetric",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "string", "name": "currency", "type": "string" },
          { "internalType": "string[]", "name": "tags", "type": "string[]" }
        ],
        "internalType": "struct ICoreMultidataFeedsReader.Metric",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "name", "type": "string" }],
    "name": "hasMetric",
    "outputs": [
      { "internalType": "bool", "name": "has", "type": "bool" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string[]", "name": "names", "type": "string[]" }
    ],
    "name": "quoteMetrics",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "value", "type": "uint256" },
          { "internalType": "uint32", "name": "updateTS", "type": "uint32" }
        ],
        "internalType": "struct ICoreMultidataFeedsReader.Quote[]",
        "name": "quotes",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256[]", "name": "ids", "type": "uint256[]" }
    ],
    "name": "quoteMetrics",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "value", "type": "uint256" },
          { "internalType": "uint32", "name": "updateTS", "type": "uint32" }
        ],
        "internalType": "struct ICoreMultidataFeedsReader.Quote[]",
        "name": "quotes",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "name", "type": "string" }],
    "name": "NewMetric",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "name", "type": "string" }],
    "name": "MetricInfoUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "epochId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "metricId", "type": "uint256" }
    ],
    "name": "MetricUpdated",
    "type": "event"
  }
];

export class ChunknetOracle {
  constructor(provider, address, options = {}) {
    if (!provider) {
      throw new Error('A provider instance is required');
    }
    if (!address) {
      throw new Error('A contract address is required');
    }

    const { contract } = options;
    this.contract = contract ?? new Contract(address, MULTIDATA_FEEDS_ABI, provider);
  }

  async getMetrics() {
    return this.contract.getMetrics();
  }

  async getMetricsCount() {
    return this.contract.getMetricsCount();
  }

  async getMetric(id) {
    return this.contract.getMetric(id);
  }

  async hasMetric(name) {
    return this.contract.hasMetric(name);
  }

  async quoteMetricsByNames(names) {
    return this.contract.quoteMetrics(names);
  }

  async quoteMetricsByIds(ids) {
    return this.contract.quoteMetrics(ids);
  }

  onNewMetric(listener) {
    this.contract.on('NewMetric', listener);
    return () => this.contract.off('NewMetric', listener);
  }

  onMetricInfoUpdated(listener) {
    this.contract.on('MetricInfoUpdated', listener);
    return () => this.contract.off('MetricInfoUpdated', listener);
  }

  onMetricUpdated(listener) {
    this.contract.on('MetricUpdated', listener);
    return () => this.contract.off('MetricUpdated', listener);
  }
}

export default ChunknetOracle;

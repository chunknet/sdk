import { EventEmitter } from 'events';

export class MockOracle extends EventEmitter {
  constructor() {
    super();
    this.metrics = [];
    this.quotes = new Map();
    this.epochId = 0;
    this.contract = null;
  }

  registerContract(contract) {
    this.contract = contract;
  }

  addMetric({ name, description = '', currency = '', tags = [] }) {
    const metric = { name, description, currency, tags: [...tags] };
    this.metrics.push(metric);
    this.quotes.set(name, { value: 0n, updateTS: 0 });
    this.contract?.emit('NewMetric', name);
    return metric;
  }

  updateMetricInfo(id, updates) {
    const metric = this.metrics[id];
    if (!metric) {
      throw new Error('Metric not found');
    }
    Object.assign(metric, updates);
    this.contract?.emit('MetricInfoUpdated', metric.name);
  }

  updateQuoteByName(name, value, updateTS) {
    const entry = this.quotes.get(name);
    if (!entry) {
      throw new Error('Metric not found');
    }
    const metricId = this.metrics.findIndex((m) => m.name === name);
    this.epochId += 1;
    this.quotes.set(name, { value, updateTS });
    this.contract?.emit('MetricUpdated', this.epochId, metricId);
  }

  getMetrics() {
    return this.metrics.map((metric) => ({ ...metric, tags: [...metric.tags] }));
  }

  getMetricsCount() {
    return this.metrics.length;
  }

  getMetric(id) {
    const metric = this.metrics[id];
    if (!metric) {
      throw new Error('Metric not found');
    }
    return { ...metric, tags: [...metric.tags] };
  }

  hasMetric(name) {
    const id = this.metrics.findIndex((m) => m.name === name);
    return { has: id !== -1, id: id === -1 ? 0 : id };
  }

  quoteMetrics(params) {
    if (params.length === 0) return [];
    if (typeof params[0] === 'string') {
      return params.map((name) => {
        const quote = this.quotes.get(name);
        if (!quote) {
          throw new Error('Metric not found');
        }
        return { value: quote.value, updateTS: quote.updateTS };
      });
    }
    return params.map((id) => {
      const metric = this.metrics[id];
      if (!metric) {
        throw new Error('Metric not found');
      }
      const quote = this.quotes.get(metric.name);
      return { value: quote.value, updateTS: quote.updateTS };
    });
  }
}

export class MockProvider {
  constructor() {
    this.contracts = new Map();
  }

  register(address, contract) {
    this.contracts.set(address, contract);
  }

  getContract(address) {
    return this.contracts.get(address);
  }
}

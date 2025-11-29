import { EventEmitter } from 'events';

export class Contract extends EventEmitter {
  constructor(address, abi, provider) {
    super();
    this.address = address;
    this.abi = abi;
    this.provider = provider;
    this.target = provider?.getContract?.(address) ?? provider ?? {};

    if (typeof this.target?.registerContract === 'function') {
      this.target.registerContract(this);
    }

    const functions = Array.isArray(abi) ? abi.filter((entry) => entry.type === 'function') : [];
    for (const fn of functions) {
      if (!this[fn.name]) {
        this[fn.name] = (...args) => {
          const impl = this.target?.[fn.name];
          if (typeof impl !== 'function') {
            throw new Error(`Function ${fn.name} is not implemented on mock contract`);
          }
          return Promise.resolve(impl.apply(this.target, args));
        };
      }
    }
  }
}

export default { Contract };

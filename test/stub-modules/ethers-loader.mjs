import { pathToFileURL } from 'url';
import { resolve as pathResolve } from 'path';

const stubUrl = pathToFileURL(pathResolve('./test/stub-modules/ethers/index.js')).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'ethers') {
    return { url: stubUrl, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

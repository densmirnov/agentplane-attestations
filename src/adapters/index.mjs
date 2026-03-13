import { agentplaneAdapter } from './agentplane.mjs';

const adapters = new Map([[agentplaneAdapter.adapterId, agentplaneAdapter]]);

export function getRuntimeAdapter(adapterId) {
  const adapter = adapters.get(adapterId);
  if (!adapter) {
    throw new Error(`Unknown runtime adapter: ${adapterId}`);
  }
  return adapter;
}

export function listRuntimeAdapters() {
  return Array.from(adapters.values()).map((adapter) => ({
    adapterId: adapter.adapterId,
    runtime: adapter.runtime,
    version: adapter.version,
    description: adapter.description
  }));
}

export { agentplaneAdapter };

import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useEffect, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

interface AppConfig {
  backend_host?: string;
  backend_canister_id: string;
  storage_gateway_url: string;
  bucket_name: string;
  project_id: string;
}

let cachedConfig: AppConfig | null = null;

async function getConfig(): Promise<AppConfig> {
  if (!cachedConfig) {
    cachedConfig = await loadConfig();
  }
  return cachedConfig;
}

export function usePhotoStorage() {
  const { identity } = useInternetIdentity();
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  const getPhotoUrl = useCallback(
    (hash: string): string => {
      if (!config || !hash) return "";
      return `${config.storage_gateway_url}/v1/blob/?blob_hash=${encodeURIComponent(hash)}&owner_id=${encodeURIComponent(config.backend_canister_id)}&project_id=${encodeURIComponent(config.project_id)}`;
    },
    [config],
  );

  const uploadPhoto = useCallback(
    async (file: File, onProgress?: (pct: number) => void): Promise<string> => {
      const cfg = config || (await getConfig());
      const agentOptions: Record<string, unknown> = { host: cfg.backend_host };
      if (identity) agentOptions.identity = identity;
      const agent = HttpAgent.createSync(agentOptions as any);
      if (cfg.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      const client = new StorageClient(
        cfg.bucket_name,
        cfg.storage_gateway_url,
        cfg.backend_canister_id,
        cfg.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await client.putFile(bytes, onProgress);
      return hash;
    },
    [config, identity],
  );

  return { getPhotoUrl, uploadPhoto, configLoaded: !!config };
}

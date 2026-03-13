import {
  createPublicClient,
  createWalletClient,
  http,
  stringToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { verifyAttestation } from "./attestation.mjs";

const ANCHOR_PROTOCOL = "agentplane-attestation:v1";

function ensureValidAttestation(attestation) {
  const verification = verifyAttestation(attestation);
  if (!verification.integrityValid) {
    throw new Error(
      `Cannot build an anchor for an invalid attestation:\n- ${verification.errors.join("\n- ")}`,
    );
  }

  if (!attestation?.integrity?.attestationDigest) {
    throw new Error("Attestation is missing integrity.attestationDigest.");
  }

  return {
    verification,
    digest: String(attestation.integrity.attestationDigest),
  };
}

function normalizePrivateKey(privateKey) {
  const normalized = String(privateKey ?? "").trim();
  if (normalized.length === 0) {
    return null;
  }

  return normalized.startsWith("0x") ? normalized : `0x${normalized}`;
}

function summarizeRpcUrl(rpcUrl, options = {}) {
  try {
    const parsed = new URL(rpcUrl);
    return {
      rpcMode: options.custom ? "custom" : "default",
      rpcHost: parsed.host,
    };
  } catch {
    return {
      rpcMode: options.custom ? "custom" : "default",
      rpcHost: null,
    };
  }
}

export function buildAnchorMessage(attestationDigest) {
  return `${ANCHOR_PROTOCOL}:${attestationDigest}`;
}

export function validateAttestationAnchorReceipt(attestation, anchorReceipt) {
  const errors = [];
  const expectedMessage = buildAnchorMessage(
    attestation?.integrity?.attestationDigest,
  );

  if (anchorReceipt?.kind !== "attestation-anchor") {
    errors.push('anchorReceipt.kind must equal "attestation-anchor".');
  }
  if (anchorReceipt?.attestationId !== attestation?.attestationId) {
    errors.push("Anchor receipt attestationId does not match the attestation.");
  }
  if (
    anchorReceipt?.attestationDigest !==
    attestation?.integrity?.attestationDigest
  ) {
    errors.push(
      "Anchor receipt attestationDigest does not match the attestation digest.",
    );
  }
  if (anchorReceipt?.anchorSubject?.message !== expectedMessage) {
    errors.push(
      "Anchor receipt message does not match the attestation digest.",
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function buildAttestationAnchorReceipt(attestation, options = {}) {
  const { verification, digest } = ensureValidAttestation(attestation);
  const createdAt = options.createdAt ?? new Date().toISOString();
  const rpcUrl = options.rpcUrl ?? base.rpcUrls.default.http[0];
  const message = buildAnchorMessage(digest);

  return {
    schemaVersion: "1.0.0",
    kind: "attestation-anchor",
    product: attestation.product,
    createdAt,
    attestationId: attestation.attestationId,
    attestationDigest: digest,
    attestationSummary: {
      verdict: verification.verdict,
      score: verification.score,
      taskId: attestation.evidence?.task?.id ?? null,
    },
    network: {
      chain: "Base",
      chainId: base.id,
      ...summarizeRpcUrl(rpcUrl, { custom: Boolean(options.rpcUrl) }),
      explorerBaseUrl: `${base.blockExplorers.default.url}/tx/`,
    },
    anchorSubject: {
      protocol: ANCHOR_PROTOCOL,
      encoding: "utf8",
      message,
      calldata: stringToHex(message),
      valueWei: "0",
      targetStrategy: "self",
    },
    submission: {
      mode: "prepared",
      status: "not-submitted",
      txHash: null,
      txUrl: null,
      from: null,
      to: null,
      blockNumber: null,
      receiptStatus: null,
      submittedAt: null,
      confirmedAt: null,
      error: null,
    },
  };
}

export async function anchorAttestation(attestation, options = {}) {
  const rpcUrl = options.rpcUrl ?? base.rpcUrls.default.http[0];
  const receipt = buildAttestationAnchorReceipt(attestation, {
    createdAt: options.createdAt,
    rpcUrl,
  });

  if (!options.submit) {
    return receipt;
  }

  const privateKey = normalizePrivateKey(
    options.privateKey ?? process.env.BASE_PRIVATE_KEY,
  );

  if (!privateKey) {
    return {
      ...receipt,
      submission: {
        ...receipt.submission,
        mode: "failed",
        status: "failed",
        error: "BASE_PRIVATE_KEY is required when --submit is used.",
      },
    };
  }

  const account = privateKeyToAccount(privateKey);

  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http(rpcUrl),
    });
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(rpcUrl),
    });

    const hash = await walletClient.sendTransaction({
      account,
      chain: base,
      to: account.address,
      value: 0n,
      data: receipt.anchorSubject.calldata,
    });

    const chainReceipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
      ...receipt,
      submission: {
        mode: "confirmed",
        status: chainReceipt.status === "success" ? "confirmed" : "reverted",
        txHash: hash,
        txUrl: `${base.blockExplorers.default.url}/tx/${hash}`,
        from: account.address,
        to: account.address,
        blockNumber: chainReceipt.blockNumber?.toString() ?? null,
        receiptStatus: chainReceipt.status,
        submittedAt: receipt.createdAt,
        confirmedAt: new Date().toISOString(),
        error: null,
      },
    };
  } catch (error) {
    return {
      ...receipt,
      submission: {
        ...receipt.submission,
        mode: "failed",
        status: "failed",
        from: account.address,
        to: account.address,
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

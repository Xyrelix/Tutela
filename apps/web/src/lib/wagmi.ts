import { createConfig, http } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tutela-guard.vercel.app';

export function isMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);
}

export const wagmiConfig = createConfig({
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
  connectors: [
    injected(),
    ...(walletConnectProjectId
      ? [
          walletConnect({
            projectId: walletConnectProjectId,
            // On mobile we skip WalletConnect's bundled modal and hand the raw
            // pairing URI to the OS ourselves, so it can show its native
            // "open with" chooser across installed wallet apps.
            showQrModal: !isMobileBrowser(),
            metadata: {
              name: 'Tutela',
              description: 'Persistent monitoring agent for EVM wallets',
              url: appUrl,
              icons: [`${appUrl}/Tutela%20logo.png`],
            },
          }),
        ]
      : []),
  ],
});

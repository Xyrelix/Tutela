import { createConfig, http } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tutela-guard.vercel.app';

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
            showQrModal: true,
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

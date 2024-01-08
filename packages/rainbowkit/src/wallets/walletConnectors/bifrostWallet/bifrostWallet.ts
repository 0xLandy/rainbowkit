import { Chain } from '../../../components/RainbowKitProvider/RainbowKitChainContext';
import { getWalletConnectUri } from '../../../utils/getWalletConnectUri';
import { isAndroid } from '../../../utils/isMobile';
import { Wallet } from '../../Wallet';
import {
  getInjectedConnector,
  hasInjectedProvider,
} from '../../getInjectedConnector';
import {
  WalletConnectConnectorOptions,
  getWalletConnectConnector,
} from '../../getWalletConnectConnector';

export interface BifrostWalletOptions {
  projectId: string;
  chains: Chain[];
  walletConnectOptions?: WalletConnectConnectorOptions;
}

export const bifrostWallet = ({
  chains,
  projectId,
  walletConnectOptions,
}: BifrostWalletOptions): Wallet => {
  const isBifrostInjected = hasInjectedProvider({ flag: 'isBifrost' });
  const shouldUseWalletConnect = !isBifrostInjected;

  return {
    id: 'bifrostWallet',
    name: 'Bifrost Wallet',
    iconUrl: async () => (await import('./bifrostWallet.svg')).default,
    iconBackground: '#fff',
    installed: !shouldUseWalletConnect ? isBifrostInjected : undefined,
    downloadUrls: {
      android:
        'https://play.google.com/store/apps/details?id=com.bifrostwallet.app',
      ios: 'https://apps.apple.com/us/app/bifrost-wallet/id1577198351',
      qrCode: 'https://bifrostwallet.com/#download-app',
    },
    createConnector: () => {
      const connector = shouldUseWalletConnect
        ? getWalletConnectConnector({
            chains,
            projectId,
            options: walletConnectOptions,
          })
        : getInjectedConnector({
            flag: 'isBifrost',
            chains,
          });

      const getUri = async () => {
        const uri = await getWalletConnectUri(connector);

        return isAndroid()
          ? uri
          : `https://app.bifrostwallet.com/wc?uri=${encodeURIComponent(uri)}`;
      };

      return {
        connector,
        mobile: {
          getUri: shouldUseWalletConnect ? getUri : undefined,
        },
        qrCode: shouldUseWalletConnect
          ? {
              getUri: async () => getWalletConnectUri(connector),
              instructions: {
                learnMoreUrl:
                  'https://support.bifrostwallet.com/en/articles/6886814-how-to-use-walletconnect',
                steps: [
                  {
                    description:
                      'wallet_connectors.bifrost.qr_code.step1.description',
                    step: 'install',
                    title: 'wallet_connectors.bifrost.qr_code.step1.title',
                  },
                  {
                    description:
                      'wallet_connectors.bifrost.qr_code.step2.description',
                    step: 'create',
                    title: 'wallet_connectors.bifrost.qr_code.step2.title',
                  },
                  {
                    description:
                      'wallet_connectors.bifrost.qr_code.step3.description',
                    step: 'scan',
                    title: 'wallet_connectors.bifrost.qr_code.step3.title',
                  },
                ],
              },
            }
          : undefined,
      };
    },
  };
};

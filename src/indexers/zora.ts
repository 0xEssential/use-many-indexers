import { ZDK, ZDKNetwork } from '@zoralabs/zdk';
import { Chain } from '@zoralabs/zdk/dist/queries/queries-sdk';

import {
  CommonMetadata,
  CommonMetadataCandidate,
  TokenInput,
  validateMetadata,
} from '../common';

const request = async (
  { chainId, contractAddress, tokenId }: TokenInput,
  apiKey?: string,
): Promise<CommonMetadata> => {
  //  GOERLI or MAINNET
  const chainIdInt =
    typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;
  if (chainIdInt !== 1 && chainIdInt !== 5)
    return Promise.reject(new Error(`chainId ${chainId} not supported by ZDK`));

  const API_ENDPOINT = 'https://api.zora.co/graphql';
  const zdk = new ZDK({ endpoint: API_ENDPOINT, apiKey });
  const { token } = await zdk.token({
    token: {
      address: contractAddress,
      tokenId: tokenId.toString(),
    },
    network: {
      network: ZDKNetwork.Ethereum,
      chain: chainIdInt === 1 ? Chain.Mainnet : Chain.Goerli,
    },
  });

  const metadata: CommonMetadataCandidate = {
    name: token?.token?.name ?? undefined,
    imageUrl: token?.token?.image?.url ?? undefined,
  };

  const { valid, errors } = validateMetadata(metadata);

  if (valid) {
    console.warn(
      `resolved ${JSON.stringify({
        contractAddress,
        tokenId,
      })} via Zora`,
    );

    return metadata as CommonMetadata;
  }

  return Promise.reject(
    new Error(
      `Zora failed to provide valid metadata for ${JSON.stringify({
        contractAddress,
        tokenId,
      })}. ${JSON.stringify({
        errors,
      })}`,
    ),
  );
};

const configure = (apiKey?: string) => {
  return (token: TokenInput) => request(token, apiKey);
};

export default configure;

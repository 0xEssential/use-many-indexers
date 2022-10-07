import { Network as CenterNetwork } from 'nft-react';

import { CommonMetadata, TokenInput, validateMetadata } from '../common';

const request = async (
  { chainId, contractAddress, tokenId }: TokenInput,
  apiKey: string,
): Promise<CommonMetadata> => {
  const networks: Record<string, CenterNetwork> = {
    '1': 'ethereum-mainnet',
    '137': 'polygon-mainnet',
  };

  if (!networks[chainId.toString()])
    return Promise.reject(
      new Error(`chainId ${chainId} not supported by Center`),
    );

  const {
    name,
    metadata: { image },
  } = await fetch(
    `https://api.center.dev/v1/${
      networks[chainId.toString()]
    }/${contractAddress}/${tokenId}`,
    {
      headers: {
        'X-API-Key': apiKey,
      },
    },
  ).then((resp) => resp.json());
  const metadata = { name, imageUrl: image };
  const { valid, errors } = validateMetadata(metadata);

  if (valid) {
    console.warn(
      `resolved ${JSON.stringify({
        contractAddress,
        tokenId,
      })} via Center`,
    );

    return metadata;
  }

  return Promise.reject(
    new Error(
      `Center failed to provide metadata for ${JSON.stringify({
        contractAddress,
        tokenId,
      })}. ${JSON.stringify({
        errors,
      })}`,
    ),
  );
};

const configure = (apiKey: string) => {
  return (token: TokenInput) => request(token, apiKey);
};
export default configure;

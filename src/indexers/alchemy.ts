import { Alchemy, Network, NftTokenType } from 'alchemy-sdk';
import { CommonMetadata, TokenInput, validateMetadata } from '../common';

type AlchemyChainConfig = {
  apiKey: string;
  network: Network;
};

const request = async (
  { chainId, contractAddress, tokenId }: TokenInput,
  alchemyApps: Record<string, AlchemyChainConfig>,
): Promise<CommonMetadata> => {
  const chainOpts = alchemyApps[chainId.toString()];
  if (!chainOpts.apiKey)
    return Promise.reject(
      new Error(`Alchemy not configured for chain ${chainId}`),
    );

  const alchemy = new Alchemy(chainOpts);
  const token = await alchemy.nft.getNftMetadata(
    contractAddress,
    tokenId,
    NftTokenType.ERC721,
  );

  const metadata: CommonMetadata = {
    name: token?.title,
    imageUrl: token?.media?.[0]?.gateway,
  };

  const { valid, errors } = validateMetadata(metadata);

  if (valid) {
    console.warn(
      `resolved ${JSON.stringify({
        contractAddress,
        tokenId,
      })} via Alchemy`,
    );

    return metadata;
  }

  return Promise.reject(
    new Error(
      `Alchemy failed to provide metadata for ${JSON.stringify({
        contractAddress,
        tokenId,
      })}. ${JSON.stringify({
        errors,
      })}`,
    ),
  );
};

const configure = (apps: Record<string, AlchemyChainConfig>) => {
  return (token: TokenInput) => request(token, apps);
};

export default configure;

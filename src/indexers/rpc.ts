import { Contract, providers } from 'ethers';

import {
  CommonMetadata,
  ERC721_TOKEN_URI_ABI,
  TokenInput,
  validateMetadata,
} from '../common';

const request = async (
  chains: Record<string, string>,
  { chainId, contractAddress, tokenId }: TokenInput,
  ipfs: (hash: string) => string,
): Promise<CommonMetadata> => {
  const provider = new providers.JsonRpcProvider(chains[chainId]);

  const contract = new Contract(
    contractAddress,
    ERC721_TOKEN_URI_ABI,
    provider,
  );
  const tokenUri = await contract.tokenURI(tokenId);

  // eslint-disable-next-line @typescript-eslint/camelcase
  const { name, image, image_url } = await fetch(ipfs(tokenUri)).then((resp) =>
    resp.json(),
  );

  const metadata: CommonMetadata = {
    name,
    imageUrl: image ? ipfs(image) : ipfs(image_url),
  };

  if (validateMetadata(metadata)) {
    console.warn(
      `resolved ${JSON.stringify({
        contractAddress,
        tokenId,
      })} via Contract`,
    );
    return metadata;
  }

  return Promise.reject();
};

const configure = (
  chains: Record<string, string>,
  ipfsHandler: (hash: string) => string = (hash) =>
    `https://ipfs.io/ipfs/${hash}`,
) => {
  return (token: TokenInput) => request(chains, token, ipfsHandler);
};

export default configure;

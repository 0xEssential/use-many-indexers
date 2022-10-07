import { BigNumberish } from 'ethers';
import { useContext } from 'react';

import { CommonMetadata, TokenInput } from './common';
import { MetadataContext } from './metadataContext';

const findMetadata = async (
  sources: ((input: TokenInput) => Promise<CommonMetadata>)[],
  { chainId, contractAddress, tokenId }: TokenInput,
): Promise<CommonMetadata> => {
  // eslint-disable-next-line no-restricted-syntax
  for (const source of sources) {
    // eslint-disable-next-line no-await-in-loop
    const result = await source({ chainId, contractAddress, tokenId }).catch(
      (e: Error) => {
        console.log(e);
      },
    );

    if (result) {
      return result;
    }
  }

  return null;
};

export default function useMetadataRescue(): ({
  chainId,
  contractAddress,
  tokenId,
}: {
  chainId: string | number;
  contractAddress: string;
  tokenId: BigNumberish;
}) => Promise<CommonMetadata> {
  const { indexers } = useContext(MetadataContext);

  const rescueMetadata = async ({
    chainId,
    contractAddress,
    tokenId,
  }: {
    chainId: string | number;
    contractAddress: string;
    tokenId: BigNumberish;
  }) => {
    return findMetadata(indexers, { chainId, contractAddress, tokenId });
  };

  return rescueMetadata;
}

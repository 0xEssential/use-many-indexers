import { BigNumberish } from 'ethers';

export type TokenInput = {
  chainId: string | number;
  contractAddress: string;
  tokenId: BigNumberish;
};

export type CommonMetadata = {
  name: string;
  imageUrl: string;
};

export type CommonMetadataCandidate = {
  name?: string;
  imageUrl?: string;
};

export const ERC721_TOKEN_URI_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const validateMetadata = ({
  name,
  imageUrl,
}: CommonMetadataCandidate): { valid: boolean; errors: string[] } => {
  const errors = [];
  if (!name) errors.push('Missing name');
  if (!imageUrl) errors.push('Missing image URL');

  return { valid: errors.length === 0, errors };
};

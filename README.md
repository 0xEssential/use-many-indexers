# use-many-indexers

React hook for fetching NFT metadata serially from multiple indexers.

NFT metadata indexing services face an immense challenge in covering edge cases for every NFT on multiple blockchains.

This React library allows developers to specify an array of indexing services, and each will be queried in order until a successful response is returned.

We recommend using this project to catch or rescue token metadata when your primary service fails. The library does not support fetching metadata for an array of NFTs - you should choose a primary indexing service that provides metadata for many NFTs in one query, then use this library as a fallback to fetch any metadata your primary service missed.

## Status

This project is in beta. 0xEssential got tired of trying to find the best indexer, so we built this project to serve our own needs. We're happy to share it with the community, but make no promises about maintenance or additional functionality.

### TODOs We Wont Do But You Can

- **More metadata fields:** The package returns a barebones object with `name` and `imageUrl` strings. We'd be happy to return more data, but standardizing API responses and TS types across a handful of providers is a lot of busy work. PRs welcome!

- **More indexers & indexer docs:** We're pretty happy with coverage we get from the providers we integrated and rarely fall back to RPC calls. We've also standardized an API for adding indexing services and expect that indexers who want to be integrated will submit PRs for their own services.

- **Tests**: lol

- **Logging**: ok we might actually want to make logging better. Using console logs now, should probably use a Logger that can be configured. But it's also kinda nice to see in the console which service provides the best data.

## Install

```bash
 yarn add @0xessential/use-many-indexers
```

## Import

Import the `<MetadataProvider>` to wrap any components that require NFT metadata. Typically you'll add this to an outer component like NextJS `_app.tsx`, but we recommend adding the context provider as deep in your React component tree as possible for best performance.  

```jsx
  // _app.tsx
  import type { AppProps } from 'next/app';
  import { MetadataProvider } from '@0xessential/use-many-indexers';
  import React from 'react';

  function MyApp({ Component, pageProps }: AppProps) {
    return (      
      <MetadataProvider>
        <Component {...pageProps} />
      </MetadataProvider>
    );
  }

  export default MyApp;
```

## Configure

Each supported indexer provides a configuration function that accepts arguments for authentication and network support. You must pass at least one indexer to the `<MetadataProvider>`.

Indexers will be queried in the order you provide them in MetadataProvider configuration.

We suggest working bottom up, first implementing the `rpc` indexer - this fallback fetches the `tokenURI` and then metadata directly from a contract. Then add configuration above until you're happy with coverage.

### rpc

The `rpc` indexer provides a fallback that fetches an NFT's `tokenURI` from the NFT contract via an RPC provider. The user's browser then fetches metadata from the `tokenURI`.

This should be included last in your array of indexers as a final fallback, but is a sensible configuration to start with.

The `rpc` configuration expects an RPC URL for each network you support in your dapp, plus a function for resolving `ipfs://` protocol URIs to an `https` protocol URL.

```jsx
  //...
  import { MetadataProvider, rpc } from '@0xessential/use-many-indexers';
  //...

  function MyApp({ Component, pageProps }: AppProps) {
    return (      
      <MetadataProvider indexers={[
        rpc(
          {
            '1': process.env.MAINNET_RPC_URL,
            '137': process.env.POLYGON_RPC_URL
          },
          (hash) => url.replace('ipfs://', 'https://ipfs.io/ipfs/')
        )
      ]}>
        <Component {...pageProps} />
      </MetadataProvider>
    );
  }

  return MyApp;
```

### Infura

The `infura` indexer provides a fallback that fetches an NFT's `tokenURI` from the NFT contract using an Infura RPC URL.

If you're an Infura customer, this option is a bit simpler than the `rpc` fallback - just provide your Infura API key and the package will query the correct network.

You'll also need to provide a function to resolve IPFS URIs like in the `rpc` indexer.

```jsx
  //...
  import { MetadataProvider, infura } from '@0xessential/use-many-indexers';
  import { ipfs } from '~utils/network.ts';
  //...

  function MyApp({ Component, pageProps }: AppProps) {
    return (      
      <MetadataProvider indexers={[
        infura(
          process.env.INFURA_API_KEY,
          (hash) => ipfs(hash),
        )
      ]}>
        <Component {...pageProps} />
      </MetadataProvider>
    );
  }

  return MyApp;
```

### Zora

Zora supports Ethereuem Mainnet and Goerli Testnet. An API key is optional. Coverage is very good but supports limited networks.

```jsx
  //...
  import { MetadataProvider, zora } from '@0xessential/use-many-indexers';
  //...

  function MyApp({ Component, pageProps }: AppProps) {
    return (      
      <MetadataProvider indexers={[
        zora(process.env.ZORA_API_KEY_IS_OPTIONAL)
      ]}>
        <Component {...pageProps} />
      </MetadataProvider>
    );
  }

  return MyApp;
```

### Alchemy

Alchemy requires an API key per network your dApp supports. Configuration is passed as a nested object - string keys for each chain ID you support, and an object value with `apiKey` and `network` keys.

```jsx
  //...
  import { MetadataProvider, alchemy } from '@0xessential/use-many-indexers';
  import { Network } from 'alchemy-sdk';
  //...

  function MyApp({ Component, pageProps }: AppProps) {
    return (      
      <MetadataProvider indexers={[
        alchemy({
          '1': {
            apiKey: process.env.ALCHEMY_ETH_MAINNET_API_KEY,
            network: Network.ETH_MAINNET,
          },
          '137': {
            apiKey: process.env.ALCHEMY_POLYGON_MAINNET_API_KEY,
            network: Network.MATIC_MAINNET,
          }
        })
      ]}>
        <Component {...pageProps} />
      </MetadataProvider>
    );
  }

  return MyApp;
```

### Center

[Center](https://center.dev/) supports Ethereuem and Polygon mainnets. An API key is required but works with every Center-supported chain.

```jsx
  //...
  import { MetadataProvider, center } from '@0xessential/use-many-indexers';
  //...

  function MyApp({ Component, pageProps }: AppProps) {
    return (      
      <MetadataProvider indexers={[
        center(process.env.CENTER_API_KEY)
      ]}>
        <Component {...pageProps} />
      </MetadataProvider>
    );
  }

  return MyApp;
```

## Usage

Once your `<MetadataProvider>` is configured you're ready to start catching missing metadata throughout your dapp.

The library provides a "lazy hook" `useMetadataRescue` that returns a callable function should you need to rescue metadata.

Consider the following example, a React component for an NFT Image based on `next/image`.

Remember that this library is intended to be used as a fallback for your primary indexing service.

Here we build a React component that expects an `nft` prop that includes `contractAddress`, `tokenId` and hopefully valid `imageUrl` values.

```ts
import { useMetadataRescue } from '@0xessential/use-many-indexers';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const NFTImage = ({
  nft,
  alt,
  width,
  height,
}: {
  alt?: string;
  width: number;
  height: number;
  nft: { 
    tokenId: string;
    contractAddress: string;
    imageUrl: string;
  };
}) => {
  const [src, setSrc] = useState<string>(nft.imageUrl || '/placeholder.png');
  const rescueMetadata = useMetadataRescue();

  useEffect(() => {
    if (!nft.imageUrl) {
      const rescue = async () => {
        const md = await rescueMetadata({
          chainId: '1',
          contractAddress: nft.contractAddress,
          tokenId: nft.tokenId,
        });
        md?.imageUrl && setSrc(md?.imageUrl);
      };
      rescue();
    }
  }, []);

  return <Image src={src} alt={alt} width={width} height={height} />;
};

export default NFTImage;
```

If your primary metadata indexing service fails to provide an image URL, this component will query each configured indexer in order until a valid response is returned.

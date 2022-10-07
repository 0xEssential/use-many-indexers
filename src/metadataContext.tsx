import React, { createContext, ReactElement } from 'react';

type MetadataContextValues = {
  indexers: any[];
  ipfsHandler?: (hash: string) => string;
};

const defaultValue: MetadataContextValues = {
  indexers: [],
  ipfsHandler: (hash: string) => `https://ipfs.io/ipfs/${hash}`,
};

const MetadataContext = createContext(defaultValue);

const MetadataContextProvider = ({
  children,
  indexers,
}: {
  children: ReactElement;
  indexers: any[];
}): ReactElement => {
  const value = {
    ...defaultValue,
    indexers,
  };

  return (
    <MetadataContext.Provider value={value}>
      {children}
    </MetadataContext.Provider>
  );
};

export default MetadataContextProvider;
export { MetadataContext };

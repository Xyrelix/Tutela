export interface ContractLabel {
  name: string;
  domain: string;
}

// Well-known contract addresses, lowercased, mapped to the dApp/protocol they
// belong to. Every address below was cross-checked against Etherscan before
// being added — an incorrect entry here would misattribute trust in a
// security tool, so don't add one from memory without verifying it first.
// Addresses are unique per deployment, so the same protocol can appear more
// than once across versions/chains — add entries as they come up rather than
// trying to be exhaustive.
const KNOWN_CONTRACTS: Record<string, ContractLabel> = {
  // Uniswap
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': { name: 'Uniswap V2 Router', domain: 'uniswap.org' },
  '0xe592427a0aece92de3edee1f18e0157c05861564': { name: 'Uniswap V3 Router', domain: 'uniswap.org' },
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': { name: 'Uniswap V3 Router 2', domain: 'uniswap.org' },
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': { name: 'Uniswap Universal Router', domain: 'uniswap.org' },
  '0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b': { name: 'Uniswap Universal Router 2', domain: 'uniswap.org' },
  '0x66a9893cc07d91d95644aedd05d03f95e1dba8af': { name: 'Uniswap Universal Router (V4)', domain: 'uniswap.org' },
  '0x000000000022d473030f116ddee9f6b43ac78ba3': { name: 'Uniswap Permit2', domain: 'uniswap.org' },

  // SushiSwap
  '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': { name: 'SushiSwap Router', domain: 'sushi.com' },

  // Curve
  '0x16c6521dff6bab339122a0fe25a9116693265353': { name: 'Curve Router', domain: 'curve.fi' },

  // Compound
  '0xc3d688b66703497daa19211eedff47f25384cdc3': { name: 'Compound V3 (USDC)', domain: 'compound.finance' },

  // Lido
  '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': { name: 'Lido stETH', domain: 'lido.fi' },
  '0x889edc2edab5f40e902b864ad4d7ade8e412f9b1': { name: 'Lido Withdrawal Queue', domain: 'lido.fi' },

  // Balancer
  '0xba12222222228d8ba445958a75a0704d566bf2c8': { name: 'Balancer V2 Vault', domain: 'balancer.fi' },

  // Aerodrome (Base)
  '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43': { name: 'Aerodrome Router', domain: 'aerodrome.finance' },

  // LooksRare
  '0x59728544b08ab483533076417fbbb2fd0b17ce3a': { name: 'LooksRare Exchange', domain: 'looksrare.org' },
  '0x0000000000e655fae4d56241588680f86e3b2377': { name: 'LooksRare Exchange V2', domain: 'looksrare.org' },

  // OpenSea
  '0x00000000006c3852cbef3e08e8df289169ede581': { name: 'OpenSea Seaport 1.1', domain: 'opensea.io' },
  '0x00000000000000adc04c56bf30ac9d3c0aaf14dc': { name: 'OpenSea Seaport 1.5', domain: 'opensea.io' },
  '0x0000000000000068f116a894984e2db1123eb395': { name: 'OpenSea Seaport 1.6', domain: 'opensea.io' },
  '0x1e0049783f008a0085193e00003d00cd54003c71': { name: 'OpenSea Conduit', domain: 'opensea.io' },

  // Aave
  '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2': { name: 'Aave V3 Pool', domain: 'aave.com' },

  // 1inch
  '0x1111111254eeb25477b68fb85ed929f73a960582': { name: '1inch Router V5', domain: '1inch.io' },
  '0x111111125421ca6dc452d289314280a0f8842a65': { name: '1inch Router V6', domain: '1inch.io' },

  // 0x Protocol
  '0xdef1c0ded9bec7f1a1670819833240f027b25eff': { name: '0x Exchange Proxy', domain: '0x.org' },

  // Blur
  '0x000000000000ad05ccc4f10045630fb830b95127': { name: 'Blur Marketplace', domain: 'blur.io' },
  '0x39da41747a83aee658334415666f3ef92dd0d541': { name: 'Blur Marketplace 2', domain: 'blur.io' },
  '0xb2ecfe4e4d61f8790bbb9de2d1259b9e2410cea5': { name: 'Blur Marketplace 3', domain: 'blur.io' },

  // MetaMask
  '0x881d40237659c251811cec9c364ef91dc08d300c': { name: 'MetaMask Swap Router', domain: 'metamask.io' },
  '0x74de5d4fcbf63e00296fd95d33236b9794016631': { name: 'MetaMask Swaps Spender', domain: 'metamask.io' },
};

export function getContractLabel(address: string): ContractLabel | null {
  return KNOWN_CONTRACTS[address.toLowerCase()] ?? null;
}

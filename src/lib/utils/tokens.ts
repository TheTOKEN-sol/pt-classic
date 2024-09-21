import { clients, tokenPrices, userBalances } from '$lib/stores'
import { prizeVault, tokenSwapRouteConfigs } from '$lib/config'
import { validateClientNetwork } from './providers'
import { dolphinAddress } from '$lib/constants'
import { erc20Abi, type Address } from 'viem'
import { lower } from './formatting'
import { get } from 'svelte/store'

export const getTokenBalances = async (owner: Address, tokenAddresses: Address[]) => {
  const balances: { [tokenAddress: Lowercase<Address>]: bigint } = {}

  const publicClient = get(clients).public
  validateClientNetwork(publicClient)

  const uniqueTokenAddresses = [...new Set<Lowercase<Address>>(tokenAddresses.filter((a) => a !== dolphinAddress).map(lower))]

  const multicall = await publicClient.multicall({
    contracts: tokenAddresses.map((tokenAddress) => ({ address: tokenAddress, abi: erc20Abi, functionName: 'balanceOf', args: [owner] }))
  })

  uniqueTokenAddresses.forEach((address, i) => {
    if (multicall[i].status === 'success' && typeof multicall[i].result === 'bigint') {
      balances[address] = multicall[i].result
    }
  })

  if (tokenAddresses.includes(dolphinAddress)) {
    balances[dolphinAddress] = await publicClient.getBalance({ address: owner })
  }

  return balances
}

export const getTokenPrice = async (token: { address: Address; decimals: number }) => {
  const existingTokenPrice = get(tokenPrices)[lower(token.address)]
  if (existingTokenPrice !== undefined) return existingTokenPrice

  const dskit = get(clients).dskit
  !!dskit?.publicClient && validateClientNetwork(dskit.publicClient)

  const tokenPrice = await dskit?.price.ofToken({ token, tokenDenominator: prizeVault.asset }, tokenSwapRouteConfigs[lower(token.address)])

  tokenPrices.update((oldTokenPrices) => ({ ...oldTokenPrices, [lower(token.address)]: tokenPrice }))

  return tokenPrice
}

export const updateUserTokenBalances = async (owner: Address, tokenAddresses: Address[]) => {
  const updatedBalances = await getTokenBalances(owner, tokenAddresses)
  userBalances.update((oldBalances) => ({ ...oldBalances, ...updatedBalances }))
}

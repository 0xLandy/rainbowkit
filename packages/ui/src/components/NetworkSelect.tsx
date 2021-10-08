import React, { ReactNode, useMemo } from 'react'
import { Chain, chains, switchNetwork } from '@rainbowkit/utils'
import { Web3Provider } from '@ethersproject/providers'
import { useState } from 'react'
import { styled } from '@linaria/react'
import { findInSubArray, hasSubArray } from '../utils'
import { css } from '@linaria/core'

export interface NetworkSelectProps {
  chains: string[]
  provider: Web3Provider
  chainId: number
  classNames?: Partial<{
    select: string
    option: string
    hidden: string
    current: string
    list: string
    icon: string
  }>
}

const Select = styled.div`
  position: relative;
`

type ListProps = { isExpanded: boolean; className: string }

const List = styled.div<ListProps>`
  position: absolute;
  left: 0;
  width: 100%;
  padding-bottom: 1rem;
  display: ${(props) => (props.isExpanded ? 'block' : 'none')};
  z-index: 10;
  border-radius: 15px;
  top: 70px;
  padding-top: 20px;
`

const Option = styled.div`
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-direction: row;
  img {
    margin-right: 1rem;
  }
`

export interface ChainOptionProps {
  chain: Chain
  children?: ReactNode
  iconClassName?: string
}

const Icon = styled.img`
  max-height: 1.25rem;
`

export const ChainOption = ({
  chain,
  children,
  iconClassName,
  ...props
}: ChainOptionProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <Option aria-label="option" {...props} className={props.className}>
    <Icon
      aria-hidden="true"
      className={` ${iconClassName}`}
      src={chain.logoURL || 'https://bafkreidyoljjm3jbmbewkxunvnn76s6cswo3d7ldhpnas54uphil23vlfu.ipfs.dweb.link/'}
    />{' '}
    {chain.name} {children}
  </Option>
)

export const NetworkSelect = ({ chains: chainNames, provider, classNames = {}, chainId }: NetworkSelectProps) => {
  const [isExpanded, setExpand] = useState(false)

  const currentChain = useMemo(() => chains.find((chain) => chain.chainId === chainId), [chainId])

  const filteredChains = useMemo(
    () =>
      chains
        .filter((chain) => hasSubArray(chainNames, chain.aliases))
        // to sort the same way as given in props
        .sort((a, b) => findInSubArray(chainNames, a.aliases) - findInSubArray(chainNames, b.aliases)),
    [chainNames]
  )

  return (
    <Select
      tabIndex={0}
      role="button"
      aria-label="select"
      aria-roledescription="Select a dapp network"
      className={classNames?.select}
    >
      {currentChain?.chainId && (
        <ChainOption
          aria-selected={true}
          chain={currentChain}
          className={`${css`
            z-index: 20;
          `} ${classNames?.current}`}
          onClick={() => setExpand(!isExpanded)}
          iconClassName={classNames?.icon}
        />
      )}
      <List isExpanded={isExpanded} className={`${isExpanded ? '' : classNames?.hidden} ${classNames.list || ''}`}>
        {filteredChains
          .filter((ch) => ch.chainId !== chainId)
          .map((ch) => {
            return (
              <ChainOption
                chain={ch}
                key={ch.name}
                onClick={() => switchNetwork(provider, ch)}
                className={classNames.option || ''}
                iconClassName={classNames?.icon || ''}
              />
            )
          })}
      </List>
    </Select>
  )
}
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WalletContextType {
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  balance: string | null
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  balance: null
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Sayfa yüklendiğinde önceki bağlantıyı kontrol et
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          await fetchBalance(accounts[0])
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const fetchBalance = async (addr: string) => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const bal = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [addr, 'latest']
        })
        // Wei'den ETH'ye çevir
        const ethBalance = parseInt(bal, 16) / 1e18
        setBalance(ethBalance.toFixed(4))
      } catch (error) {
        console.error('Error fetching balance:', error)
      }
    }
  }

  const connect = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setAddress(accounts[0])
        setIsConnected(true)
        await fetchBalance(accounts[0])

        // Hesap değişikliklerini dinle
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0])
            fetchBalance(accounts[0])
          } else {
            disconnect()
          }
        })
      } catch (error) {
        console.error('Error connecting wallet:', error)
      }
    } else {
      alert('MetaMask yüklü değil! Lütfen MetaMask yükleyin.')
    }
  }

  const disconnect = () => {
    setAddress(null)
    setBalance(null)
    setIsConnected(false)
  }

  return (
    <WalletContext.Provider value={{ address, isConnected, connect, disconnect, balance }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)

// TypeScript için window.ethereum tanımı
declare global {
  interface Window {
    ethereum?: any
  }
}

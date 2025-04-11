// store/provider.tsx
"use client"

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'

// Contexto para gerenciar a hidratação da store
type StoreHydrationContextType = {
  hydrated: boolean;
}

const StoreHydrationContext = createContext<StoreHydrationContextType>({
  hydrated: false,
});

// Hook para verificar se a store foi hidratada
export const useIsHydrated = () => {
  return useContext(StoreHydrationContext).hydrated;
}

// Provider para gerenciar a hidratação de todas as stores
interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [hydrated, setHydrated] = useState(false);

  // Efeito para hidratar o store no lado do cliente
  useEffect(() => {
    // Marca como hidratado depois do primeiro render no cliente
    setHydrated(true);
  }, []);

  return (
    <StoreHydrationContext.Provider value={{ hydrated }}>
      {children}
    </StoreHydrationContext.Provider>
  );
}
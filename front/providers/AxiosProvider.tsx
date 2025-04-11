// src/providers/AxiosProvider.tsx
"use client"

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setupAxiosInterceptors } from '@/lib/axios';

interface AxiosProviderProps {
  children: ReactNode;
}

export default function AxiosProvider({ children }: AxiosProviderProps) {
  const router = useRouter();

  useEffect(() => {
    // Configura os interceptores do Axios uma vez quando o componente é montado
    setupAxiosInterceptors(router);
  }, [router]);

  return <>{children}</>;
}
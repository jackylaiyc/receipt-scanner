'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface PermissionsContextValue {
  canAccessCompany: boolean;
  loading: boolean;
}

const PermissionsContext = createContext<PermissionsContextValue>({
  canAccessCompany: false,
  loading: true,
});

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [canAccessCompany, setCanAccessCompany] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/permissions')
      .then((r) => r.json())
      .then((data) => {
        setCanAccessCompany(data.canAccessCompany ?? false);
      })
      .catch(() => setCanAccessCompany(false))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PermissionsContext.Provider value={{ canAccessCompany, loading }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

interface AdminMobileContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
}

const AdminMobileContext = createContext<AdminMobileContextType>({
  isOpen: false,
  setIsOpen: () => {},
  toggle: () => {},
  close: () => {},
});

export const AdminMobileProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <AdminMobileContext.Provider value={{ isOpen, setIsOpen, toggle, close }}>
      {children}
    </AdminMobileContext.Provider>
  );
};

export const useAdminMobile = () => useContext(AdminMobileContext);

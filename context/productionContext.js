import React, { createContext, useState, useContext } from 'react';

const ProductionContext = createContext();

export const ProductionProvider = ({ children }) => {
  const [isLive, setIsLive] = useState(false);

  return (
    <ProductionContext.Provider value={{ isLive, setIsLive }}>
      {children}
    </ProductionContext.Provider>
  );
};

export const useProduction = () => useContext(ProductionContext);
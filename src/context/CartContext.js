import React, {
    createContext,
    useContext,
    useReducer,
} from 'react';
import cartReducer, {
    initialState,
} from '../reducers/cartReducer';
  
  const CartContext = createContext(null);
  
  export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(
      cartReducer,
      initialState
    );
  
    return (
      <CartContext.Provider value={{ state, dispatch }}>
        {children}
      </CartContext.Provider>
    );
  }
  
  export function useCart() {
    const context = useContext(CartContext);
  
    if (!context) {
      throw new Error('useCart must be used inside CartProvider');
    }
  
    return context;
  }
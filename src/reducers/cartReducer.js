const initialState = {
    items: [],
    promoCode: '',
    discountPercent: 0,
    promoError: '',
  };
  
  export { initialState };
  
  export default function cartReducer(state, action) {
    switch (action.type) {
      case 'ADD_ITEM': {
        const existingItem = state.items.find(
          (item) => item.id === action.payload.id
        );
  
        if (existingItem) {
          return {
            ...state,
            items: state.items.map((item) =>
              item.id === action.payload.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          };
        }
  
        return {
          ...state,
          items: [
            ...state.items,
            {
              ...action.payload,
              quantity: 1,
              note: '',
            },
          ],
        };
      }
  
      case 'REMOVE_ITEM':
        return {
          ...state,
          items: state.items.filter(
            (item) => item.id !== action.payload
          ),
        };
  
      case 'INCREMENT':
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
  
      case 'DECREMENT':
        return {
          ...state,
          items: state.items
            .map((item) =>
              item.id === action.payload
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0),
        };
  
      case 'UPDATE_NOTE':
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, note: action.payload.note }
              : item
          ),
        };
  
      case 'CLEAR_CART':
        return {
          ...initialState,
        };
  
      case 'APPLY_PROMO': {
        const promos = {
          WELCOME10: 10,
          FEAST20: 20,
        };
  
        const code = action.payload.trim().toUpperCase();
  
        if (!promos[code]) {
          return {
            ...state,
            promoError: 'Invalid promo code.',
          };
        }
  
        return {
          ...state,
          promoCode: code,
          discountPercent: promos[code],
          promoError: '',
        };
      }
  
      case 'REMOVE_PROMO':
        return {
          ...state,
          promoCode: '',
          discountPercent: 0,
          promoError: '',
        };
  
      default:
        return state;
    }
  }
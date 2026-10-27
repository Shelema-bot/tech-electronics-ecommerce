import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback
} from "react";


const CartContext = createContext();



export function CartProvider({children}){


const [cartItems,setCartItems]=useState(()=>{

    const savedCart = localStorage.getItem("cartItems");

    return savedCart ? JSON.parse(savedCart) : [];

});





useEffect(()=>{

    localStorage.setItem(
        "cartItems",
        JSON.stringify(cartItems)
    );

},[cartItems]);






const addToCart = useCallback((product)=>{


setCartItems(currentCart=>{


const exist = currentCart.find(

item => item._id === product._id

);



if(exist){


if(product.stock && exist.quantity >= product.stock){
    return currentCart;
}



return currentCart.map(item=>

item._id === product._id

?

{

...item,

quantity:item.quantity + 1

}

:

item

);


}





return [

...currentCart,

{

...product,

quantity:1

}

];



});


},[]);








const removeFromCart = useCallback((id)=>{


setCartItems(currentCart=>

currentCart.filter(

item=>item._id !== id

)

);


},[]);








const increaseQuantity = useCallback((id)=>{


setCartItems(currentCart=>


currentCart.map(item=>{


if(item._id===id){


if(item.stock && item.quantity >= item.stock){
return item;
}



return {

...item,

quantity:item.quantity + 1

};


}



return item;


})


);



},[]);








const decreaseQuantity = useCallback((id)=>{


setCartItems(currentCart=>


currentCart.map(item=>


item._id===id && item.quantity>1


?

{

...item,

quantity:item.quantity-1

}


:

item


)


);



},[]);








const clearCart = useCallback(()=>{


setCartItems([]);


},[]);








const cartTotal = cartItems.reduce(

(total,item)=>

total + Number(item.price) * item.quantity,

0

);








const cartCount = cartItems.reduce(

(total,item)=>

total + item.quantity,

0

);









return(


<CartContext.Provider

value={{

cartItems,

addToCart,

removeFromCart,

increaseQuantity,

decreaseQuantity,

clearCart,

cartTotal,

cartCount

}}

>


{children}


</CartContext.Provider>


);


}







export function useCart(){

return useContext(CartContext);

}
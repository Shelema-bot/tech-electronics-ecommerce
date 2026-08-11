import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";


// Create Wishlist Context
const WishlistContext = createContext();


// Wishlist Provider
export const WishlistProvider = ({ children }) => {

    // Load wishlist from localStorage
    const [wishlist, setWishlist] = useState(() => {

        const savedWishlist =
            localStorage.getItem("wishlist");

        return savedWishlist
            ? JSON.parse(savedWishlist)
            : [];

    });


    // Save wishlist whenever it changes
    useEffect(() => {

        localStorage.setItem(
            "wishlist",
            JSON.stringify(wishlist)
        );

    }, [wishlist]);


    // Add product to wishlist
    const addToWishlist = (product) => {

        setWishlist((prevWishlist) => {

            const alreadyExists =
                prevWishlist.some(
                    (item) =>
                        item._id === product._id
                );

            // Do not add duplicate product
            if (alreadyExists) {

                return prevWishlist;

            }

            return [
                ...prevWishlist,
                product
            ];

        });

    };


    // Remove product from wishlist
    const removeFromWishlist = (productId) => {

        setWishlist((prevWishlist) =>
            prevWishlist.filter(
                (item) =>
                    item._id !== productId
            )
        );

    };


    // Check whether product is in wishlist
    const isInWishlist = (productId) => {

        return wishlist.some(
            (item) =>
                item._id === productId
        );

    };


    // Toggle wishlist
    const toggleWishlist = (product) => {

        if (isInWishlist(product._id)) {

            removeFromWishlist(product._id);

        } else {

            addToWishlist(product);

        }

    };


    // Remove all wishlist items
    const clearWishlist = () => {

        setWishlist([]);

    };


    return (

        <WishlistContext.Provider
            value={{
                wishlist,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                toggleWishlist,
                clearWishlist
            }}
        >

            {children}

        </WishlistContext.Provider>

    );

};


// Custom hook for accessing WishlistContext
export const useWishlist = () => {

    return useContext(WishlistContext);

};
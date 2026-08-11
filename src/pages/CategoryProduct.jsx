import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";


function CategoryProducts(){

    const { category } = useParams();

    const [products,setProducts] = useState([]);


    useEffect(()=>{

        axios
        .get(`http://localhost:5000/api/products/category/${category}`)
        .then(res=>{
            setProducts(res.data);
        })
        .catch(err=>{
            console.log(err);
        });


    },[category]);



    return(

        <div>

            <h1>
                {category} Products
            </h1>


            <div className="product-container">

                {
                    products.map(product=>(

                        <div className="product-card" key={product._id}>

                            <h3>
                                {product.name}
                            </h3>

                            <p>
                                {product.category}
                            </p>

                            <p>
                                {product.price} ETB
                            </p>

                        </div>

                    ))
                }


            </div>

        </div>

    );

}


export default CategoryProducts;
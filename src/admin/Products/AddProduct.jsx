import { useEffect, useState } from "react";
import API from "../../api/axios";
import "./AddProduct.css";


function AddProduct(){

    const [image,setImage] = useState(null);

    const [categories,setCategories] = useState([]);


    const [product,setProduct] = useState({

        name:"",
        category:"",
        brand:"",
        description:"",
        price:"",
        stock:""

    });



    // Get categories from database
    useEffect(()=>{

        const getCategories = async()=>{

            try{

                const res = await API.get("/categories");

                setCategories(res.data);

            }
            catch(error){

                console.log(error);

            }

        };


        getCategories();


    },[]);




    const handleChange=(e)=>{

        setProduct({

            ...product,

            [e.target.name]: e.target.value

        });

    };



    const handleImage=(e)=>{

        setImage(e.target.files[0]);

    };




    const submitProduct=async(e)=>{

        e.preventDefault();


        try{


            const formData = new FormData();


            formData.append("name", product.name);

            formData.append("category", product.category);

            formData.append("brand", product.brand);

            formData.append("description", product.description);

            formData.append("price", product.price);

            formData.append("stock", product.stock);



            if(image){

                formData.append(
                    "images",
                    image
                );

            }



            await API.post(

                "/products",

                formData,

                {

                    headers:{

                        "Content-Type":"multipart/form-data"

                    }

                }

            );



            alert("Product Added Successfully");



            setProduct({

                name:"",
                category:"",
                brand:"",
                description:"",
                price:"",
                stock:""

            });


            setImage(null);


        }
        catch(error){

            console.log(error);

            alert("Product creation failed");

        }


    };




    return(

        <div className="add-product">


            <h1>
                Add New Product
            </h1>



            <form onSubmit={submitProduct}>


                <input

                name="name"

                placeholder="Product Name"

                value={product.name}

                onChange={handleChange}

                />




                <select

                name="category"

                value={product.category}

                onChange={handleChange}

                >


                <option value="">
                    Select Category
                </option>



                {
                    categories.map(category=>(

                        <option

                        key={category._id}

                        value={category.name}

                        >

                            {category.name}

                        </option>

                    ))
                }


                </select>





                <input

                name="brand"

                placeholder="Brand"

                value={product.brand}

                onChange={handleChange}

                />




                <textarea

                name="description"

                placeholder="Description"

                value={product.description}

                onChange={handleChange}

                />




                <input

                type="number"

                name="price"

                placeholder="Price"

                value={product.price}

                onChange={handleChange}

                />




                <input

                type="number"

                name="stock"

                placeholder="Stock"

                value={product.stock}

                onChange={handleChange}

                />




                <input

                type="file"

                onChange={handleImage}

                />




                <button>

                    Add Product

                </button>



            </form>


        </div>

    );

}


export default AddProduct;
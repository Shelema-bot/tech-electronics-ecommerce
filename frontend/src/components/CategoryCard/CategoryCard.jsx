import "./CategoryCard.css";
import { useNavigate } from "react-router-dom";

import laptopImg from "../../assets/category/laptops.png";
import accessoryImg from "../../assets/category/smart-accessor.jpg";
import watchImg from "../../assets/category/smart-watch.jpg";
import smartphoneImg from "../../assets/category/smart-phone.jpg";
import gamingImg from "../../assets/category/gaming.jpg";
import networkImg from "../../assets/category/network.jpg";


const categories = [

    {
        name: "Laptops",
        image: laptopImg,
        category: "Laptops"
    },

    {
        name: "Smartphones",
        image: smartphoneImg,
        category: "Smartphones"
    },

    {
        name: "Gaming",
        image: gamingImg,
        category: "Gaming"
    },

    {
        name: "Network",
        image: networkImg,
        category: "Network"
    },

    {
        name: "Smart Accessories",
        image: accessoryImg,
        category: "Smart Accessories"
    },

    {
        name: "Smart Watch",
        image: watchImg,
        category: "Smart Watch"
    }

];


function CategoryCard() {

    const navigate = useNavigate();


    return (

        <section className="category-section">


            <h2 className="category-title">
                Shop By Category
            </h2>


            <div className="category-container">


                {
                    categories.map((category, index) => (

                        <div

                            className="category-card"

                            key={index}

                            onClick={() =>
                                navigate(
                                    `/products?category=${category.category}`
                                )
                            }

                        >


                            <div className="category-image">


                                <img

                                    src={category.image}

                                    alt={category.name}

                                />


                            </div>


                            <h3>

                                {category.name}

                            </h3>


                        </div>

                    ))
                }


            </div>


        </section>

    );

}


export default CategoryCard;
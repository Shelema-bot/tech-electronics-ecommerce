// Category.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../../api/axios";

import "./Category.css";

// Category Images
import laptopImg from "../../assets/category/laptops.png";
import accessoryImg from "../../assets/category/smart-accessor.jpg";
import watchImg from "../../assets/category/smart-watch.jpg";
import smartphoneImg from "../../assets/category/smart-phone.jpg";
import gamingImg from "../../assets/category/gaming.jpg";
import networkImg from "../../assets/category/network.jpg";


// ==========================================
// CATEGORY IMAGES
// ==========================================

const categoryImages = {
    Laptops: laptopImg,
    Smartphones: smartphoneImg,
    Gaming: gamingImg,
    Network: networkImg,
    "Smart Accessories": accessoryImg,
    "Smart Watch": watchImg
};


// ==========================================
// CATEGORY COMPONENT
// ==========================================

function Category() {

    // --------------------------------------
    // State
    // --------------------------------------

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();


    // --------------------------------------
    // Authentication Configuration
    // --------------------------------------

    const authConfig = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    };


    // --------------------------------------
    // Get Categories
    // --------------------------------------

    const getCategories = async () => {

        try {

            setLoading(true);

            const response = await API.get(
                "/categories"
            );

            console.log(
                "ADMIN CATEGORIES:",
                response.data
            );

            const data = response.data;

            setCategories(
                Array.isArray(data)
                    ? data
                    : data.categories || []
            );

        } catch (error) {

            console.log(
                "CATEGORY ERROR:",
                error.response?.data ||
                error.message
            );

        } finally {

            setLoading(false);

        }

    };


    // --------------------------------------
    // Load Categories
    // --------------------------------------

    useEffect(() => {

        getCategories();

    }, []);


    // --------------------------------------
    // Delete Category
    // --------------------------------------

    const deleteCategory = async (id) => {

        const confirmDelete = window.confirm(
            "Delete this category?"
        );

        if (!confirmDelete) {
            return;
        }


        try {

            await API.delete(
                `/categories/${id}`,
                authConfig
            );

            alert(
                "Category deleted successfully"
            );

            getCategories();

        } catch (error) {

            console.log(
                "DELETE ERROR:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Delete failed"
            );

        }

    };


    // --------------------------------------
    // Edit Category
    // --------------------------------------

    const editCategory = (id) => {

        navigate(
            `/admin/edit-category/${id}`
        );

    };


    // --------------------------------------
    // Add Category
    // --------------------------------------

    const addCategory = () => {

        navigate(
            "/admin/add-category"
        );

    };


    // --------------------------------------
    // Loading
    // --------------------------------------

    if (loading) {

        return (

            <div className="loading-page">

                <h2>
                    Loading categories...
                </h2>

            </div>

        );

    }


    // --------------------------------------
    // Main UI
    // --------------------------------------

    return (

        <div className="admin-category">


            {/* =================================
                PAGE HEADER
            ================================= */}

            <div className="category-header">

                <div className="category-heading">

                    <h1>
                        Manage Categories
                    </h1>

                    <p>
                        Add, edit and delete categories
                    </p>

                </div>


                <button
                    type="button"
                    className="add-category-btn"
                    onClick={addCategory}
                >
                    + Add Category
                </button>

            </div>



            {/* =================================
                EMPTY STATE
            ================================= */}

            {categories.length === 0 ? (

                <div className="empty-category">

                    <h2>
                        No Categories Found
                    </h2>

                    <button
                        type="button"
                        className="add-category-btn"
                        onClick={addCategory}
                    >
                        + Add Category
                    </button>

                </div>

            ) : (


                /* =================================
                   CATEGORY GRID
                ================================= */

                <div className="category-list">

                    {categories.map((category) => {

                        const image =
                            categoryImages[
                                category.name
                            ];


                        return (

                            <div
                                className="category-card"
                                key={category._id}
                            >


                                {/* =========================
                                    CATEGORY IMAGE
                                ========================= */}

                                <div className="category-image-container">

                                    {image ? (

                                        <img
                                            src={image}
                                            alt={category.name}
                                            className="category-image"
                                        />

                                    ) : (

                                        <div className="no-image">
                                            No Image
                                        </div>

                                    )}

                                </div>



                                {/* =========================
                                    CATEGORY NAME
                                ========================= */}

                                <div className="category-content">

                                    <h3>
                                        {category.name}
                                    </h3>


                                    {/* =====================
                                        ACTIONS
                                    ===================== */}

                                    <div className="category-actions">

                                        <button
                                            type="button"
                                            className="edit-category"
                                            onClick={() =>
                                                editCategory(
                                                    category._id
                                                )
                                            }
                                        >
                                            Edit
                                        </button>


                                        <button
                                            type="button"
                                            className="delete-category"
                                            onClick={() =>
                                                deleteCategory(
                                                    category._id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );

}


export default Category;
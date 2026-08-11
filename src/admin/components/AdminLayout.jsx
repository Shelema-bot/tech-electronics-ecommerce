import { useState } from "react";

import Sidebar from "./Sidebar";

import "./AdminLayout.css";


function AdminLayout({children}){


    const [collapsed,setCollapsed]=useState(false);



    return(


        <div className="admin-layout">


            <Sidebar 
                collapsed={collapsed}
            />



            <div

            className={

                collapsed

                ?

                "admin-main collapsed"

                :

                "admin-main"

            }

            >



                <button

                className="menu-btn"

                onClick={()=>setCollapsed(!collapsed)}

                >

                    ☰

                </button>




                <div className="admin-body">

                    {children}

                </div>



            </div>



        </div>


    );


}


export default AdminLayout;
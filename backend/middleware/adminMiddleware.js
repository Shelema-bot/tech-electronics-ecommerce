const admin = (req, res, next) => {

  try {

    // Check if user exists
    if (!req.user) {

      return res.status(401).json({

        success: false,

        message: "Not authorized. User not found."

      });

    }


    // Check user role
    if (req.user.role !== "admin") {

      return res.status(403).json({

        success: false,

        message: "Access denied. Admin privileges required."

      });

    }


    // User is admin
    next();


  } catch (error) {

    console.log("Admin Middleware Error:", error.message);

    res.status(500).json({

      success: false,

      message: "Server error in admin authorization."

    });

  }

};


export default admin;
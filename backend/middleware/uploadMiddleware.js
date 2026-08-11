import multer from "multer";
import path from "path";

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }

});


const fileFilter = (req, file, cb) => {

    console.log("File Name:", file.originalname);
    console.log("MIME Type:", file.mimetype);

    cb(null, true);

};


const upload = multer({
    storage,
    fileFilter
});


export default upload;
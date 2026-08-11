import axios from "axios";


const CHAPA_URL = "https://api.chapa.co/v1";


// Initialize Chapa Payment
export const initializeChapaPayment = async ({
  amount,
  email,
  first_name,
  last_name,
  tx_ref,
}) => {

  try {

    const response = await axios.post(

      `${CHAPA_URL}/transaction/initialize`,

      {
        amount,
        currency: "ETB",

        email,
        first_name,
        last_name,

        tx_ref,

        callback_url:
"http://localhost:5000/api/payments/verify?tx_ref="+tx_ref,

        return_url:
"http://localhost:5173/payment-success?tx_ref="+tx_ref,
        customization: {
          title: "Tech Store",
          description:
            "Technology Electronic Commerce Platform",
        },
      },

      {
        headers: {

          Authorization:
            `Bearer ${process.env.CHAPA_SECRET_KEY}`,

          "Content-Type":
            "application/json",
        },
      }

    );


    return response.data;


  } catch (error) {


    console.log(
      "Chapa Initialize Error:",
      error.response?.data || error.message
    );


    throw error;

  }

};




// Verify Chapa Payment
export const verifyChapaPayment = async (tx_ref) => {

  try {


    const response = await axios.get(

      `${CHAPA_URL}/transaction/verify/${tx_ref}`,

      {
        headers: {

          Authorization:
            `Bearer ${process.env.CHAPA_SECRET_KEY}`,

        },
      }

    );


    return response.data;


  } catch(error) {


    console.log(
      "Chapa Verify Error:",
      error.response?.data || error.message
    );


    throw error;

  }

};
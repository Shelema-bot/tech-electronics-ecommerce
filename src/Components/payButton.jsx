import { initializePayment } from "../services/paymentService";


const PayButton = ({ orderId, amount }) => {

  const handlePayment = async () => {

    try {

      const token = localStorage.getItem("token");


      const data = await initializePayment(
        {
          orderId,
          amount,
        },
        token
      );


      if(data.success){

        window.location.href =
          data.checkout_url;

      }


    } catch(error){

      console.log(error);

      alert(
        "Payment initialization failed"
      );

    }

  };


  return (
    <button 
      onClick={handlePayment}
    >
      Pay Now
    </button>
  );
};


export default PayButton;
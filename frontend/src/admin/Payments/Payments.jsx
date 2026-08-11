import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import "./Payments.css";


function Payments() {

    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);


    const authConfig = {

        headers: {

            Authorization:
                `Bearer ${localStorage.getItem("token")}`

        }

    };


    // ===============================
    // GET PAYMENTS
    // ===============================

    useEffect(() => {

        getPayments();

    }, []);


    const getPayments = async () => {

        try {

            setLoading(true);


            const res = await API.get(
                "/admin/payments",
                authConfig
            );


            console.log(
                "PAYMENTS:",
                res.data
            );


            if (Array.isArray(res.data)) {

                setPayments(res.data);

            }

            else if (
                Array.isArray(res.data.payments)
            ) {

                setPayments(
                    res.data.payments
                );

            }

            else {

                setPayments([]);

            }


        } catch (error) {

            console.log(
                "PAYMENT ERROR:",
                error.response?.data ||
                error.message
            );


            setPayments([]);

        } finally {

            setLoading(false);

        }

    };


    // ===============================
    // UPDATE PAYMENT STATUS
    // ===============================

    const updateStatus = async (id, status) => {

        try {

            await API.put(

                `/admin/payments/${id}`,

                {
                    status
                },

                authConfig

            );


            alert(
                "Payment status updated"
            );


            getPayments();


        } catch (error) {

            console.log(
                "UPDATE PAYMENT ERROR:",
                error.response?.data ||
                error.message
            );

        }

    };


    // ===============================
    // DELETE PAYMENT
    // ===============================

    const deletePayment = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this payment?"
            );


        if (!confirmed) {

            return;

        }


        try {

            await API.delete(

                `/admin/payments/${id}`,

                authConfig

            );


            alert(
                "Payment deleted successfully"
            );


            getPayments();


        } catch (error) {

            console.log(
                "DELETE PAYMENT ERROR:",
                error.response?.data ||
                error.message
            );


            alert(
                error.response?.data?.message ||
                "Failed to delete payment"
            );

        }

    };


    // ===============================
    // PAGE
    // ===============================

    return (

        <AdminLayout>

            <div className="payments-page">


                {/* PAGE HEADER */}

                <div className="payments-page-header">

                    <div>

                        <h1>
                            Payments Management
                        </h1>

                        <p>
                            Manage customer payments
                            and transactions
                        </p>

                    </div>

                </div>


                {/* PAYMENTS TABLE */}

                <div className="payments-card">


                    <div className="payments-table">


                        {/* TABLE HEADER */}

                        <div className="payments-table-header">

                            <div>
                                Customer
                            </div>

                            <div>
                                Amount
                            </div>

                            <div>
                                Transaction
                            </div>

                            <div>
                                Status
                            </div>

                            <div>
                                Date
                            </div>

                            <div>
                                Action
                            </div>

                        </div>


                        {/* TABLE BODY */}

                        {

                        loading ? (

                            <div className="payments-empty">

                                Loading payments...

                            </div>

                        ) : payments.length === 0 ? (

                            <div className="payments-empty">

                                No Payments Found

                            </div>

                        ) : (

                            payments.map((payment) => (

                                <div
                                    className="payments-table-row"
                                    key={payment._id}
                                >


                                    {/* CUSTOMER */}

                                    <div className="payment-customer">

                                        <strong>

                                            {
                                                payment.user?.name ||
                                                "Unknown"
                                            }

                                        </strong>

                                        <small>

                                            {
                                                payment.user?.email ||
                                                "-"
                                            }

                                        </small>

                                    </div>


                                    {/* AMOUNT */}

                                    <div className="payment-amount">

                                        {
                                            payment.amount
                                        }

                                        {" "}ETB

                                    </div>


                                    {/* TRANSACTION */}

                                    <div className="payment-transaction">

                                        {
                                            payment.tx_ref ||
                                            "-"
                                        }

                                    </div>


                                    {/* STATUS */}

                                    <div>

                                        <span
                                            className={`payment-status ${
                                                payment.status?.toLowerCase() ||
                                                "pending"
                                            }`}
                                        >

                                            {
                                                payment.status ||
                                                "Pending"
                                            }

                                        </span>

                                    </div>


                                    {/* DATE */}

                                    <div className="payment-date">

                                        {
                                            payment.createdAt
                                                ? new Date(
                                                    payment.createdAt
                                                ).toLocaleDateString()
                                                : "-"
                                        }

                                    </div>


                                    {/* ACTION */}

                                    <div className="payment-actions">


                                        {

                                        payment.status !== "Paid" && (

                                            <button
                                                type="button"
                                                className="paid-btn"
                                                onClick={() =>
                                                    updateStatus(
                                                        payment._id,
                                                        "Paid"
                                                    )
                                                }
                                            >

                                                Mark Paid

                                            </button>

                                        )

                                        }


                                        <button
                                            type="button"
                                            className="delete-payment-btn"
                                            onClick={() =>
                                                deletePayment(
                                                    payment._id
                                                )
                                            }
                                        >

                                            Delete

                                        </button>


                                    </div>


                                </div>

                            ))

                        )}

                    </div>

                </div>

            </div>

        </AdminLayout>

    );

}


export default Payments;
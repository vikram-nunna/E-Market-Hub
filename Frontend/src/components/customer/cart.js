import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Alert, Box, Button, ButtonGroup, IconButton, LinearProgress, Snackbar, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate } from "react-router-dom";

export default function Cart() {
    const [cart, setCart] = React.useState({});
    const TAX_RATE = 0.07;
    const [subTotal, setSubTotal] = React.useState(0);
    const [tax, setTax] = React.useState(0);
    const [total, setTotal] = React.useState(0);
    const API_URL = "https://zesty-salamander-86d073.netlify.app";
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [progressMessage, setProgressMessage] = useState("Getting cart details");
    const navigate = useNavigate();

    const openAlert = (status, message) => {
        setStatus(status);
        setStatusMessage(message);
        setIsAlertOpen(true);
    };

    const closeAlert = () => {
        setIsAlertOpen(false);
    };

    useEffect(() => {
        let id = Cookies.get("id");
        axios
            .get("https://zesty-salamander-86d073.netlify.app" + "/cart/" + id)
            .then((res) => {
                let data = res.data.data;
                if (data != null) {
                    setIsLoading(false);
                    data.products.forEach((item) => {
                        item.total = item.quantity * item.product.price;
                    });
                    console.log(res);
                    let t = subtotal(data.products);
                    const invoiceSubtotal = t;
                    data.subtotal = invoiceSubtotal;
                    setSubTotal(invoiceSubtotal);
                    const invoiceTaxes = TAX_RATE * invoiceSubtotal;
                    data.taxes = invoiceTaxes;
                    setTax(invoiceTaxes);
                    const invoiceTotal = invoiceTaxes + invoiceSubtotal;
                    data.total = invoiceTotal;
                    setTotal(invoiceTotal);
                    console.log(data);
                    setCart(data);
                } else {
                    setIsLoading(false);
                    setCart(null);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    function ccyFormat(num) {
        return `${num.toFixed(2)}`;
    }

    function subtotal(items) {
        return items.map(({ total }) => total).reduce((sum, i) => sum + i, 0);
    }

    const createOrder = async (data) => {
        // Order is created on the server and the order id is returned
        let scart = {
            description: "sample product",
            cost: total,
        };
        return fetch(`${API_URL}/paypal/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // use the "body" param to optionally pass additional order information
            // like product skus and quantities
            body: JSON.stringify({ scart }),
        })
            .then((response) => {
                console.log("response: ", response);
                return response.json();
            })
            .then((order) => {
                let edata = cart;
                edata.orderId = order.id;
                setCart(edata);
                console.log("order: ", edata);
                return order.id;
            });
    };
    const onApprove = async (data) => {
        console.log("apprive data: ", data);
        // Order is captured on the server and the response is returned to the browser
        return fetch(`${API_URL}/paypal/api/orders/${data.orderID}/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            console.log("final cart: ", cart);
            console.log("payment successful", response);
            openAlert("success", "Payment successful");
            axios
                .post("https://zesty-salamander-86d073.netlify.app" + "/order", { cart })
                .then((res) => {
                    console.log(res);
                    openAlert("success", "Order placed");
                    setTimeout(() => {
                        navigate("/home/orders");
                    }, 1500);
                })
                .catch((err) => {
                    console.log(err);
                });
            return response.json();
        });
    };

    const onError = async (err) => {
        // Handle errors during the payment process
        console.log(err);
        console.log("An error occurred during the payment. Please try again.");
        openAlert("error", "An error occurred during the payment. Please try again.");
    };
    const onCancel = async (err) => {
        // Handle cancellation of the payment
        console.log(err);
        console.log("Payment canceled by user.");
        openAlert("error", "Payment canceled by user.");
    };

    const handleDeleteProduct = (id) => {
        setIsLoading(true);
        setProgressMessage("Updating cart");
        const userId = Cookies.get("id");
        console.log(id);
        axios
            .delete(`${API_URL}/cart/${userId}/${id}`)
            .then((res) => {
                console.log(res);
                openAlert("success", "Item removed from cart");
                setTimeout(() => {
                    setIsLoading(false);
                    window.location.reload();
                }, 1500);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleDecrease = (id, quantity) => {
        setIsLoading(true);
        setProgressMessage("Updating cart");
        if (quantity == 1) {
            handleDeleteProduct(id);
        } else {
            const userId = Cookies.get("id");
            axios
                .put(`${API_URL}/cart/${userId}/${id}`, { quantity: quantity - 1 })
                .then((res) => {
                    console.log(res);
                    openAlert("success", "Cart updated");
                    setTimeout(() => {
                        setIsLoading(false);
                        window.location.reload();
                    }, 1500);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    const handleIncrease = (id, quantity) => {
        setIsLoading(true);
        setProgressMessage("Updating cart");
        const userId = Cookies.get("id");
        axios
            .put(`${API_URL}/cart/${userId}/${id}`, { quantity: quantity + 1 })
            .then((res) => {
                console.log(res);
                openAlert("success", "Cart updated");
                setTimeout(() => {
                    setIsLoading(false);
                    window.location.reload();
                }, 500);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <div>
            <Snackbar
                open={isAlertOpen}
                autoHideDuration={2000}
                onClose={closeAlert}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert variant='filled' severity={status} onClose={closeAlert}>
                    {statusMessage}
                </Alert>
            </Snackbar>
            <Paper elevation={5}>
                {isLoading && (
                    <Box
                        p={3}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Box sx={{ width: "100%" }}>
                            <LinearProgress />
                        </Box>
                        {progressMessage}... please wait!
                    </Box>
                )}
                {!isLoading && (
                    <Box p={3} className='orders-page full'>
                        {(cart == null || (cart.products && cart.products.length == 0)) && <Typography variant='h5'>No items in the cart</Typography>}
                        {cart != null && cart.products && cart.products.length > 0 && (
                            <Box className='cart-table'>
                                <Typography variant='h5'>Cart details</Typography>
                                <br />
                                <TableContainer component={Paper}>
                                    <Table aria-label='spanning table'>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align='right'></TableCell>
                                                <TableCell>Product</TableCell>
                                                <TableCell align='center'>Quantity</TableCell>
                                                <TableCell sx={{ minWidth: 90 }} align='right'>
                                                    Price
                                                </TableCell>
                                                <TableCell sx={{ minWidth: 90 }} align='right'>
                                                    Total
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {cart.products.map((row, key) => (
                                                <TableRow key={key}>
                                                    <TableCell align='right'>
                                                        <IconButton color='error' onClick={() => handleDeleteProduct(row._id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.product.name} {row.product.category}
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        <ButtonGroup>
                                                            <Button onClick={() => handleDecrease(row._id, row.quantity)}>
                                                                <RemoveIcon />
                                                            </Button>
                                                            <Button>{row.quantity}</Button>
                                                            <Button onClick={() => handleIncrease(row._id, row.quantity)}>
                                                                <AddIcon />
                                                            </Button>
                                                        </ButtonGroup>
                                                    </TableCell>
                                                    <TableCell align='right'>$ {row.product.price}</TableCell>
                                                    <TableCell align='right'>$ {ccyFormat(row.total)}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell rowSpan={3} colSpan={2} />
                                                <TableCell align='right'>Subtotal</TableCell>
                                                <TableCell align='right'></TableCell>
                                                <TableCell align='right'>$ {ccyFormat(subTotal)}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align='right'>Tax</TableCell>
                                                <TableCell align='right'>{`${(TAX_RATE * 100).toFixed(0)} %`}</TableCell>
                                                <TableCell align='right'>$ {ccyFormat(tax)}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align='right'>
                                                    <Typography variant='h6'>Total</Typography>
                                                </TableCell>
                                                <TableCell align='right'></TableCell>
                                                <TableCell align='right'>
                                                    <Typography variant="h6">$ {ccyFormat(total)}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <PayPalButtons
                                    className='pp-btn'
                                    createOrder={(data, actions) => createOrder(data, actions)}
                                    onApprove={(data, actions) => onApprove(data, actions)}
                                    onError={(err) => onError(err)}
                                    onCancel={(err) => onCancel(err)}
                                    style={{ shape: "rect", label: "pay", tagline: false }}
                                />
                            </Box>
                        )}
                    </Box>
                )}
            </Paper>
        </div>
    );
}

import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Divider from "@mui/material/Divider";

import Snackbar from "@mui/material/Snackbar";

import {
    FormControl,
    InputLabel,
    Button,
    Select,
    MenuItem,
    Typography,
    Paper,
    Box,
    TextField,
    FormHelperText,
    IconButton,
    InputAdornment,
    LinearProgress,
} from "@mui/material";
import Cookies from "js-cookie";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { resetSchema } from "../dealer/registration/dealerSignupSchema";

const ResetPassword = () => {
    const [otp, setOtp] = useState("");

    const [cpassword, setCpassword] = useState("");

    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("");
    const [password, setPassword] = useState("");
    const [showOtp, setShowOtp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [progressMessage, setProgressMessage] = useState("");

    const navigate = useNavigate();

    const handleOtpChange = (event) => {
        setOtp(event.target.value);
    };

    const openAlert = (status, message) => {
        setStatus(status);
        setErrorMessage(message);
        setIsAlertOpen(true);
    };

    const closeAlert = () => {
        setIsAlertOpen(false);
    };
    const validatePassword = (newPassword) => {
        // Regular expressions for password criteria
        const lengthRegex = /^.{8,20}$/;
        const numberRegex = /\d/;
        const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        const consecutiveNumbersRegex = /\d{5}/;
        const hasCapitalLetter = /[A-Z]/.test(newPassword);
    
        // Check if password meets all criteria
        return (
            lengthRegex.test(newPassword) &&
            numberRegex.test(newPassword) &&
            specialCharRegex.test(newPassword) &&
            !consecutiveNumbersRegex.test(newPassword) &&
            hasCapitalLetter
        );
    };
    
    const handlePasswordChange = (event) => {
        const newPassword = event.target.value;
        setPassword(newPassword);
    
        // Validate password
        const isValidPassword = validatePassword(newPassword);
    
        // Update errors state based on validation result
        setErrors((prevErrors) => ({
            ...prevErrors,
            password: isValidPassword ? '' : 'Password must be between 8 and 20 characters, contain at least one number, one special character, and one capital letter, and not have more than 4  numbers.'
        }));
    };
    const passwordMeetsCriteria = () => {
        // Regular expressions for each criterion
        const lengthRegex = /^.{8,20}$/;
        const numberRegex = /\d/;
        const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        const consecutiveNumbersRegex = /\d{5}/;
        const capitalLetterRegex = /[A-Z]/;
        // Check if all criteria are met
       
        return (
            password.length>=8 &&password.length<=20 &&
            numberRegex.test(password) &&
            specialCharRegex.test(password) &&
            !consecutiveNumbersRegex.test(password)&&
            capitalLetterRegex.test(password)
        );
    };
    // const handlePasswordChange = (event) => {
    //     setPassword(event.target.value);
    // };

    const handleCpasswordChange = (event) => {
        setCpassword(event.target.value);
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleSave = () => {
        let role = new URLSearchParams(window.location.search).get("role");
        let email = new URLSearchParams(window.location.search).get("email");

        resetSchema
            .validate({ password, cpassword }, { abortEarly: false })
            .then(() => {
                setIsLoading(true);
                setProgressMessage("Updating password");
                axios
                    .post("https://zesty-salamander-86d073.netlify.app" + "/auth/reset-password", {
                        email,
                        role,
                        password,
                    })
                    .then((response) => {
                        openAlert("success", response.data.message);
                        setProgressMessage("Redirecting to login page");
                        setTimeout(() => {
                            setIsLoading(false);
                            navigate("/");
                        }, 2000);
                    })
                    .catch((error) => {
                        setIsLoading(false);
                        openAlert("error", error.response.data.message);
                    });
            })
            .catch((validationErrors) => {
                const validationErrorMap = {};
                validationErrors.inner.forEach((error) => {
                    validationErrorMap[error.path] = error.message;
                });
                setErrors(validationErrorMap);
            });
    };

    const handleVerifyLogin = () => {
        setIsLoading(true);
        setProgressMessage("Verifying OTP");
        axios
            .post("https://zesty-salamander-86d073.netlify.app" + "/auth/verify-login", {
                role: "customer",
                otp,
            })
            .then((response) => {
                openAlert("success", response.data.message);
                Cookies.set("token", response.data.data.token);
                Cookies.set("role", response.data.data.role);

                setTimeout(() => {
                    setIsLoading(false);
                    navigate("/");
                }, 2000);
            })
            .catch((err) => {
                console.log(err);
                setIsLoading(false);
                openAlert("error", err.response.data.message);
                // console.log(err);
            });
    };

    return (
        <div className='box'>
            <Snackbar
                open={isAlertOpen}
                autoHideDuration={2000}
                onClose={closeAlert}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert variant='filled' severity={status} onClose={closeAlert}>
                    {errorMessage}
                </Alert>
            </Snackbar>
            <Paper className='loginBox' elevation={5}>
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
                    <>
                        <div id='reset'>
                            <Box p={3}>
                                <Typography variant='h5'>Reset password</Typography> <br />
                                <TextField
                                    required
                                    fullWidth
                                    value={password}
                                    id='outlined-password'
                                    placeholder='Enter password'
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    onChange={handlePasswordChange}
                                    type={showPassword ? "text" : "password"}
                                />
                                <br />
                                <br />
                                <TextField
                                    required
                                    fullWidth
                                    value={cpassword}
                                    id='outlined-cpassword'
                                    placeholder='Confirm password'
                                    error={!!errors.cpassword}
                                    helperText={errors.cpassword}
                                    onChange={handleCpasswordChange}
                                    type={showPassword ? "text" : "password"}
                                    InputProps={{
                                        endAdornment: (
                                            <>
                                                <InputAdornment position='end'>
                                                    <IconButton
                                                        aria-label='toggle password visibility'
                                                        onClick={handleClickShowPassword}
                                                        onMouseDown={handleMouseDownPassword}
                                                        edge='end'
                                                    >
                                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            </>
                                        ),
                                    }}
                                />
                                <br />
                                <br />
                                <Button disabled={!passwordMeetsCriteria()} fullWidth sx={{ backgroundColor: "#f7ca00", color: "black" }} variant='outlined' onClick={handleSave}>
                                    reset password
                                </Button>
                            </Box>
                        </div>
                    </>
                )}
            </Paper>
        </div>
    );
};

export default ResetPassword;

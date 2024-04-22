import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import dealerSignupSchema, { emailSchema } from "./dealerSignupSchema";
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
    Grid,
} from "@mui/material";
import Cookies from "js-cookie";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function DealerSignup() {
    const [email, setEmail] = useState("");
    const [owner, setOwner] = useState("");
    const [merchandise, setMerchandise] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [address, setAddress] = useState("");
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [progressMessage, setProgressMessage] = useState("");

    const navigate = useNavigate();

    const openAlert = (status, message) => {
        setStatus(status);
        setErrorMessage(message);
        setIsAlertOpen(true);
    };

    const closeAlert = () => {
        setIsAlertOpen(false);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };
    const handleOwnerChange = (event) => {
        setOwner(event.target.value);
    };
    const handleMerchandiseChange = (event) => {
        setMerchandise(event.target.value);
    };
    // const handlePasswordChange = (event) => {
    //     setPassword(event.target.value);
    // };
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
    
    const handleMobileChange = (event) => {
        setMobile(event.target.value);
    };
    const handleAddressChange = (event) => {
        setAddress(event.target.value);
    };

    const handleOtpChange = (event) => {
        setOtp(event.target.value);
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleSubmit = () => {
        setProgressMessage("Submitting request");
        setIsLoading(true);
        dealerSignupSchema
            .validate({ email, owner, merchandise, password, mobile, address }, { abortEarly: false })
            .then(() => {
                axios
                    .post("https://zesty-salamander-86d073.netlify.app" + "/auth/submit-dealer-request", { email, owner, merchandise, password, mobile, address })
                    .then((res) => {
                        console.log(res);
                        openAlert("success", res.data.message);
                        setTimeout(() => {
                            setIsLoading(false);
                            navigate("/dealer-signin");
                        }, 2000);
                    })
                    .catch((err) => {
                        setIsLoading(false);
                        openAlert("error", err.response.data.message);
                        console.log(err);
                    });
            })
            .catch((validationErrors) => {
                const validationErrorMap = {};
                validationErrors.inner.forEach((error) => {
                    validationErrorMap[error.path] = error.message;
                });
                setErrors(validationErrorMap);
                setIsLoading(false);
            });
    };

    const handleVerifyOtp = () => {
        setProgressMessage("Verifying OTP");
        setIsLoading(true);
        axios
            .post("https://zesty-salamander-86d073.netlify.app" + "/auth/verify-dealer-otp", { email, otp })
            .then((res) => {
                console.log(res);
                setIsLoading(false);
                setShowOtp(false);
                setOtpVerified(true);
                openAlert("success", res.data.message);
                // navigate("/dealer/dashboard");
            })
            .catch((err) => {
                console.log(err);
                setIsLoading(false);
                openAlert("error", err.response.data.message);
                // console.log(err);
            });
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
    const handleRequestOtp = () => {
        setOtp("");
        emailSchema
            .validate({ email }, { abortEarly: false })
            .then(() => {
                setProgressMessage("Sending OTP to email");
                setIsLoading(true);
                axios
                    .post("https://zesty-salamander-86d073.netlify.app" + "/auth/request-otp", { email, role: "dealer" })
                    .then((res) => {
                        setIsLoading(false);
                        openAlert("success", res.data.message);
                        setShowOtp(true);
                        // setOtp(res.data.data.otp);
                        // console.log(res.data.data);
                    })
                    .catch((err) => {
                        setIsLoading(false);
                        openAlert("error", err.response.data.message);
                        // console.log(err);
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

    return (
        <div className="dealer-login-box">
            <h2 style={{display:"flex",justifyContent:"center"}}>E Market Hub</h2>
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
                        <Box p={3}>
                            {!showOtp && !otpVerified && (
                                <div id='create'>
                                    <Typography variant='h5'>Let us create your free Business account</Typography> <br />
                                    <TextField
                                        required
                                        fullWidth
                                        type='email'
                                        // label='Email'
                                        value={email}
                                        id='outlined-email'
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        onChange={handleEmailChange}
                                        placeholder='Enter email address'
                                    />
                                    <br /> <br />
                                    <Typography variant='body2'>To verify your email, we will send you a text message with a temporary code.</Typography>
                                    <br />
                                    <Button fullWidth color='primary' variant='contained' onClick={handleRequestOtp}>
                                        Get started
                                    </Button>
                                    <br />
                                </div>
                            )}
                            {showOtp && (
                                <div id='verify'>
                                    <Typography variant='h5'>Verify OTP</Typography> <br />
                                    <TextField
                                        required
                                        fullWidth
                                        type='number'
                                        label='One Time Password'
                                        value={otp}
                                        id='outlined-otp'
                                        error={!!errors.otp}
                                        helperText={errors.otp}
                                        onChange={handleOtpChange}
                                        placeholder='6 digit OTP'
                                    />
                                    <br />
                                    <br />
                                    <Button disabled={!otp} fullWidth color='primary' variant='contained' onClick={handleVerifyOtp}>
                                        Verify OTP
                                    </Button>
                                </div>
                            )}
                            <br />
                            {otpVerified && (
                                <>
                                    <Typography variant='h5'>Let us know about your details</Typography> <br />
                                    <TextField
                                        required
                                        fullWidth
                                        type='text'
                                        value={owner}
                                        id='outlined-owner'
                                        error={!!errors.owner}
                                        helperText={errors.owner}
                                        onChange={handleOwnerChange}
                                        placeholder='Owner name'
                                    />
                                    <br /> <br />
                                    <TextField
                                        required
                                        fullWidth
                                        type='text'
                                        value={merchandise}
                                        id='outlined-merchandise'
                                        error={!!errors.merchandise}
                                        helperText={errors.merchandise}
                                        onChange={handleMerchandiseChange}
                                        placeholder='Merchandise name'
                                    />
                                    <br /> <br />
                                    <TextField
                                        required
                                        fullWidth
                                        type='text'
                                        value={mobile}
                                        id='outlined-mobile'
                                        error={!!errors.mobile}
                                        helperText={errors.mobile}
                                        onChange={handleMobileChange}
                                        placeholder='Mobile number'
                                    />
                                    <br /> <br />
                                    <TextField
                                        required
                                        fullWidth
                                        value={password}
                                        id='outlined-password'
                                        placeholder='At least 8 characters'
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        onChange={handlePasswordChange}
                                        type={showPassword ? "text" : "password"}
                                        InputProps={{
                                            endAdornment: (
                                                <>
                                                    <InputAdornment position='end'>
                                                        <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge='end'>
                                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                </>
                                            ),
                                        }}
                                    />
                                    <br /> <br />
                                    <TextField
                                        required
                                        fullWidth
                                        type='text'
                                        value={address}
                                        id='outlined-address'
                                        error={!!errors.address}
                                        helperText={errors.address}
                                        onChange={handleAddressChange}
                                        placeholder='Address'
                                    />
                                    <br /> <br />
                                    <Button fullWidth color='primary' variant='contained' onClick={handleSubmit}
                                    disabled={!passwordMeetsCriteria()}
                                    >
                                        Submit request
                                    </Button>
                                </>
                            )}
                            {!(showOtp || otpVerified) && (
                                <>
                                    <Typography variant='body2'>
                                        <br />
                                        Already a business customer?{" "}
                                        <Link style={{ textDecoration: "none" }} to='/dealer-signin' underline='none'>
                                            Sign in
                                        </Link>
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </>
                )}
            </Paper>
        </div>
    );
}

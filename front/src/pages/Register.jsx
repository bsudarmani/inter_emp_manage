
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { apiRequest } from "../services/api";

// function Register() {
//     const navigate=useNavigate();
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         contact: "",
//         password: "",
//         confirmPassword: ""
//     });

//     const [success, setSuccess] = useState("");
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);

//     // Handle input changes
//     const handleChange = (e) => {

//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });

//     };

//     // Handle Registration

// const handleSubmit = async (e) => {

//     e.preventDefault();
//     setError("");

//     if (formData.password !== formData.confirmPassword) {
//         setError("Password and Confirm Password do not match!");
//         return;
//     }

//     if (formData.contact.length !== 10) {
//         setError("Enter a valid 10-digit contact number");
//         return;
//     }

//     try {

//         setLoading(true);

//         const res = await apiRequest("/api/users/register",
//             {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({
//                     name: formData.name,
//                     email: formData.email,
//                     contact: formData.contact,
//                     password: formData.password
//                 })
//             }
//         );

//         // Read response safely
//         const data = await res.json();

//         console.log("Status Code:", res.status);
//         console.log("Backend Response:", data);

//         if (!res.ok) {
//             throw new Error(data.message);
//             // setError(
//             //     data.message || data.error || `HTTP Error: ${res.status}`
//             // );

//             // return;
//         }
//          setSuccess(data.message);
//          setError("")
//         alert(data.message || "Registration successful!");
//         // Navigate("/login");
//         // setFormData({
//         //     name: "",
//         //     email: "",
//         //     contact: "",
//         //     password: "",
//         //     confirmPassword: ""
//         // });
//         setTimeout(() => {
//     navigate("/login");
// }, 1500);
//     }
//     catch (error) {
//         console.error("Fetch Error:", error);
//         setError("Unable to connect to backend server!");
//     }
//     finally {
//         setLoading(false);
//     }

// };


//     return (

//         <>

//             <div className="container mt-5">
//             <div className="row justify-content-center">
//                 <div className="col-md-5">

//                     <div className="card shadow">
//                         <div className="card-body p-4">

//                             <h2 className="text-center mb-4">
//                                 Register
//                             </h2>

//                             {error && (
//                                 <div className="alert alert-danger">
//                                     {error}
//                                 </div>
//                             )}
//                             {success && (
//     <div className="alert alert-success">
//         {success}
//     </div>
// )}

//                             <form onSubmit={handleSubmit}>

//                                 <input
//                                     type="text"
//                                     name="name"
//                                     className="form-control mb-3"
//                                     placeholder="Enter Name"
//                                     value={formData.name}
//                                     onChange={handleChange}
//                                     required
//                                 />

//                                 <input
//                                     type="email"
//                                     name="email"
//                                     className="form-control mb-3"
//                                     placeholder="Enter Email"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     required
//                                 />

//                                 <input
//                                     type="tel"
//                                     name="contact"
//                                     className="form-control mb-3"
//                                     placeholder="Enter Contact"
//                                     value={formData.contact}
//                                     onChange={(e) => {
//                                         setFormData({
//                                             ...formData,
//                                             contact: e.target.value
//                                                 .replace(/\D/g, "")
//                                                 .slice(0, 10)
//                                         });
//                                     }}
//                                     required
//                                 />

//                                 <input
//                                     type="password"
//                                     name="password"
//                                     className="form-control mb-3"
//                                     placeholder="Enter Password"
//                                     value={formData.password}
//                                     onChange={handleChange}
//                                     required
//                                 />

//                                 <input
//                                     type="password"
//                                     name="confirmPassword"
//                                     className="form-control mb-3"
//                                     placeholder="Confirm Password"
//                                     value={formData.confirmPassword}
//                                     onChange={handleChange}
//                                     required
//                                 />

//                                 <button
//                                     type="submit"
//                                     className="btn btn-primary w-100"
//                                     disabled={loading}
//                                 >
//                                     {loading ? "Registering..." : "Register"}
//                                 </button>

//                             </form>

//                             <p className="text-center mt-3">
//                                 Already have an account?{" "}
//                                 <Link to="/login">Login</Link>
//                             </p>

//                         </div>
//                     </div>

//                 </div>
//             </div>
//         </div>

//         </>

//     );

// }

// export default Register;


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contact: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Regex patterns
    const patterns = {
        name: /^[A-Za-z ]{3,30}$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        contact: /^[0-9]{10}$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    };

    // Validate individual field
    const validateField = (name, value, currentData = formData) => {
        let message = "";

        switch (name) {
            case "name":
                if (!value.trim()) {
                    message = "Name is required";
                } else if (!patterns.name.test(value)) {
                    message = "Name must contain 3-30 alphabets only";
                }
                break;

            case "email":
                if (!value.trim()) {
                    message = "Email is required";
                } else if (!patterns.email.test(value)) {
                    message = "Enter a valid email address";
                }
                break;

            case "contact":
                if (!value) {
                    message = "Contact number is required";
                } else if (!patterns.contact.test(value)) {
                    message = "Enter a valid 10-digit number";
                }
                break;

            case "password":
                if (!value) {
                    message = "Password is required";
                } else if (!patterns.password.test(value)) {
                    message = "Minimum 8 characters, uppercase, lowercase, number and special character required";
                }
                break;

            case "confirmPassword":
                if (!value) {
                    message = "Confirm password is required";
                } else if (value !== currentData.password) {
                    message = "Password and Confirm Password do not match";
                }
                break;

            default:
                break;
        }

        return message;
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        const updatedData = {
            ...formData,
            [name]: value
        };

        setFormData(updatedData);

        // Validate only after Submit button is clicked
        if (isSubmitted) {
            const message = validateField(name, value, updatedData);

            setErrors(prev => ({
                ...prev,
                [name]: message,
                server: ""
            }));

            // Revalidate confirm password when password changes
            if (name === "password") {
                setErrors(prev => ({
                    ...prev,
                    password: message,
                    confirmPassword: validateField(
                        "confirmPassword",
                        updatedData.confirmPassword,
                        updatedData
                    ),
                    server: ""
                }));
            }
        }
    };

    // Handle Registration Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Enable validation after first Submit click
        setIsSubmitted(true);

        setSuccess("");

        const newErrors = {};

        Object.keys(formData).forEach((field) => {
            newErrors[field] = validateField(
                field,
                formData[field],
                formData
            );
        });

        setErrors({
            ...newErrors,
            server: ""
        });

        // Check validation errors
        const hasErrors = Object.values(newErrors).some(
            error => error !== ""
        );

        if (hasErrors) {
            return;
        }

        try {
            setLoading(true);

            const res = await apiRequest("/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    contact: formData.contact,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Registration failed");
            }

            setSuccess(data.message || "Registration successful!");

            // Clear form
            setFormData({
                name: "",
                email: "",
                contact: "",
                password: "",
                confirmPassword: ""
            });

            setErrors({});
            setIsSubmitted(false);

            // Navigate to Login
            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            setErrors(prev => ({
                ...prev,
                server: error.message || "Unable to connect to backend server!"
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">

                    <div className="card shadow">
                        <div className="card-body p-4">

                            <h2 className="text-center mb-4">
                                Register
                            </h2>

                            {/* Server Error */}
                            {errors.server && (
                                <div className="alert alert-danger">
                                    {errors.server}
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="alert alert-success">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} noValidate>

                                {/* Name */}
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        name="name"
                                        className={`form-control ${
                                            errors.name ? "is-invalid" : ""
                                        }`}
                                        placeholder="Enter Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />

                                    {errors.name && (
                                        <small className="text-danger d-block mt-1">
                                            {errors.name}
                                        </small>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="mb-3">
                                    <input
                                        type="email"
                                        name="email"
                                        className={`form-control ${
                                            errors.email ? "is-invalid" : ""
                                        }`}
                                        placeholder="Enter Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />

                                    {errors.email && (
                                        <small className="text-danger d-block mt-1">
                                            {errors.email}
                                        </small>
                                    )}
                                </div>

                                {/* Contact */}
                                <div className="mb-3">
                                    <input
                                        type="tel"
                                        name="contact"
                                        className={`form-control ${
                                            errors.contact ? "is-invalid" : ""
                                        }`}
                                        placeholder="Enter Contact"
                                        value={formData.contact}
                                        maxLength={10}
                                        onChange={(e) => {
                                            const value = e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 10);

                                            handleChange({
                                                target: {
                                                    name: "contact",
                                                    value
                                                }
                                            });
                                        }}
                                    />

                                    {errors.contact && (
                                        <small className="text-danger d-block mt-1">
                                            {errors.contact}
                                        </small>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="mb-3">
                                    <input
                                        type="password"
                                        name="password"
                                        className={`form-control ${
                                            errors.password ? "is-invalid" : ""
                                        }`}
                                        placeholder="Enter Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />

                                    {errors.password && (
                                        <small className="text-danger d-block mt-1">
                                            {errors.password}
                                        </small>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="mb-3">
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className={`form-control ${
                                            errors.confirmPassword ? "is-invalid" : ""
                                        }`}
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />

                                    {errors.confirmPassword && (
                                        <small className="text-danger d-block mt-1">
                                            {errors.confirmPassword}
                                        </small>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 mt-3"
                                    disabled={loading}
                                >
                                    {loading ? "Registering..." : "Register"}
                                </button>

                            </form>

                            <p className="text-center mt-3">
                                Already have an account?{" "}
                                <Link to="/login">Login</Link>
                            </p>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Register;

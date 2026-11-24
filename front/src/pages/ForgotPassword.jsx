// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { apiRequest } from "../services/api";

// function ForgotPassword() {
//     const [email, setEmail] = useState("");
//     const [message, setMessage] = useState("");
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         setMessage("");
//         setError("");
//         setLoading(true);

//         try {
//             const response = await apiRequest(
//                 "/api/users/forgot-password",
//                 {
//                     method: "POST",
//                     body: JSON.stringify({ email })
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok) {
//                 throw new Error(data.message);
//             }

//             setMessage(data.message);

//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="container mt-5">
//             <div className="card shadow mx-auto"
//                 style={{ maxWidth: "450px" }}>

//                 <div className="card-body p-4">

//                     <h3 className="text-center mb-4">
//                         Forgot Password
//                     </h3>

//                     {message && (
//                         <div className="alert alert-success">
//                             {message}
//                         </div>
//                     )}

//                     {error && (
//                         <div className="alert alert-danger">
//                             {error}
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit}>

//                         <label className="form-label">
//                             Registered Email
//                         </label>

//                         <input
//                             type="email"
//                             className="form-control mb-3"
//                             placeholder="Enter your email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             required
//                         />

//                         <button
//                             className="btn btn-primary w-100"
//                             disabled={loading}
//                         >
//                             {loading ? "Sending..." : "Send Reset Link"}
//                         </button>

//                     </form>

//                     <div className="text-center mt-3">
//                         <Link to="/login">
//                             Back to Login
//                         </Link>
//                     </div>

//                 </div>
//             </div>
//         </div>
//     );
// }

// export default ForgotPassword;



import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";

function ForgotPassword() {

    const [email, setEmail] = useState("");

    const [errors, setErrors] = useState({
        email: "",
        server: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Email Regex
    const emailPattern =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Validate Email
    const validateEmail = (value) => {

        if (!value.trim()) {
            return "Email is required";
        }

        if (!emailPattern.test(value)) {
            return "Enter a valid email address";
        }

        return "";
    };

    // Handle Input Change
    const handleChange = (e) => {

        const value = e.target.value;

        setEmail(value);

        // Validate only after Submit button click
        if (isSubmitted) {

            const errorMessage = validateEmail(value);

            setErrors(prev => ({
                ...prev,
                email: errorMessage,
                server: ""
            }));

        } else {

            setErrors(prev => ({
                ...prev,
                server: ""
            }));

        }
    };

    // Handle Forgot Password Submit
    const handleSubmit = async (e) => {

        e.preventDefault();

        setIsSubmitted(true);

        setMessage("");

        const emailError = validateEmail(email);

        setErrors({
            email: emailError,
            server: ""
        });

        // Stop if validation fails
        if (emailError) {
            return;
        }

        try {

            setLoading(true);

            const response = await apiRequest(
                "/api/users/forgot-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to send reset link"
                );
            }

            setMessage(
                data.message || "Password reset link sent successfully!"
            );

        } catch (err) {

            setErrors(prev => ({
                ...prev,
                server: err.message || "Something went wrong"
            }));

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="container mt-5">

            <div
                className="card shadow mx-auto"
                style={{ maxWidth: "450px" }}
            >

                <div className="card-body p-4">

                    <h3 className="text-center mb-4">
                        Forgot Password
                    </h3>

                    {/* Success Message */}
                    {message && (
                        <div className="alert alert-success">
                            {message}
                        </div>
                    )}

                    {/* Server Error */}
                    {errors.server && (
                        <div className="alert alert-danger">
                            {errors.server}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>

                        {/* Email Field */}
                        <div className="mb-3">

                            <label className="form-label">
                                Registered Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                className={`form-control ${
                                    errors.email ? "is-invalid" : ""
                                }`}
                                placeholder="Enter your email"
                                value={email}
                                onChange={handleChange}
                            />

                            {/* Email Validation Error */}
                            {errors.email && (
                                <small className="text-danger d-block mt-1">
                                    {errors.email}
                                </small>
                            )}

                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading}
                        >
                            {loading
                                ? "Sending..."
                                : "Send Reset Link"}
                        </button>

                    </form>

                    {/* Back to Login */}
                    <div className="text-center mt-3">

                        <Link to="/login">
                            Back to Login
                        </Link>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;

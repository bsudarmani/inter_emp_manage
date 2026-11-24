// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// function Login() {
//     const { login } = useAuth();
//     const navigate = useNavigate();

//     const [form, setForm] = useState({
//         email: "",
//         password: ""
//     });

//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleChange = (e) => {
//         setForm({
//             ...form,
//             [e.target.name]: e.target.value
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError("");
//         setLoading(true);

//         try {
//             const data = await login(
//                 form.email,
//                 form.password
//             );

//             if (data.user.role === "admin") {
//                 navigate("/admin");
//             } else {
//                 navigate("/user");
//             }

//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="container mt-5">
//             <div className="card shadow mx-auto" style={{ maxWidth: "450px" }}>
//                 <div className="card-body p-4">
//                     <h2 className="text-center mb-4">Login</h2>

//                     {error && (
//                         <div className="alert alert-danger">
//                             {error}
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit}>
//                         <input
//                             className="form-control mb-3"
//                             type="email"
//                             name="email"
//                             placeholder="Email"
//                             value={form.email}
//                             onChange={handleChange}
//                             required
//                         />

//                         <input
//                             className="form-control mb-3"
//                             type="password"
//                             name="password"
//                             placeholder="Password"
//                             value={form.password}
//                             onChange={handleChange}
//                             required
//                         />

//                         <button
//                             className="btn btn-success w-100"
//                             disabled={loading}
//                         >
//                             {loading ? "Logging in..." : "Login"}
//                         </button>
//                     </form>

//                     <p className="text-center mt-3">
//                         Don't have an account? <Link to="/register">Register</Link>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Login;



import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({
        email: "",
        password: "",
        server: ""
    });

    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Email and Password Regex
    const patterns = {
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        password: /^.{8,}$/
    };

    // Validate individual fields
    const validateField = (name, value) => {
        switch (name) {
            case "email":
                if (!value.trim()) {
                    return "Email is required";
                }

                if (!patterns.email.test(value)) {
                    return "Enter a valid email address";
                }

                return "";

            case "password":
                if (!value) {
                    return "Password is required";
                }

                if (!patterns.password.test(value)) {
                    return "Password must contain at least 8 characters";
                }

                return "";

            default:
                return "";
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        const updatedForm = {
            ...form,
            [name]: value
        };

        setForm(updatedForm);

        // Validate only after Submit button is clicked
        if (isSubmitted) {
            const message = validateField(name, value);

            setErrors(prev => ({
                ...prev,
                [name]: message,
                server: ""
            }));
        } else {
            // Clear previous server error while typing
            setErrors(prev => ({
                ...prev,
                server: ""
            }));
        }
    };

    // Handle Login Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Enable validation after Submit click
        setIsSubmitted(true);

        const newErrors = {};

        Object.keys(form).forEach((field) => {
            newErrors[field] = validateField(
                field,
                form[field]
            );
        });

        setErrors({
            ...newErrors,
            server: ""
        });

        // Check validation errors
        const hasErrors = Object.values(newErrors).some(
            message => message !== ""
        );

        if (hasErrors) {
            return;
        }

        try {
            setLoading(true);

            // Call AuthContext login function
            const data = await login(
                form.email,
                form.password
            );

            // Role-based navigation
            if (data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/user");
            }

        } catch (err) {
            setErrors(prev => ({
                ...prev,
                server: err.message || "Invalid email or password"
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">

            <div className="card shadow mx-auto"
                style={{ maxWidth: "450px" }}>

                <div className="card-body p-4">

                    <h2 className="text-center mb-4">
                        Login
                    </h2>

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
                                Email
                            </label>

                            <input
                                className={`form-control ${
                                    errors.email ? "is-invalid" : ""
                                }`}
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                            />

                            {errors.email && (
                                <small className="text-danger d-block mt-1">
                                    {errors.email}
                                </small>
                            )}

                        </div>

                        {/* Password Field */}
                        <div className="mb-3">

                            <label className="form-label">
                                Password
                            </label>

                            <input
                                className={`form-control ${
                                    errors.password ? "is-invalid" : ""
                                }`}
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                            />

                            {errors.password && (
                                <small className="text-danger d-block mt-1">
                                    {errors.password}
                                </small>
                            )}

                        </div>

                        {/* Forgot Password */}
                        <div className="text-end mb-3">

                            <Link to="/forgot-password">
                                Forgot Password?
                            </Link>

                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn btn-success w-100"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                    </form>

                    {/* Register Link */}
                    <p className="text-center mt-3">

                        Don't have an account?{" "}

                        <Link to="/register">
                            Register
                        </Link>

                    </p>

                </div>
            </div>
        </div>
    );
}

export default Login;

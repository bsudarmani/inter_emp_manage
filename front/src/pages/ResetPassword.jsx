// import { useState } from "react";
// import { useNavigate, useSearchParams, Link } from "react-router-dom";
// import { apiRequest } from "../services/api";

// function ResetPassword() {
//     const [searchParams] = useSearchParams();
//     const navigate = useNavigate();

//     const token = searchParams.get("token");
//     const email = searchParams.get("email");

//     const [newPassword, setNewPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");

//     const [message, setMessage] = useState("");
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         setMessage("");
//         setError("");

//         if (!token || !email) {
//             setError("Invalid reset link");
//             return;
//         }

//         if (newPassword !== confirmPassword) {
//             setError("Passwords do not match");
//             return;
//         }

//         if (newPassword.length < 8) {
//             setError("Password must contain at least 8 characters");
//             return;
//         }

//         setLoading(true);

//         try {
//             const response = await apiRequest(
//                 "/api/users/reset-password",
//                 {
//                     method: "POST",
//                     body: JSON.stringify({
//                         email,
//                         token,
//                         newPassword
//                     })
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok) {
//                 throw new Error(data.message);
//             }

//             setMessage(data.message);

//             setTimeout(() => {
//                 navigate("/login");
//             }, 2000);

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
//                         Reset Password
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

//                         <input
//                             type="password"
//                             className="form-control mb-3"
//                             placeholder="New Password"
//                             value={newPassword}
//                             onChange={(e) => setNewPassword(e.target.value)}
//                             required
//                         />

//                         <input
//                             type="password"
//                             className="form-control mb-3"
//                             placeholder="Confirm New Password"
//                             value={confirmPassword}
//                             onChange={(e) => setConfirmPassword(e.target.value)}
//                             required
//                         />

//                         <button
//                             className="btn btn-success w-100"
//                             disabled={loading}
//                         >
//                             {loading ? "Updating..." : "Reset Password"}
//                         </button>

//                     </form>

//                     <div className="text-center mt-3">
//                         <Link to="/login">Back to Login</Link>
//                     </div>

//                 </div>
//             </div>
//         </div>
//     );
// }

// export default ResetPassword;




import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { apiRequest } from "../services/api";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [form, setForm] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({
        newPassword: "",
        confirmPassword: "",
        server: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Strong Password Regex
    const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // Validate individual fields
    const validateField = (name, value, currentForm = form) => {
        switch (name) {

            case "newPassword":
                if (!value) {
                    return "New password is required";
                }

                if (!passwordPattern.test(value)) {
                    return "Password must contain 8 characters, uppercase, lowercase, number and special character";
                }

                return "";

            case "confirmPassword":
                if (!value) {
                    return "Confirm password is required";
                }

                if (value !== currentForm.newPassword) {
                    return "Passwords do not match";
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

        // Validate only after Submit button click
        if (isSubmitted) {

            const message = validateField(
                name,
                value,
                updatedForm
            );

            setErrors(prev => ({
                ...prev,
                [name]: message,
                server: ""
            }));

            // Revalidate confirm password when new password changes
            if (name === "newPassword") {
                setErrors(prev => ({
                    ...prev,
                    newPassword: message,
                    confirmPassword: validateField(
                        "confirmPassword",
                        updatedForm.confirmPassword,
                        updatedForm
                    ),
                    server: ""
                }));
            }
        } else {
            setErrors(prev => ({
                ...prev,
                server: ""
            }));
        }
    };

    // Handle Reset Password Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitted(true);
        setMessage("");

        // Check reset link
        if (!token || !email) {
            setErrors(prev => ({
                ...prev,
                server: "Invalid reset link"
            }));
            return;
        }

        const newErrors = {};

        Object.keys(form).forEach((field) => {
            newErrors[field] = validateField(
                field,
                form[field],
                form
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

            const response = await apiRequest(
                "/api/users/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        token,
                        newPassword: form.newPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Password reset failed"
                );
            }

            setMessage(
                data.message || "Password reset successfully!"
            );

            setForm({
                newPassword: "",
                confirmPassword: ""
            });

            setErrors({
                newPassword: "",
                confirmPassword: "",
                server: ""
            });

            setIsSubmitted(false);

            // Navigate to Login
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            setErrors(prev => ({
                ...prev,
                server: err.message || "Unable to reset password"
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

                    <h3 className="text-center mb-4">
                        Reset Password
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

                        {/* New Password */}
                        <div className="mb-3">

                            <label className="form-label">
                                New Password
                            </label>

                            <input
                                type="password"
                                name="newPassword"
                                className={`form-control ${
                                    errors.newPassword
                                        ? "is-invalid"
                                        : ""
                                }`}
                                placeholder="Enter New Password"
                                value={form.newPassword}
                                onChange={handleChange}
                            />

                            {errors.newPassword && (
                                <small className="text-danger d-block mt-1">
                                    {errors.newPassword}
                                </small>
                            )}

                            <small className="text-muted d-block mt-2">
                                Minimum 8 characters with uppercase,
                                lowercase, number and special character.
                            </small>

                        </div>

                        {/* Confirm Password */}
                        <div className="mb-3">

                            <label className="form-label">
                                Confirm New Password
                            </label>

                            <input
                                type="password"
                                name="confirmPassword"
                                className={`form-control ${
                                    errors.confirmPassword
                                        ? "is-invalid"
                                        : ""
                                }`}
                                placeholder="Confirm New Password"
                                value={form.confirmPassword}
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
                            className="btn btn-success w-100"
                            disabled={loading}
                        >
                            {loading
                                ? "Updating..."
                                : "Reset Password"}
                        </button>

                    </form>

                    {/* Login Link */}
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

export default ResetPassword;

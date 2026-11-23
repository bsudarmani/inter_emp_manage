
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function Register() {
    const navigate=useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contact: "",
        password: "",
        confirmPassword: ""
    });

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    // Handle Registration

const handleSubmit = async (e) => {

    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
        setError("Password and Confirm Password do not match!");
        return;
    }

    if (formData.contact.length !== 10) {
        setError("Enter a valid 10-digit contact number");
        return;
    }

    try {

        setLoading(true);

        const res = await apiRequest("/api/users/register",
            {
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
            }
        );

        // Read response safely
        const data = await res.json();

        console.log("Status Code:", res.status);
        console.log("Backend Response:", data);

        if (!res.ok) {
            throw new Error(data.message);
            // setError(
            //     data.message || data.error || `HTTP Error: ${res.status}`
            // );

            // return;
        }
         setSuccess(data.message);
         setError("")
        alert(data.message || "Registration successful!");
        // Navigate("/login");
        // setFormData({
        //     name: "",
        //     email: "",
        //     contact: "",
        //     password: "",
        //     confirmPassword: ""
        // });
        setTimeout(() => {
    navigate("/login");
}, 1500);
    }
    catch (error) {
        console.error("Fetch Error:", error);
        setError("Unable to connect to backend server!");
    }
    finally {
        setLoading(false);
    }

};


    return (

        <>

            <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">

                    <div className="card shadow">
                        <div className="card-body p-4">

                            <h2 className="text-center mb-4">
                                Register
                            </h2>

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}
                            {success && (
    <div className="alert alert-success">
        {success}
    </div>
)}

                            <form onSubmit={handleSubmit}>

                                <input
                                    type="text"
                                    name="name"
                                    className="form-control mb-3"
                                    placeholder="Enter Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    type="email"
                                    name="email"
                                    className="form-control mb-3"
                                    placeholder="Enter Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    type="tel"
                                    name="contact"
                                    className="form-control mb-3"
                                    placeholder="Enter Contact"
                                    value={formData.contact}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            contact: e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 10)
                                        });
                                    }}
                                    required
                                />

                                <input
                                    type="password"
                                    name="password"
                                    className="form-control mb-3"
                                    placeholder="Enter Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-control mb-3"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
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

        </>

    );

}

export default Register;

import React, { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, password } = credentials;

    if (username === "kavya" && password === "kavya123") {
        localStorage.setItem("isAdmin", true);
      navigate("/admin");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 10 }}>
      <Card elevation={4} sx={{ borderRadius: 3, px: 3, py: 5 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Admin Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              required
              fullWidth
            />
            {error && (
              <Typography color="error" variant="body2" align="center">
                {error}
              </Typography>
            )}
            <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2 }}>
              Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminLogin;

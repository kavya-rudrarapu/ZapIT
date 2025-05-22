import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";

const Login = () => {
  const handleGoogleLogin = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/login", {
        withCredentials: true,
      });
      const { auth_url } = res.data;
      window.location.href = auth_url;
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd, #fce4ec)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          backgroundColor: "none",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
          maxWidth: "500px",
          width: "100%",

        }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 ,color:"#2c3e50"}}>
          ZapIT
        </Typography>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "gray", mb: 4, fontStyle: "italic" }}
        >
          A Ticketing Tool for IT Teams
        </Typography>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoogleLogin}
            sx={{ borderRadius: 2, px: 4, py: 1.5, fontSize: "1rem",backgroundColor:"#2c3e50" }}
          >
            Sign in with Google
          </Button>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default Login;

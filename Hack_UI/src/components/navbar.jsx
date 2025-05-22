// src/components/Navbar.js
import React from "react";
import { Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("name") || "User";

  const handleLogout = async () => {
    await axios.post("http://localhost:5001/api/logout", {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 5,
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={() => navigate("/raise-ticket")}>
          Raise Ticket
        </Button>

        <Button variant="outlined" color="primary" onClick={() => navigate("/tickets")}>
          My Tickets
        </Button>
      </Box>

      <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
        Welcome, {userName}!
      </Typography>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined" color="secondary" onClick={() => navigate("/solutions")}>
          View Solutions
        </Button>

        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Navbar;

import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const API_URL = "http://localhost:5001/api/tickets";
const UPDATE_URL = "http://localhost:5001/api/update-ticket-status";

const Admin = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL);
        setTickets(res.data);
      } catch (err) {
        setError("Failed to load tickets");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
       await axios.patch(`${UPDATE_URL}/${ticketId}`, {
        status: newStatus,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticket_id === ticketId
            ? { ...ticket, status: newStatus }
            : ticket
        )
      );
    } catch (error) {
      console.error("Failed to update ticket status", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/adminLogin");
  };

  
  const sortedTickets = [...tickets].sort((a, b) => {
    const priority = { open: 0, reopen: 1, reopened: 1, resolved: 2, close: 3 };
    return (priority[a.status] ?? 99) - (priority[b.status] ?? 99);
  });

  return (
    <Container maxWidth="lg" sx={{ pt: 6 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4">All Tickets</Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <TableContainer
                          component={Paper}
                          sx={{
                              borderRadius: 3,
                              backdropFilter: "blur(10px)",
                              backgroundColor: "rgba(255, 255, 255, 0.6)",
                              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                              color: "#2c3e50",
                          }}
                    >
            <Table>
              <TableHead  sx={{backgroundColor: "#2c3e50",opacity: 0.9}}>
                <TableRow>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Ticket ID</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Issue Title</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>User Name</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Priority</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedTickets.map((ticket) => (
                  <TableRow key={ticket.ticket_id}>
                    <TableCell>{ticket.ticket_id}</TableCell>
                    <TableCell>{ticket.issue_title}</TableCell>
                    <TableCell>{ticket.user_name || "N/A"}</TableCell>
                    <TableCell>
                      {["open", "reopen", "reopened"].includes(ticket.status) ? (
                        <Select
                          value={ticket.status}
                          onChange={(e) =>
                            handleStatusChange(ticket.ticket_id, e.target.value)
                          }
                          size="small"
                          variant="standard"
                        >
                          <MenuItem value={ticket.status}>
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </MenuItem>
                          <MenuItem value="resolved">Resolved</MenuItem>
                        </Select>
                      ) : (
                        ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)
                      )}
                    </TableCell>
                    <TableCell>
                      {ticket.priority}
                    </TableCell>
                    <TableCell>
                      {ticket.created_at
                        ? new Date(ticket.created_at).toLocaleString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>
      )}
    </Container>
  );
};

export default Admin;

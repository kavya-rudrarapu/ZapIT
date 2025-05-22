import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";

const userId = localStorage.getItem("user_id");
const API_URL = `http://localhost:5001/api/tickets/${userId}`;
const UPDATE_URL = "http://localhost:5001/api/update-ticket-status";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTickets(res.data.tickets);
      } catch (err) {
        console.error("Failed to fetch tickets", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

const handleStatusChange = async (ticketId, newStatus) => {
  try {
     await axios.patch(
      `${UPDATE_URL}/${ticketId}`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.ticket_id === ticketId
          ? { ...ticket, status: newStatus }
          : ticket
      )
    );
  } catch (error) {
    console.error("Failed to update ticket status", error);
  }
};


  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h5" gutterBottom>
        My Tickets
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
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
            <TableHead sx={{backgroundColor: "#2c3e50",opacity: 0.9}}>
              <TableRow >
                <TableCell  sx={{ color: "#fff", fontWeight: "bold" }}><strong>Ticket ID</strong></TableCell>
                <TableCell  sx={{ color: "#fff", fontWeight: "bold" }}><strong>Issue Title</strong></TableCell>
                <TableCell  sx={{ color: "#fff", fontWeight: "bold" }}><strong>Status</strong></TableCell>
                <TableCell  sx={{ color: "#fff", fontWeight: "bold" }}><strong>Priority</strong></TableCell>
                <TableCell  sx={{ color: "#fff", fontWeight: "bold" }}><strong>Created At</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
             {[...tickets]
                    .sort((a, b) => (a.status === "close" ? 1 : 0) - (b.status === "close" ? 1 : 0))
                    .map((ticket) => (
                <TableRow key={ticket.ticket_id}>
                  <TableCell>{ticket.ticket_id}</TableCell>
                  <TableCell>{ticket.issue_title}</TableCell>
                  <TableCell>
                   <Select
                        value={ticket.status}
                        onChange={(e) =>
                            handleStatusChange(ticket.ticket_id, e.target.value)
                        }
                        size="small"
                        variant="standard"
                        disabled={ticket.status === "close"} // 🔒 disables if closed
                        >
                      <MenuItem value="open"  disabled={ticket.status === "resolved" || "reopen"}>Open</MenuItem>
                      <MenuItem value="close">Close</MenuItem>
                      <MenuItem value="reopen" disabled={ticket.status === "open"}>Reopen</MenuItem>
                      <MenuItem value="resolved"  disabled={ticket.status === "resolved"} style={{display:ticket.status==="resolved"?"block":"none"}}>Resolved</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {ticket.priority}
                    </TableCell>
                  <TableCell>
                    {new Date(ticket.created_at).toLocaleString()}
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Tickets;

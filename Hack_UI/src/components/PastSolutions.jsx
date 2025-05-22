import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Box,
  Grid,
  TextField,
} from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";
import { debounce } from "lodash";

const API_URL = "http://localhost:5001/api/tickets";

const PastSolutions = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL);
        setTickets(res.data);
        setFilteredTickets(res.data);
      } catch (err) {
        setError("Failed to fetch tickets.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((query, ticketsList) => {
        const filtered = ticketsList.filter((ticket) =>
          ticket.issue_title.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredTickets(filtered);
      }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm, tickets);
    return () => debouncedSearch.cancel(); // cleanup
  }, [searchTerm, tickets, debouncedSearch]);

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>
        Past Solutions
      </Typography>

      <TextField
        label="Search by issue title"
        variant="outlined"
        fullWidth
        sx={{ mb: 4 }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredTickets.map((ticket, idx) => (
            <Grid item xs={12} key={ticket.ticket_id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card elevation={3} sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {ticket.issue_title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Ticket ID: {ticket.ticket_id}
                    </Typography>
                  
                    <Typography variant="body2" color="textSecondary">
                     {ticket.description}
                      </Typography>
                    
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default PastSolutions;

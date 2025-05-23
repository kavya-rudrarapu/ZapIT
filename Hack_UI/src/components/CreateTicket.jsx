import React, { useState } from "react";
import {
  TextField,
  Button,
  Card,
  Typography,
  Box,
  Container,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";

export default function CreateTicket() {
  const [response, setResponse] = useState("");
  const [issueTitle, setIssueTitle] = useState("");
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5001/api/raise-ticket",
        { issue_title: issueTitle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIssueTitle("");
      setResponse(res.data.agent_reply? res.data.agent_reply : res.data.message);
    } catch (err) {
      console.error("Error creating ticket", err);
      setResponse("Something went wrong. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        mt:-10
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: "100%" }}
      >
        <Box sx={{ mx: "20%" }}>
          <Card
            elevation={6}
            sx={{ borderRadius: 4, p: 4, backgroundColor: "#fdfdfd" }}
          >
            <Typography variant="h4" gutterBottom align="center">
              Raise a Ticket
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <TextField
                label="Issue Title"
                name="issue_title"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                required
                fullWidth
              />
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ px: 4, py: 1, borderRadius: 3, minWidth: "160px" }}
                  disabled={posting}
                >
                  {posting ? "Submitting..." : "Submit"}
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
        {response && (<Box sx={{ mt: 2, textAlign: "center" }}>
          <Card
            sx={{ padding: 2, backgroundColor: "#f0f0f0", borderRadius: 2 }}
          >
            <Typography variant="body2" color="textSecondary">
              Bot Response
            </Typography>
            <Typography variant="body1" color="textPrimary">
              {response}
            </Typography>
          </Card>
        </Box>)} 
      </motion.div>
    </Container>
  );
}

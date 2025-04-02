import React from "react";
import { Box, Typography, Container } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

const Restricted = () => {
  return (
    <div className="main-container">
      <Box
        sx={{
          paddingTop: { xs: "50px", sm: "80px", md: "100px" },
          textAlign: "center",
          marginTop:"1/3",
        }}
      >
        {/* Lock Icon inside the circle */}
        <Box
          sx={{
            width: { xs: "70px", sm: "80px", md: "100px" },
            height: { xs: "70px", sm: "80px", md: "100px" },
            backgroundColor: "#8b4513",
            borderRadius: "50%",
            margin: "0 auto",
          
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LockIcon
            sx={{
              fontSize: { xs: 30, sm: 40, md: 50 },
              color: "white",
            }}
          />
        </Box>

        <Box mt={4}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
          >
            Access to this page is restricted
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Please check with the site admin if you believe this is a mistake.
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

export default Restricted;

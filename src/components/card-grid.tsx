import { Box, cardClasses, cardContentClasses, styled } from "@mui/material";

const CardGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(4),
  [`& .${cardClasses.root}`]: {
    boxShadow: theme.shadows[2],
  },
  [`& .${cardContentClasses.root}`]: {
    padding: theme.spacing(8),
  },

  [theme.breakpoints.down("sm")]: {
    gap: theme.spacing(2),
    [`& .${cardContentClasses.root}`]: {
      padding: theme.spacing(2),
    },
  },
}));

export default CardGrid;

import { styled, Table, tableCellClasses, tableClasses } from "@mui/material";

const ComparisonTable = styled(Table)(({ theme }) => ({
  mb: theme.spacing(2),
  width: "100%",

  [`& .${tableClasses.root}`]: {
    tableLayout: "fixed", // Ensures the table takes full width
    width: "100%",
  },

  // Make sure the 1st column takes 50% of the width
  [`& .${tableCellClasses.root}:first-of-type`]: {
    paddingLeft: 0,
    width: "50%", // Ensures the first column takes 50% of the width
  },
  [`& .${tableCellClasses.root}:last-of-type`]: {
    textAlign: "right", // Ensures the first column takes 50% of the width
  },
}));

export default ComparisonTable;

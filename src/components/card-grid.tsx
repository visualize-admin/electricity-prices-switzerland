import {
  Box,
  cardClasses,
  cardContentClasses,
  Typography,
  TypographyProps,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";

const vars = {
  cardGridPaddingX: "--card-grid-padding-x",
  cardGridPaddingY: "--card-grid-padding-y",
} as const;

export { vars };

const useStyles = makeStyles()((theme) => ({
  cardGrid: {
    display: "grid",
    gap: theme.spacing(4),
    [vars.cardGridPaddingX]: theme.spacing(8),
    [vars.cardGridPaddingY]: theme.spacing(8),
    [`& .${cardClasses.root}`]: {
      boxShadow: theme.shadows[2],
    },
    [`& .${cardContentClasses.root}`]: {
      paddingLeft: `var(${vars.cardGridPaddingX})`,
      paddingRight: `var(${vars.cardGridPaddingX})`,
      paddingTop: `var(${vars.cardGridPaddingY})`,
      paddingBottom: `var(${vars.cardGridPaddingY})`,
    },
    [theme.breakpoints.down("sm")]: {
      gap: theme.spacing(2),
      [vars.cardGridPaddingX]: theme.spacing(5),
      [vars.cardGridPaddingY]: theme.spacing(5),
    },
  },
  sectionTitle: {
    gridColumn: "1 / -1",
    [theme.breakpoints.down("sm")]: {
      paddingTop: "0.5rem",
      paddingBottom: "0.25rem",
    },
  },
}));

const CardGrid = (props: React.ComponentProps<typeof Box>) => {
  const { classes, cx } = useStyles();
  return <Box {...props} className={cx(classes.cardGrid, props.className)} />;
};

export const CardGridSectionTitle = (props: TypographyProps) => {
  const { classes, cx } = useStyles();
  return (
    <Typography
      variant="h2"
      {...props}
      className={cx(classes.sectionTitle, props.className)}
    />
  );
};

export default CardGrid;

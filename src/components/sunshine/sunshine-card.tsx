import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";
import { makeStyles } from "tss-react/mui";

type SunshineCardProps = {
  children: ReactNode;
};

const useStyles = makeStyles()((theme) => ({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: theme.spacing(12),
    // Define grid template rows for consistent alignment
    gridTemplateRows: "auto auto auto",
  },
  card: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
    borderRadius: theme.shape.borderRadius,
    display: "grid",
    // Use subgrid to align with parent grid rows
    gridTemplateRows: "subgrid",
    gridRow: "span 3",
    height: "fit-content",
  },
  header: {
    padding: theme.spacing(6.5, 6),
  },
  content: {
    padding: theme.spacing(0, 6.5, 6.5, 6.5),
    gridTemplateRows: "subgrid",
    gridRow: "span 3",
    display: "grid",
    gap: theme.spacing(6),
  },
  linksContainer: {
    border: "1px solid red",
  },
}));

type SunshineCardPropsWithClassName = SunshineCardProps & {
  className?: string;
};

type SunshineCardGridProps = {
  children: ReactNode;
  className?: string;
};

type SunshineCardLinksProps = {
  children: ReactNode;
  className?: string;
};

export const SunshineCard = (props: SunshineCardPropsWithClassName) => {
  const { children, className } = props;
  const { classes, cx } = useStyles();
  return <div className={cx(classes.card, className)}>{children}</div>;
};

export const SunshineCardHeader = (props: SunshineCardPropsWithClassName) => {
  const { children, className } = props;
  const { classes, cx } = useStyles();
  return <div className={cx(classes.header, className)}>{children}</div>;
};

export const SunshineCardContent = (props: SunshineCardPropsWithClassName) => {
  const { children, className } = props;
  const { classes, cx } = useStyles();
  return <div className={cx(classes.content, className)}>{children}</div>;
};

export const SunshineCardTitle = (props: SunshineCardProps) => {
  const { children } = props;
  return (
    <Typography fontWeight={700} component={"h4"} lineHeight={1.4} variant="h3">
      {children}
    </Typography>
  );
};

export const SunshineCardDescription = (props: SunshineCardProps) => {
  const { children } = props;
  return <Typography variant="body2">{children}</Typography>;
};

export const SunshineImageWrapper = (props: SunshineCardProps) => {
  const { children } = props;
  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        display: "flex",
        aspectRatio: "1.5",
      }}
    >
      <Box
        sx={{
          flex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export const SunshineCardGrid = (props: SunshineCardGridProps) => {
  const { children, className } = props;
  const { classes, cx } = useStyles();
  return <div className={cx(classes.grid, className)}>{children}</div>;
};

export const SunshineCardLinks = (props: SunshineCardLinksProps) => {
  const { children, className } = props;
  const { classes, cx } = useStyles();
  return (
    <div className={cx(classes.linksContainer, className)}>{children}</div>
  );
};

// Export useStyles hook for additional customization
export { useStyles as useSunshineCardStyles };

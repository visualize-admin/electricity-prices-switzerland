import { IconButton } from "@mui/material";
import { IconButtonProps } from "@mui/material/IconButton/IconButton";
import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((theme) => ({
  iconButton: {
    backgroundColor: theme.palette.background.paper,
    height: 40,
    boxShadow: theme.shadows[1],
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[2],
    },
    "& svg": {
      width: 16,
      height: 16,
      color: theme.palette.text.primary,
    },
  },
}));

export const WidgetIcon = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
} & IconButtonProps) => {
  const { classes: iconClasses, cx } = useStyles();
  return (
    <IconButton
      size="sm"
      className={cx(iconClasses.iconButton, className)}
      {...props}
    >
      {children}
    </IconButton>
  );
};

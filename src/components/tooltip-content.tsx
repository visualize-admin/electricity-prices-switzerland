import { Box, Typography } from "@mui/material";

type TooltipContentProps = {
  title: React.ReactNode;
  content: React.ReactNode;
} & Omit<React.ComponentProps<typeof Box>, "title" | "content">;

const TooltipContent: React.FC<TooltipContentProps> = ({
  title,
  content,
  ...props
}) => (
  <Box
    {...props}
    sx={{
      padding: "12px 16px",
      display: "flex",
      gap: 2,
      flexDirection: "column",
      ...props.sx,
    }}
  >
    <Typography variant="h5" fontWeight="bold">
      {title}
    </Typography>
    <Typography variant="caption">{content}</Typography>
  </Box>
);

export default TooltipContent;

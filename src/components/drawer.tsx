import { DrawerProps } from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import { ReactNode } from "react";

type CustomDrawerProps = {
  children: ReactNode;
  open?: DrawerProps["open"];
  onClose?: DrawerProps["onClose"];
  onExited?: () => void;
};

export const InlineDrawer = ({
  children,
  open,
  onClose,
}: CustomDrawerProps) => {
  return (
    <MuiDrawer
      open={open}
      onClose={onClose}
      variant="temporary"
      hideBackdrop
      anchor="left"
      ModalProps={{
        disablePortal: true,
        disableAutoFocus: true,
        keepMounted: true,
        disableScrollLock: true,
        sx: {
          position: "absolute",
        },
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          boxShadow: "none",
          backgroundColor: "background.paper",
        },
      }}
    >
      {children}
    </MuiDrawer>
  );
};

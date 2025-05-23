import { DrawerProps } from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import { ReactNode } from "react";

export const DRAWER_WIDTH = 340;

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
        keepMounted: true,
        disableScrollLock: true,
        sx: {
          position: "absolute",
        },
      }}
      PaperProps={{
        sx: {
          position: "absolute",
          top: 0,
          left: 0,
          width: DRAWER_WIDTH,
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

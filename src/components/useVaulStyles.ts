import { tss } from "tss-react/mui";

const useVaulStyles = tss.create(({ theme }) => ({
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: theme.zIndex.modal,
  },
  content: {
    backgroundColor: theme.palette.background.paper,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    maxHeight: "85vh",
    marginTop: 96, // 24rem
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.modal,
  },
  contentFullHeight: {
    marginTop: 0,
    height: "100vh",
    maxHeight: "none",
  },
  scrollArea: {
    margin: `${theme.spacing(0)} ${theme.spacing(2)}`,
    overflowY: "scroll",
    overflowX: "hidden",
    height: "100%",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: -10,
    right: 0,
    zIndex: 1000,
    backgroundColor: theme.palette.background.paper,
    borderRadius: "100%",
  },
  handle: {
    marginLeft: "auto",
    marginRight: "auto",
    width: 48, // 12rem
    height: 6, // 1.5px
    flexShrink: 0,
    borderRadius: 9999,
    backgroundColor: theme.palette.grey[300],
    marginTop: theme.spacing(1), // 2
    marginBottom: theme.spacing(2), // 4
  },
}));

export default useVaulStyles;

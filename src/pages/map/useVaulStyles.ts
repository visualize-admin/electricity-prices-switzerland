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
    display: "flex",
    flexDirection: "column",
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

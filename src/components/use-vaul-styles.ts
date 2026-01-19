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
    "--max-height": "85vh",
    maxHeight: "var(--max-height)",
    marginTop: 96, // 24rem
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.modal,
    display: "flex",
    width: "100%",
    flexDirection: "column",
  },
  contentFullHeight: {
    marginTop: 0,
    height: "100vh",
    maxHeight: "none",
  },
  scrollArea: {
    padding: `${theme.spacing(2)} ${theme.spacing(
      4
    )} calc(env(safe-area-inset-bottom) + ${theme.spacing(2)})`,
    overflowY: "scroll",
    overflowX: "hidden",
    maxHeight: "var(--max-height)",
    position: "relative",
    flexGrow: 1,
  },
  header: {
    padding: `${theme.spacing(0)} ${theme.spacing(4)}`,
    paddingTop: 0,
    paddingBottom: theme.spacing(2),
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: theme.palette.background.paper,
    borderRadius: "100%",
  },
  handle: {
    marginLeft: "auto",
    marginRight: "auto",
    width: 48,
    height: 6, // 1.5px
    flexShrink: 0,
    borderRadius: 9999,
    backgroundColor: theme.palette.grey[300],
    marginTop: theme.spacing(1), // 2
    marginBottom: theme.spacing(2), // 4
  },
}));

export default useVaulStyles;

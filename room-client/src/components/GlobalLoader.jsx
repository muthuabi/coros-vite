// components/GlobalLoader.jsx
import { useUIState } from "../contexts/UIStateContext";
import { Backdrop, CircularProgress } from "@mui/material";

const GlobalLoader = () => {
  const { uiState } = useUIState();

  return (
    <Backdrop
      open={uiState.globalLoader}
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default GlobalLoader;

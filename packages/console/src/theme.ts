import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#388e3c',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600 },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
  },
});

export default theme;

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function LoadingScreen({ message }: { message?: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <CircularProgress size={48} />
      {message && <Typography sx={{ mt: 2 }} color="text.secondary">{message}</Typography>}
    </Box>
  );
}

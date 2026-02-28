import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useClient } from '../../context/AuthContext.js';
import { useSnackbar } from '../../context/SnackbarContext.js';
import JsonEditor from '../../components/JsonEditor.js';

export default function ServerInfoPage() {
  const client = useClient();
  const { showError } = useSnackbar();
  const [capability, setCapability] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const cs = await client.readMetadata();
        setCapability(JSON.stringify(cs, null, 2));
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Failed to load metadata');
      } finally {
        setLoading(false);
      }
    })();
  }, [client, showError]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Server Info</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        CapabilityStatement from GET /metadata
      </Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <JsonEditor value={capability} readOnly height="600px" />
      )}
    </Box>
  );
}

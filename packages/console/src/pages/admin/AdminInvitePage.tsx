import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import { useAuth } from '../../context/AuthContext.js';
import { useSnackbar } from '../../context/SnackbarContext.js';
import { getConfig } from '../../config.js';

export default function AdminInvitePage() {
  const { project, client } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?.id) return;
    setLoading(true);
    setResult(null);
    try {
      const config = getConfig();
      const token = client.getAccessToken();
      const resp = await fetch(`${config.baseUrl}/admin/projects/${project.id}/invite`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, firstName, lastName }),
      });
      if (resp.ok) {
        const data = await resp.json();
        showSuccess('User invited successfully');
        setResult(JSON.stringify(data, null, 2));
        setEmail('');
        setFirstName('');
        setLastName('');
      } else {
        const err = await resp.json().catch(() => null);
        showError(err?.issue?.[0]?.diagnostics ?? 'Invite failed');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Invite failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate('/admin'); }}>
          Admin
        </Link>
        <Typography color="text.primary">Invite User</Typography>
      </Breadcrumbs>

      <Typography variant="h5" sx={{ mb: 2 }}>Invite User to Project</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400 }}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="First Name"
          fullWidth
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Last Name"
          fullWidth
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Inviting...' : 'Send Invite'}
        </Button>
      </Box>

      {result && (
        <Alert severity="success" sx={{ mt: 3, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12 }}>
          {result}
        </Alert>
      )}
    </Box>
  );
}

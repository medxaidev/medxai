import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { useAuth } from '../../context/AuthContext.js';
import { useSnackbar } from '../../context/SnackbarContext.js';
import { getConfig } from '../../config.js';

interface MemberEntry {
  id: string;
  user?: { reference?: string };
  profile?: { reference?: string };
  admin?: boolean;
}

export default function AdminMembersPage() {
  const { project, client } = useAuth();
  const { showError } = useSnackbar();
  const navigate = useNavigate();
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project?.id) return;
    (async () => {
      try {
        const config = getConfig();
        const token = client.getAccessToken();
        const resp = await fetch(`${config.baseUrl}/admin/projects/${project.id}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          setMembers(Array.isArray(data) ? data : data.members ?? []);
        } else {
          showError('Failed to load members');
        }
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Failed to load members');
      } finally {
        setLoading(false);
      }
    })();
  }, [project?.id, client, showError]);

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate('/admin'); }}>
          Admin
        </Link>
        <Typography color="text.primary">Members</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Project Members</Typography>
        <Button variant="contained" size="small" onClick={() => navigate('/admin/invite')}>
          Invite User
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading members...</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Membership ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Profile</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{m.id?.substring(0, 8)}...</TableCell>
                  <TableCell>{m.user?.reference ?? '—'}</TableCell>
                  <TableCell>{m.profile?.reference ?? '—'}</TableCell>
                  <TableCell>
                    <Chip label={m.admin ? 'Admin' : 'Member'} size="small" color={m.admin ? 'primary' : 'default'} />
                  </TableCell>
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No members found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

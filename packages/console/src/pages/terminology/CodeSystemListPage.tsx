import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useClient } from '../../context/AuthContext.js';
import { useSnackbar } from '../../context/SnackbarContext.js';
import type { Bundle, FhirResource } from '@medxai/fhir-client';

export default function CodeSystemListPage() {
  const client = useClient();
  const navigate = useNavigate();
  const { showError } = useSnackbar();
  const [items, setItems] = useState<FhirResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { _count: '100', _sort: 'name' };
      if (filter) params.name = filter;
      const bundle: Bundle = await client.search('CodeSystem', params);
      setItems(bundle.entry?.map((e) => e.resource!).filter(Boolean) ?? []);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load CodeSystems');
    } finally {
      setLoading(false);
    }
  }, [client, filter, showError]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>CodeSystem Browser</Typography>
      <TextField
        label="Filter by name"
        size="small"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{ mb: 2, width: 300 }}
      />
      {loading ? <Typography>Loading...</Typography> : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((r) => {
                const rc = r as Record<string, any>;
                return (
                  <TableRow key={r.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/terminology/codesystems/${r.id}`)}>
                    <TableCell>{rc.name ?? '—'}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{rc.url ?? '—'}</TableCell>
                    <TableCell>{rc.version ?? '—'}</TableCell>
                    <TableCell>{rc.status ?? '—'}</TableCell>
                  </TableRow>
                );
              })}
              {items.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center"><Typography color="text.secondary">No CodeSystems found</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useClient } from '../../context/AuthContext.js';
import { useSnackbar } from '../../context/SnackbarContext.js';
import { cleanResource } from '../../components/cleanResource.js';
import JsonEditor from '../../components/JsonEditor.js';
import OperationOutcomeAlert from '../../components/OperationOutcomeAlert.js';
import type { FhirResource, Bundle } from '@medxai/fhir-client';

export default function ResourceDetailPage() {
  const { resourceType, id } = useParams<{ resourceType: string; id: string }>();
  const navigate = useNavigate();
  const client = useClient();
  const { showSuccess, showError } = useSnackbar();

  const [resource, setResource] = useState<FhirResource | null>(null);
  const [editJson, setEditJson] = useState('');
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [history, setHistory] = useState<FhirResource[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [outcome, setOutcome] = useState<any>(null);
  const [vreadResource, setVreadResource] = useState<FhirResource | null>(null);

  const fetchResource = useCallback(async () => {
    if (!resourceType || !id) return;
    setLoading(true);
    try {
      const r = await client.readResource(resourceType, id);
      setResource(r);
      setEditJson(JSON.stringify(cleanResource(r as Record<string, any>), null, 2));
      setOutcome(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load resource');
    } finally {
      setLoading(false);
    }
  }, [client, resourceType, id, showError]);

  useEffect(() => {
    fetchResource();
  }, [fetchResource]);

  const fetchHistory = useCallback(async () => {
    if (!resourceType || !id) return;
    setHistoryLoading(true);
    try {
      const bundle: Bundle = await client.readHistory(resourceType, id);
      setHistory(bundle.entry?.map((e) => e.resource!).filter(Boolean) ?? []);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  }, [client, resourceType, id, showError]);

  useEffect(() => {
    if (tab === 2) fetchHistory();
  }, [tab, fetchHistory]);

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(editJson);
      parsed.resourceType = resourceType;
      parsed.id = id;
      const updated = await client.updateResource(parsed);
      setResource(updated);
      setEditJson(JSON.stringify(cleanResource(updated as Record<string, any>), null, 2));
      setOutcome(null);
      showSuccess('Resource updated');
    } catch (err: any) {
      if (err?.outcome) {
        setOutcome(err.outcome);
      }
      showError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleDelete = async () => {
    try {
      await client.deleteResource(resourceType!, id!);
      showSuccess(`Deleted ${resourceType}/${id}`);
      navigate(`/${resourceType}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Delete failed');
    }
    setDeleteOpen(false);
  };

  const handleVread = async (vid: string) => {
    try {
      const r = await client.readVersion(resourceType!, id!, vid);
      setVreadResource(r);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to read version');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!resource) {
    return <Typography color="error">Resource not found</Typography>;
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate(`/${resourceType}`); }}>
          {resourceType}
        </Link>
        <Typography color="text.primary" sx={{ fontFamily: 'monospace' }}>{id?.substring(0, 8)}...</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h5">{resourceType}/{id?.substring(0, 8)}</Typography>
        <Chip label={`v${resource.meta?.versionId ?? '?'}`} size="small" />
        <Typography variant="caption" color="text.secondary">
          Updated: {resource.meta?.lastUpdated?.substring(0, 19)}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="JSON" />
          <Tab label="Edit" />
          <Tab label="History" />
          <Tab label="Delete" />
        </Tabs>
      </Box>

      {/* Tab 0: JSON View */}
      {tab === 0 && (
        <JsonEditor value={JSON.stringify(resource, null, 2)} readOnly height="500px" />
      )}

      {/* Tab 1: Edit */}
      {tab === 1 && (
        <Box>
          <OperationOutcomeAlert outcome={outcome} />
          <Box sx={{ mt: outcome ? 2 : 0 }}>
            <JsonEditor value={editJson} onChange={setEditJson} height="500px" />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleSave}>Save</Button>
            <Button variant="outlined" onClick={() => setEditJson(JSON.stringify(cleanResource(resource as Record<string, any>), null, 2))}>
              Reset
            </Button>
          </Box>
        </Box>
      )}

      {/* Tab 2: History */}
      {tab === 2 && (
        <Box>
          {historyLoading ? (
            <Typography>Loading history...</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Version</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.meta?.versionId} hover>
                      <TableCell>{h.meta?.versionId}</TableCell>
                      <TableCell>{h.meta?.lastUpdated?.substring(0, 19)}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleVread(h.meta!.versionId!)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {history.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No history entries</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* VRead Dialog */}
          <Dialog open={!!vreadResource} onClose={() => setVreadResource(null)} maxWidth="md" fullWidth>
            <DialogTitle>
              Version {vreadResource?.meta?.versionId} — {vreadResource?.meta?.lastUpdated?.substring(0, 19)}
            </DialogTitle>
            <DialogContent>
              <JsonEditor value={JSON.stringify(vreadResource, null, 2)} readOnly height="400px" />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setVreadResource(null)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* Tab 3: Delete */}
      {tab === 3 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            Delete {resourceType}/{id}?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            This action cannot be undone. The resource will be marked as deleted.
          </Typography>
          <Button variant="contained" color="error" onClick={() => setDeleteOpen(true)}>
            Confirm Delete
          </Button>
        </Box>
      )}

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete {resourceType}/{id}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

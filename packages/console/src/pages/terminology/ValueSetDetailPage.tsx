import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useClient } from '../../context/AuthContext.js';
import { useSnackbar } from '../../context/SnackbarContext.js';
import JsonEditor from '../../components/JsonEditor.js';
import type { FhirResource } from '@medxai/fhir-client';

interface ExpandConcept {
  system?: string;
  code?: string;
  display?: string;
}

export default function ValueSetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = useClient();
  const { showError } = useSnackbar();

  const [resource, setResource] = useState<FhirResource | null>(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // expansion state
  const [expandConcepts, setExpandConcepts] = useState<ExpandConcept[]>([]);
  const [expandFilter, setExpandFilter] = useState('');
  const [displayLang, setDisplayLang] = useState('en');
  const [expanding, setExpanding] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await client.readResource('ValueSet', id);
        setResource(r);
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Failed to load ValueSet');
      } finally {
        setLoading(false);
      }
    })();
  }, [client, id, showError]);

  const handleExpand = useCallback(async () => {
    if (!id) return;
    setExpanding(true);
    try {
      const result = await client.expandValueSet({
        id,
        filter: expandFilter || undefined,
        displayLanguage: displayLang,
        count: 200,
      });
      const rc = result as Record<string, any>;
      setExpandConcepts(rc.expansion?.contains ?? []);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Expansion failed');
    } finally {
      setExpanding(false);
    }
  }, [client, id, expandFilter, displayLang, showError]);

  useEffect(() => {
    if (tab === 0 && resource) handleExpand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, resource]);

  if (loading) return <Typography>Loading...</Typography>;
  if (!resource) return <Typography color="error">ValueSet not found</Typography>;

  const rc = resource as Record<string, any>;
  const includes = rc.compose?.include ?? [];

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate('/terminology/valuesets'); }}>
          ValueSets
        </Link>
        <Typography color="text.primary">{rc.name ?? id}</Typography>
      </Breadcrumbs>

      <Typography variant="h5" sx={{ mb: 1 }}>{rc.name}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{rc.url}</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Chip label={rc.status} size="small" />
        {rc.version && <Chip label={`v${rc.version}`} size="small" variant="outlined" />}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Expansion" />
          <Tab label="Compose" />
          <Tab label="JSON" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Filter"
              size="small"
              value={expandFilter}
              onChange={(e) => setExpandFilter(e.target.value)}
              sx={{ width: 200 }}
            />
            <ToggleButtonGroup value={displayLang} exclusive onChange={(_, v) => { if (v) setDisplayLang(v); }} size="small">
              <ToggleButton value="en">EN</ToggleButton>
              <ToggleButton value="zh-CN">ZH</ToggleButton>
            </ToggleButtonGroup>
            <Button variant="outlined" size="small" onClick={handleExpand} disabled={expanding}>
              {expanding ? 'Expanding...' : 'Expand'}
            </Button>
            <Chip label={`${expandConcepts.length} concepts`} size="small" variant="outlined" />
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>System</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Display</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expandConcepts.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ fontSize: 12 }}>{c.system}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{c.code}</TableCell>
                    <TableCell>{c.display ?? '—'}</TableCell>
                  </TableRow>
                ))}
                {expandConcepts.length === 0 && (
                  <TableRow><TableCell colSpan={3} align="center"><Typography color="text.secondary">No concepts (try expanding)</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>compose.include</Typography>
          {includes.map((inc: Record<string, any>, i: number) => (
            <Paper key={i} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="body2"><strong>system:</strong> {inc.system ?? '—'}</Typography>
              {inc.concept && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">{inc.concept.length} concepts</Typography>
                </Box>
              )}
              {inc.filter && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">Filters: {JSON.stringify(inc.filter)}</Typography>
                </Box>
              )}
            </Paper>
          ))}
          {includes.length === 0 && <Typography color="text.secondary">No compose.include entries</Typography>}
        </Box>
      )}

      {tab === 2 && (
        <JsonEditor value={JSON.stringify(resource, null, 2)} readOnly height="500px" />
      )}
    </Box>
  );
}

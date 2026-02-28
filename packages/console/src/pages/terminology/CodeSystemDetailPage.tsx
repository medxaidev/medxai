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
import Typography from '@mui/material/Typography';
import { useClient } from '../../context/AuthContext.js';
import { useSnackbar } from '../../context/SnackbarContext.js';
import JsonEditor from '../../components/JsonEditor.js';
import type { FhirResource } from '@medxai/fhir-client';

interface Concept {
  code: string;
  display?: string;
  definition?: string;
  concept?: Concept[];
}

function flattenConcepts(concepts: Concept[] | undefined, depth = 0): Array<Concept & { depth: number }> {
  if (!concepts) return [];
  const result: Array<Concept & { depth: number }> = [];
  for (const c of concepts) {
    result.push({ ...c, depth });
    if (c.concept) result.push(...flattenConcepts(c.concept, depth + 1));
  }
  return result;
}

export default function CodeSystemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = useClient();
  const { showError } = useSnackbar();

  const [resource, setResource] = useState<FhirResource | null>(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // $lookup state
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState('');

  // $subsumes state
  const [codeA, setCodeA] = useState('');
  const [codeB, setCodeB] = useState('');
  const [subsumesResult, setSubsumesResult] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await client.readResource('CodeSystem', id);
        setResource(r);
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Failed to load CodeSystem');
      } finally {
        setLoading(false);
      }
    })();
  }, [client, id, showError]);

  const handleLookup = useCallback(async () => {
    if (!lookupCode || !id) return;
    try {
      const result = await client.lookupCode({ id, code: lookupCode });
      setLookupResult(JSON.stringify(result, null, 2));
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Lookup failed');
    }
  }, [client, id, lookupCode, showError]);

  const handleSubsumes = useCallback(async () => {
    if (!codeA || !codeB || !resource) return;
    const rc = resource as Record<string, any>;
    try {
      const resp = await client.validateResource({
        resourceType: 'Parameters',
        parameter: [
          { name: 'system', valueUri: rc.url },
          { name: 'codeA', valueCode: codeA },
          { name: 'codeB', valueCode: codeB },
        ],
      } as any);
      setSubsumesResult(JSON.stringify(resp, null, 2));
    } catch (err) {
      showError(err instanceof Error ? err.message : '$subsumes failed');
    }
  }, [client, resource, codeA, codeB, showError]);

  if (loading) return <Typography>Loading...</Typography>;
  if (!resource) return <Typography color="error">CodeSystem not found</Typography>;

  const rc = resource as Record<string, any>;
  const concepts = flattenConcepts(rc.concept);

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate('/terminology/codesystems'); }}>
          CodeSystems
        </Link>
        <Typography color="text.primary">{rc.name ?? id}</Typography>
      </Breadcrumbs>

      <Typography variant="h5" sx={{ mb: 1 }}>{rc.name}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{rc.url}</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Chip label={rc.status} size="small" />
        {rc.version && <Chip label={`v${rc.version}`} size="small" variant="outlined" />}
        <Chip label={`${concepts.length} concepts`} size="small" variant="outlined" />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Concepts" />
          <Tab label="$lookup" />
          <Tab label="$subsumes" />
          <Tab label="JSON" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Display</TableCell>
                <TableCell>Definition</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {concepts.map((c, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ fontFamily: 'monospace', pl: 2 + c.depth * 2 }}>{c.code}</TableCell>
                  <TableCell>{c.display ?? '—'}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{c.definition ?? '—'}</TableCell>
                </TableRow>
              ))}
              {concepts.length === 0 && (
                <TableRow><TableCell colSpan={3} align="center"><Typography color="text.secondary">No concepts</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <Box sx={{ maxWidth: 500 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="Code" size="small" value={lookupCode} onChange={(e) => setLookupCode(e.target.value)} />
            <Button variant="contained" onClick={handleLookup} disabled={!lookupCode}>Lookup</Button>
          </Box>
          {lookupResult && <JsonEditor value={lookupResult} readOnly height="300px" />}
        </Box>
      )}

      {tab === 2 && (
        <Box sx={{ maxWidth: 500 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="Code A" size="small" value={codeA} onChange={(e) => setCodeA(e.target.value)} />
            <TextField label="Code B" size="small" value={codeB} onChange={(e) => setCodeB(e.target.value)} />
            <Button variant="contained" onClick={handleSubsumes} disabled={!codeA || !codeB}>Check</Button>
          </Box>
          {subsumesResult && <JsonEditor value={subsumesResult} readOnly height="300px" />}
        </Box>
      )}

      {tab === 3 && (
        <JsonEditor value={JSON.stringify(resource, null, 2)} readOnly height="500px" />
      )}
    </Box>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
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
import Typography from '@mui/material/Typography';
import { useClient } from '../../context/AuthContext.js';
import { useSnackbar } from '../../context/SnackbarContext.js';
import JsonEditor from '../../components/JsonEditor.js';
import type { FhirResource } from '@medxai/fhir-client';

interface ElementDef {
  path?: string;
  short?: string;
  min?: number;
  max?: string;
  type?: Array<{ code?: string }>;
  binding?: { strength?: string; valueSet?: string };
}

function ElementTable({ elements }: { elements: ElementDef[] }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Path</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Card.</TableCell>
            <TableCell>Short</TableCell>
            <TableCell>Binding</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {elements.map((el, i) => {
            const depth = (el.path?.split('.').length ?? 1) - 1;
            return (
              <TableRow key={i}>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 12, pl: 1 + depth * 1.5 }}>
                  {el.path}
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>
                  {el.type?.map((t) => t.code).join(' | ') ?? '—'}
                </TableCell>
                <TableCell>
                  {el.min !== undefined ? `${el.min}..${el.max ?? '*'}` : '—'}
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>{el.short ?? ''}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>
                  {el.binding ? (
                    <Chip label={el.binding.strength ?? '?'} size="small" variant="outlined" />
                  ) : ''}
                </TableCell>
              </TableRow>
            );
          })}
          {elements.length === 0 && (
            <TableRow><TableCell colSpan={5} align="center"><Typography color="text.secondary">No elements</Typography></TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = useClient();
  const { showError } = useSnackbar();

  const [resource, setResource] = useState<FhirResource | null>(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await client.readResource('StructureDefinition', id);
        setResource(r);
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [client, id, showError]);

  if (loading) return <Typography>Loading...</Typography>;
  if (!resource) return <Typography color="error">Profile not found</Typography>;

  const rc = resource as Record<string, any>;
  const snapshotElements: ElementDef[] = rc.snapshot?.element ?? [];
  const differentialElements: ElementDef[] = rc.differential?.element ?? [];

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate('/profiles'); }}>
          Profiles
        </Link>
        <Typography color="text.primary">{rc.name ?? id}</Typography>
      </Breadcrumbs>

      <Typography variant="h5" sx={{ mb: 1 }}>{rc.name}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{rc.url}</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Chip label={rc.kind} size="small" />
        <Chip label={rc.type} size="small" variant="outlined" />
        <Chip label={rc.status} size="small" variant="outlined" />
        {rc.version && <Chip label={`v${rc.version}`} size="small" variant="outlined" />}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Snapshot (${snapshotElements.length})`} />
          <Tab label={`Differential (${differentialElements.length})`} />
          <Tab label="JSON" />
        </Tabs>
      </Box>

      {tab === 0 && <ElementTable elements={snapshotElements} />}
      {tab === 1 && <ElementTable elements={differentialElements} />}
      {tab === 2 && <JsonEditor value={JSON.stringify(resource, null, 2)} readOnly height="500px" />}
    </Box>
  );
}

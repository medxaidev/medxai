import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import { useClient } from '../../context/AuthContext.js';
import { useSnackbar } from '../../context/SnackbarContext.js';
import type { Bundle, FhirResource } from '@medxai/fhir-client';

const COMMON_TYPES = [
  'Patient', 'Practitioner', 'Organization', 'Encounter', 'Observation',
  'Condition', 'MedicationRequest', 'DiagnosticReport', 'Procedure',
  'AllergyIntolerance', 'Immunization', 'ServiceRequest', 'CarePlan',
  'CodeSystem', 'ValueSet', 'StructureDefinition', 'AuditEvent',
  'Project', 'User', 'ProjectMembership', 'ClientApplication',
];

export default function ResourceListPage() {
  const { resourceType: paramType } = useParams<{ resourceType: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const client = useClient();
  const { showError } = useSnackbar();

  const resourceType = paramType || 'Patient';
  const page = parseInt(searchParams.get('_page') || '0', 10);
  const rowsPerPage = parseInt(searchParams.get('_count') || '20', 10);
  const searchFilter = searchParams.get('_filter') || '';

  const [resources, setResources] = useState<FhirResource[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        _count: String(rowsPerPage),
        _offset: String(page * rowsPerPage),
        _sort: '-_lastUpdated',
        _total: 'accurate',
      };
      if (searchFilter) {
        params._filter = searchFilter;
      }
      const bundle: Bundle = await client.search(resourceType, params);
      setResources(bundle.entry?.map((e) => e.resource!).filter(Boolean) ?? []);
      setTotal(bundle.total ?? 0);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Search failed');
      setResources([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [client, resourceType, page, rowsPerPage, searchFilter, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTypeChange = (_: unknown, value: string | null) => {
    if (value) navigate(`/${value}`);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    const sp = new URLSearchParams(searchParams);
    sp.set('_page', String(newPage));
    setSearchParams(sp);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sp = new URLSearchParams(searchParams);
    sp.set('_count', e.target.value);
    sp.set('_page', '0');
    setSearchParams(sp);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem('filterInput') as HTMLInputElement;
    const sp = new URLSearchParams(searchParams);
    if (input.value) {
      sp.set('_filter', input.value);
    } else {
      sp.delete('_filter');
    }
    sp.set('_page', '0');
    setSearchParams(sp);
  };

  const getSummary = (r: FhirResource): string => {
    const rc = r as Record<string, any>;
    if (rc.name) {
      if (Array.isArray(rc.name)) {
        const n = rc.name[0];
        return [n?.given?.join(' '), n?.family].filter(Boolean).join(' ') || JSON.stringify(n);
      }
      return String(rc.name);
    }
    if (rc.url) return String(rc.url);
    if (rc.title) return String(rc.title);
    if (rc.code?.text) return String(rc.code.text);
    return '';
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Resource Explorer</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Autocomplete
          value={resourceType}
          onChange={handleTypeChange}
          options={COMMON_TYPES}
          freeSolo
          sx={{ width: 260 }}
          renderInput={(params) => <TextField {...params} label="Resource Type" size="small" />}
          onInputChange={(_, v, reason) => {
            if (reason === 'input' && v && !COMMON_TYPES.includes(v)) return;
            if (reason === 'clear') navigate('/Patient');
          }}
        />
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
          <TextField
            name="filterInput"
            label="Search filter"
            size="small"
            defaultValue={searchFilter}
            sx={{ flex: 1 }}
            placeholder="name=Smith"
          />
          <Button type="submit" variant="outlined" size="small">Search</Button>
        </form>
        <IconButton onClick={fetchData} disabled={loading} title="Refresh">
          <RefreshIcon />
        </IconButton>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => navigate(`/${resourceType}/new`)}>
          New
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Summary</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Version</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">Loading...</TableCell>
              </TableRow>
            )}
            {!loading && resources.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No resources found</Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && resources.map((r) => (
              <TableRow
                key={r.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/${r.resourceType}/${r.id}`)}
              >
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.id?.substring(0, 8)}...</TableCell>
                <TableCell>{r.resourceType}</TableCell>
                <TableCell>{getSummary(r)}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{r.meta?.lastUpdated?.substring(0, 19)}</TableCell>
                <TableCell>{r.meta?.versionId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </TableContainer>
    </Box>
  );
}

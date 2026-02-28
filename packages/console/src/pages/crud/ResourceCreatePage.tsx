import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { useClient } from '../../context/AuthContext.js';
import { useSnackbar } from '../../context/SnackbarContext.js';
import JsonEditor from '../../components/JsonEditor.js';
import OperationOutcomeAlert from '../../components/OperationOutcomeAlert.js';

const TEMPLATES: Record<string, object> = {
  Patient: {
    resourceType: 'Patient',
    name: [{ family: 'Smith', given: ['John'] }],
    gender: 'male',
    birthDate: '1990-01-01',
  },
  Observation: {
    resourceType: 'Observation',
    status: 'final',
    code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
    valueQuantity: { value: 72, unit: 'bpm', system: 'http://unitsofmeasure.org', code: '/min' },
  },
};

function getTemplate(resourceType: string): string {
  const tmpl = TEMPLATES[resourceType] ?? { resourceType };
  return JSON.stringify(tmpl, null, 2);
}

export default function ResourceCreatePage() {
  const { resourceType } = useParams<{ resourceType: string }>();
  const navigate = useNavigate();
  const client = useClient();
  const { showSuccess, showError } = useSnackbar();
  const type = resourceType || 'Patient';

  const [json, setJson] = useState(() => getTemplate(type));
  const [outcome, setOutcome] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    setOutcome(null);
    try {
      const parsed = JSON.parse(json);
      parsed.resourceType = type;
      const created = await client.createResource(parsed);
      showSuccess(`Created ${created.resourceType}/${created.id}`);
      navigate(`/${created.resourceType}/${created.id}`);
    } catch (err: any) {
      if (err?.outcome) setOutcome(err.outcome);
      showError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const handleValidate = async () => {
    setOutcome(null);
    try {
      const parsed = JSON.parse(json);
      parsed.resourceType = type;
      const result = await client.validateResource(parsed);
      setOutcome(result);
    } catch (err: any) {
      if (err?.outcome) setOutcome(err.outcome);
      showError(err instanceof Error ? err.message : 'Validation failed');
    }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate(`/${type}`); }}>
          {type}
        </Link>
        <Typography color="text.primary">New</Typography>
      </Breadcrumbs>

      <Typography variant="h5" sx={{ mb: 2 }}>Create {type}</Typography>

      <OperationOutcomeAlert outcome={outcome} />

      <Box sx={{ mt: outcome ? 2 : 0 }}>
        <JsonEditor value={json} onChange={setJson} height="450px" />
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleCreate} disabled={creating}>
          {creating ? 'Creating...' : 'Create'}
        </Button>
        <Button variant="outlined" onClick={handleValidate}>Validate</Button>
        <Button variant="text" onClick={() => setJson(getTemplate(type))}>Reset Template</Button>
      </Box>
    </Box>
  );
}

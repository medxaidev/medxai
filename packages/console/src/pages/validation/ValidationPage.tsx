import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useClient } from '../../context/AuthContext.js';
import { useSnackbar } from '../../context/SnackbarContext.js';
import JsonEditor from '../../components/JsonEditor.js';
import OperationOutcomeAlert from '../../components/OperationOutcomeAlert.js';

const TEMPLATES: Record<string, object> = {
  Patient: {
    resourceType: 'Patient',
    name: [{ family: 'Test', given: ['Validation'] }],
    gender: 'male',
    birthDate: '1990-01-01',
  },
  Observation: {
    resourceType: 'Observation',
    status: 'final',
    code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
    valueQuantity: { value: 72, unit: 'bpm' },
  },
  Condition: {
    resourceType: 'Condition',
    clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] },
    code: { coding: [{ system: 'http://snomed.info/sct', code: '386661006', display: 'Fever' }] },
  },
};

export default function ValidationPage() {
  const client = useClient();
  const { showError } = useSnackbar();
  const [json, setJson] = useState(JSON.stringify(TEMPLATES.Patient, null, 2));
  const [selectedType, setSelectedType] = useState('Patient');
  const [outcome, setOutcome] = useState<any>(null);
  const [valid, setValid] = useState<boolean | null>(null);
  const [validating, setValidating] = useState(false);

  const handleValidate = async () => {
    setValidating(true);
    setOutcome(null);
    setValid(null);
    try {
      const parsed = JSON.parse(json);
      if (!parsed.resourceType) {
        parsed.resourceType = selectedType;
      }
      const result = await client.validateResource(parsed);
      setOutcome(result);
      const issues = (result as Record<string, any>).issue ?? [];
      const hasErrors = issues.some((i: any) => i.severity === 'error' || i.severity === 'fatal');
      setValid(!hasErrors);
    } catch (err: any) {
      if (err?.outcome) {
        setOutcome(err.outcome);
        setValid(false);
      } else {
        showError(err instanceof Error ? err.message : 'Validation failed');
      }
    } finally {
      setValidating(false);
    }
  };

  const handleTemplate = (type: string) => {
    setSelectedType(type);
    const tmpl = TEMPLATES[type] ?? { resourceType: type };
    setJson(JSON.stringify(tmpl, null, 2));
    setOutcome(null);
    setValid(null);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Validation Runner</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          select
          label="Resource Type"
          size="small"
          value={selectedType}
          onChange={(e) => handleTemplate(e.target.value)}
          sx={{ width: 200 }}
        >
          {Object.keys(TEMPLATES).map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={handleValidate} disabled={validating}>
          {validating ? 'Validating...' : 'Validate'}
        </Button>
        {valid === true && (
          <Chip icon={<CheckCircleIcon />} label="Valid" color="success" variant="outlined" />
        )}
        {valid === false && (
          <Chip label="Invalid" color="error" variant="outlined" />
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Resource JSON</Typography>
          <JsonEditor value={json} onChange={setJson} height="500px" />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Validation Result</Typography>
          {outcome ? (
            <OperationOutcomeAlert outcome={outcome} />
          ) : (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Click "Validate" to check the resource
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}

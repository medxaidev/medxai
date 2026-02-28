import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useClient } from '../../context/AuthContext.js';
import { useSnackbar } from '../../context/SnackbarContext.js';
import JsonEditor from '../../components/JsonEditor.js';
import OperationOutcomeAlert from '../../components/OperationOutcomeAlert.js';

const BATCH_TEMPLATE = JSON.stringify(
  {
    resourceType: 'Bundle',
    type: 'batch',
    entry: [
      {
        request: { method: 'POST', url: 'Patient' },
        resource: { resourceType: 'Patient', name: [{ family: 'Batch', given: ['Test'] }] },
      },
    ],
  },
  null,
  2,
);

const TRANSACTION_TEMPLATE = JSON.stringify(
  {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [
      {
        request: { method: 'POST', url: 'Patient' },
        resource: { resourceType: 'Patient', name: [{ family: 'Transaction', given: ['Test'] }] },
      },
    ],
  },
  null,
  2,
);

export default function BatchPage() {
  const client = useClient();
  const { showSuccess, showError } = useSnackbar();
  const [mode, setMode] = useState<'batch' | 'transaction'>('batch');
  const [json, setJson] = useState(BATCH_TEMPLATE);
  const [result, setResult] = useState('');
  const [outcome, setOutcome] = useState<any>(null);
  const [executing, setExecuting] = useState(false);

  const handleModeChange = (_: unknown, value: string | null) => {
    if (value === 'batch' || value === 'transaction') {
      setMode(value);
      setJson(value === 'batch' ? BATCH_TEMPLATE : TRANSACTION_TEMPLATE);
      setResult('');
      setOutcome(null);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    setResult('');
    setOutcome(null);
    try {
      const bundle = JSON.parse(json);
      if (bundle.resourceType !== 'Bundle') {
        showError('Input must be a Bundle resource');
        return;
      }
      const response = await client.executeBatch(bundle);
      setResult(JSON.stringify(response, null, 2));
      showSuccess(`${mode} executed — ${response.entry?.length ?? 0} entries`);
    } catch (err: any) {
      if (err?.outcome) setOutcome(err.outcome);
      showError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Batch / Transaction</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <ToggleButtonGroup value={mode} exclusive onChange={handleModeChange} size="small">
          <ToggleButton value="batch">Batch</ToggleButton>
          <ToggleButton value="transaction">Transaction</ToggleButton>
        </ToggleButtonGroup>
        <Button variant="contained" onClick={handleExecute} disabled={executing}>
          {executing ? 'Executing...' : 'Execute'}
        </Button>
      </Box>

      <Typography variant="subtitle2" sx={{ mb: 1 }}>Input Bundle</Typography>
      <JsonEditor value={json} onChange={setJson} height="300px" />

      <OperationOutcomeAlert outcome={outcome} />

      {result && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Response</Typography>
          <JsonEditor value={result} readOnly height="300px" />
        </Box>
      )}
    </Box>
  );
}

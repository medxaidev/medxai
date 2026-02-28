import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';

interface Issue {
  severity: string;
  code: string;
  diagnostics?: string;
}

interface OperationOutcomeAlertProps {
  outcome: { issue?: Issue[] } | null | undefined;
}

function severityToColor(sev: string): 'error' | 'warning' | 'info' | 'success' {
  switch (sev) {
    case 'fatal':
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'information':
      return 'success';
    default:
      return 'info';
  }
}

export default function OperationOutcomeAlert({ outcome }: OperationOutcomeAlertProps) {
  if (!outcome?.issue?.length) return null;

  return (
    <Stack spacing={1}>
      {outcome.issue.map((issue, i) => (
        <Alert key={i} severity={severityToColor(issue.severity)}>
          <AlertTitle>{issue.severity} — {issue.code}</AlertTitle>
          {issue.diagnostics}
        </Alert>
      ))}
    </Stack>
  );
}

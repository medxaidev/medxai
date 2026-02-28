import { useCallback } from 'react';
import Editor from '@monaco-editor/react';
import Box from '@mui/material/Box';

interface JsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string | number;
}

export default function JsonEditor({ value, onChange, readOnly = false, height = '400px' }: JsonEditorProps) {
  const handleChange = useCallback(
    (v: string | undefined) => {
      if (onChange && v !== undefined) onChange(v);
    },
    [onChange],
  );

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      <Editor
        height={height}
        language="json"
        value={value}
        onChange={handleChange}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          formatOnPaste: true,
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </Box>
  );
}

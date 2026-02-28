import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useAuth } from '../../context/AuthContext.js';
import { useSnackbar } from '../../context/SnackbarContext.js';
import { getConfig } from '../../config.js';
import JsonEditor from '../../components/JsonEditor.js';

export default function AdminProjectPage() {
  const { project, client } = useAuth();
  const { showError } = useSnackbar();
  const navigate = useNavigate();
  const [projectDetail, setProjectDetail] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project?.id) return;
    (async () => {
      try {
        const config = getConfig();
        const token = client.getAccessToken();
        const resp = await fetch(`${config.baseUrl}/admin/projects/${project.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          setProjectDetail(await resp.json());
        } else {
          showError('Failed to load project details');
        }
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    })();
  }, [project?.id, client, showError]);

  if (loading) return <Typography>Loading project...</Typography>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Project Admin</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/admin/members')}>Members</Button>
        <Button variant="outlined" onClick={() => navigate('/admin/invite')}>Invite User</Button>
      </Box>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {projectDetail?.project?.name ?? project?.name ?? 'Project'}
          </Typography>
          <Chip label={`ID: ${project?.id}`} size="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {projectDetail?.project?.description ?? 'No description'}
          </Typography>
        </CardContent>
      </Card>

      {projectDetail && (
        <>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Raw Project Data</Typography>
          <JsonEditor value={JSON.stringify(projectDetail, null, 2)} readOnly height="400px" />
        </>
      )}
    </Box>
  );
}

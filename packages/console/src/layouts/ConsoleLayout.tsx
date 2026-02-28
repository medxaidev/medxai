import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import StorageIcon from '@mui/icons-material/Storage';
import SearchIcon from '@mui/icons-material/Search';
import AddBoxIcon from '@mui/icons-material/AddBox';
import SendIcon from '@mui/icons-material/Send';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { useAuth } from '../context/AuthContext.js';

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'FHIR Resources',
    items: [
      { label: 'Explorer', path: '/Patient', icon: <SearchIcon /> },
      { label: 'Create', path: '/Patient/new', icon: <AddBoxIcon /> },
      { label: 'Batch', path: '/batch', icon: <SendIcon /> },
    ],
  },
  {
    title: 'Terminology',
    items: [
      { label: 'CodeSystems', path: '/terminology/codesystems', icon: <CodeIcon /> },
      { label: 'ValueSets', path: '/terminology/valuesets', icon: <ListAltIcon /> },
    ],
  },
  {
    title: 'Conformance',
    items: [
      { label: 'Profiles', path: '/profiles', icon: <AccountTreeIcon /> },
      { label: 'Validation', path: '/validation', icon: <FactCheckIcon /> },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Project', path: '/admin', icon: <GroupIcon /> },
      { label: 'Server Info', path: '/server', icon: <InfoIcon /> },
    ],
  },
];

export default function ConsoleLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, project, signOut } = useAuth();

  const drawer = (
    <Box>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <StorageIcon sx={{ mr: 1 }} color="primary" />
        <Typography variant="h6" noWrap color="primary">
          MedXAI
        </Typography>
      </Toolbar>
      <Divider />
      {NAV_SECTIONS.map((section) => (
        <List
          key={section.title}
          dense
          subheader={
            <ListSubheader sx={{ lineHeight: '32px', mt: 1 }}>
              {section.title}
            </ListSubheader>
          }
        >
          {section.items.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Console
          </Typography>
          {project && (
            <Chip
              label={project.name ?? project.id}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ mr: 2, color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
            />
          )}
          {user && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user.email}
            </Typography>
          )}
          <Tooltip title="Sign Out">
            <IconButton color="inherit" onClick={signOut}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

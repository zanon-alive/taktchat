import React, { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link as RouterLink } from "react-router-dom";

const menuItems = [
  { label: "Funcionalidades", id: "features" },
  { label: "Tour", to: "/tour" },
  { label: "Planos", id: "planos" },
  { label: "FAQ", id: "faq" },
];

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: "rgba(30, 58, 138, 0.95)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 2px 20px rgba(0, 0, 0, 0.1)",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(0, 2),
    [theme.breakpoints.up("md")]: {
      padding: theme.spacing(0, 4),
    },
  },
  navButtons: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  navButton: {
    color: "#ffffff",
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.95rem",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
  ctaButton: {
    marginLeft: theme.spacing(1),
    textTransform: "none",
    fontWeight: 700,
    backgroundColor: "#25D366",
    color: "#ffffff",
    "&:hover": {
      backgroundColor: "#20BA5A",
    },
  },
  loginButton: {
    marginLeft: theme.spacing(1),
    textTransform: "none",
    fontWeight: 600,
    color: "#ffffff",
    borderColor: "rgba(255, 255, 255, 0.7)",
    "&:hover": {
      borderColor: "#ffffff",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
  logo: {
    height: 36,
    marginRight: theme.spacing(2),
    cursor: "pointer",
    [theme.breakpoints.down("sm")]: {
      height: 32,
    },
  },
  menuButton: {
    color: "#ffffff",
  },
  drawer: {
    "& .MuiDrawer-paper": {
      backgroundColor: "#1E3A8A",
      color: "#ffffff",
      minWidth: 280,
    },
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  drawerItem: {
    color: "#ffffff",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
}));

const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const LandingNav = ({ ctaTargetId = "lead-form" }) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (id) => {
    scrollToSection(id);
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        className={classes.appBar}
        sx={{ backgroundColor: scrolled ? "rgba(30, 58, 138, 0.98)" : undefined }}
      >
        <Toolbar className={classes.toolbar}>
          <Box display="flex" alignItems="center">
            <img
              src="/logo_quadrado.png"
              alt="TaktChat"
              className={classes.logo}
              onClick={() => handleNavClick("inicio")}
            />
          </Box>

          {isMobile ? (
            <IconButton
              className={classes.menuButton}
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box className={classes.navButtons}>
              {menuItems.map((item) =>
                item.to ? (
                  <Button
                    key={item.to}
                    className={classes.navButton}
                    component={RouterLink}
                    to={item.to}
                  >
                    {item.label}
                  </Button>
                ) : (
                  <Button
                    key={item.id}
                    className={classes.navButton}
                    onClick={() => handleNavClick(item.id)}
                  >
                    {item.label}
                  </Button>
                )
              )}
              <Button
                variant="outlined"
                className={classes.loginButton}
                component={RouterLink}
                to="/login"
              >
                Login
              </Button>
              <Button
                variant="contained"
                className={classes.ctaButton}
                onClick={() => handleNavClick(ctaTargetId)}
              >
                Começar
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        className={classes.drawer}
      >
        <Box className={classes.drawerHeader}>
          <img src="/logo_quadrado.png" alt="TaktChat" className={classes.logo} />
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ color: "#ffffff" }}
            aria-label="Fechar menu"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {menuItems.map((item) =>
            item.to ? (
              <ListItem
                key={item.to}
                button
                className={classes.drawerItem}
                component={RouterLink}
                to={item.to}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ) : (
              <ListItem
                key={item.id}
                button
                className={classes.drawerItem}
                onClick={() => handleNavClick(item.id)}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            )
          )}
          <ListItem
            button
            className={classes.drawerItem}
            component={RouterLink}
            to="/login"
            onClick={() => setDrawerOpen(false)}
          >
            <ListItemText primary="Login" />
          </ListItem>
          <ListItem
            button
            className={classes.drawerItem}
            onClick={() => handleNavClick(ctaTargetId)}
          >
            <ListItemText primary="Começar" />
          </ListItem>
        </List>
      </Drawer>

      <Toolbar />
    </>
  );
};

export default LandingNav;

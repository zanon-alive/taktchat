import React, { useState } from "react";
import {
  makeStyles,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Grid,
} from "@material-ui/core";
import {
  ExpandMore as ExpandMoreIcon,
  EmojiObjects as AIIcon,
  AccountTree as FlowIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  Description as DocIcon,
} from "@material-ui/icons";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { Link } from "react-router-dom";

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  tabsContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  tabContent: {
    flex: 1,
    overflow: 'auto',
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
  },
  sectionCard: {
    marginBottom: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
  },
  stepCard: {
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.primary.light}`,
  },
  exampleCard: {
    backgroundColor: theme.palette.grey[50],
    border: `1px solid ${theme.palette.grey[300]}`,
    marginTop: theme.spacing(2),
  },
  codeBlock: {
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    overflow: 'auto',
    margin: theme.spacing(1, 0),
  },
  infoBox: {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  tagChip: {
    margin: theme.spacing(0.5),
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
  },
  stepNumber: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    marginRight: theme.spacing(2),
  },
  flowDiagram: {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    textAlign: 'center',
    margin: theme.spacing(2, 0),
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-tutorial-tabpanel-${index}`}
      aria-labelledby={`ai-tutorial-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const AITutorial = () => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderAutomaticAITab = () => (
    <div className={classes.tabContent}>
      <Card className={classes.sectionCard}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            <AIIcon style={{ marginRight: 8, verticalAlign: 'middle' }} />
            IA Automática por Conexão
          </Typography>
          <Typography variant="body1" paragraph>
            A IA Automática é ativada automaticamente quando uma mensagem chega em uma conexão WhatsApp 
            que possui um prompt configurado, antes de ser direcionada para qualquer fila ou atendente.
          </Typography>
          <div className={classes.infoBox}>
            <Typography variant="body2">
              <InfoIcon style={{ marginRight: 8, verticalAlign: 'middle' }} />
              <strong>Ideal para:</strong> Triagem inicial, respostas automáticas, qualificação de leads, 
              atendimento 24/7 antes do horário comercial.
            </Typography>
          </div>
        </CardContent>
      </Card>

      <Card className={classes.sectionCard}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Como Funciona</Typography>
          <div className={classes.flowDiagram}>
            <Typography variant="body1">
              📱 <strong>Mensagem Chega</strong> → 🤖 <strong>IA Responde</strong> → 👤 <strong>Transfere para Fila</strong>
            </Typography>
          </div>
        </CardContent>
      </Card>

      <Card className={classes.sectionCard}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Configuração Passo a Passo</Typography>
          
          <Card className={classes.stepCard}>
            <CardContent>
              <Box display="flex" alignItems="center" marginBottom={2}>
                <div className={classes.stepNumber}>1</div>
                <Typography variant="h6">Configurar Integração IA</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Primeiro, configure uma integração OpenAI ou Gemini em <strong>Integrações → Queue Integration</strong>
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><SettingsIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Acesse o menu Integrações" 
                    secondary="Configure API Key, modelo, temperatura e tokens"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Teste a conexão" 
                    secondary="Verifique se a API Key está funcionando"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card className={classes.stepCard}>
            <CardContent>
              <Box display="flex" alignItems="center" marginBottom={2}>
                <div className={classes.stepNumber}>2</div>
                <Typography variant="h6">Criar Prompt</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Vá em <strong>IA → Prompts</strong> e crie um novo prompt
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><DocIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Nome do Prompt" 
                    secondary="Ex: 'Atendimento Inicial - Vendas'"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><AIIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Selecione a Integração" 
                    secondary="Escolha a integração OpenAI/Gemini configurada"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card className={classes.stepCard}>
            <CardContent>
              <Box display="flex" alignItems="center" marginBottom={2}>
                <div className={classes.stepNumber}>3</div>
                <Typography variant="h6">Associar à Conexão</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Edite sua conexão WhatsApp e associe o prompt criado
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><SettingsIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Conexões → Editar WhatsApp" 
                    secondary="Selecione o prompt no campo 'Prompt IA'"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card className={classes.sectionCard}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Exemplo Prático</Typography>
          <Card className={classes.exampleCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Cenário: Loja de Roupas</Typography>
              <div className={classes.codeBlock}>
                {`Olá {{nome}}! 👋 Sou a assistente virtual da {{name_company}}.

Estou aqui para te ajudar com:
• Informações sobre produtos
• Consulta de preços
• Agendamento de atendimento

Como posso te ajudar hoje?

Se precisar de atendimento personalizado, digite "ATENDENTE".`}
              </div>
              <Box>
                <Chip className={classes.tagChip} label="{{nome}}" size="small" />
                <Chip className={classes.tagChip} label="{{name_company}}" size="small" />
              </Box>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );

  const renderFlowBuilderAITab = () => (
    <div className={classes.tabContent}>
      <Card className={classes.sectionCard}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            <FlowIcon style={{ marginRight: 8, verticalAlign: 'middle' }} />
            IA no FlowBuilder
          </Typography>
          <Typography variant="body1" paragraph>
            A IA no FlowBuilder permite inserir ações de inteligência artificial em pontos específicos 
            do seu fluxo de atendimento, oferecendo controle granular sobre quando e como a IA é acionada.
          </Typography>
        </CardContent>
      </Card>

      <Card className={classes.sectionCard}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Casos de Uso Práticos</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card className={classes.exampleCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>1. Classificação de Intenção</Typography>
                  <div className={classes.codeBlock}>
                {`Analise a mensagem e classifique:

Mensagem: "{{ultima_mensagem}}"

Responda apenas:
- VENDAS
- SUPORTE  
- CANCELAMENTO

Classificação:`}
              </div>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card className={classes.exampleCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>2. Análise de Sentimento</Typography>
                  <div className={classes.codeBlock}>
{`Analise o sentimento:

"{{ultima_mensagem}}"

Responda apenas:
- POSITIVO
- NEUTRO  
- NEGATIVO
- URGENTE`}
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card className={classes.sectionCard}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Dicas Avançadas</Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Fluxos Condicionais com IA</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                Use a resposta da IA para criar ramificações no fluxo baseadas na análise inteligente.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Otimização de Prompts</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                Seja específico nas instruções e formate a saída esperada para melhores resultados.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={classes.root}>
      <MainContainer>
        <MainHeader>
          <Title>
            <span>
              <Link to="/helps" style={{ textDecoration: 'none', color: 'inherit', opacity: 0.8 }}>
                Central de Ajuda
              </Link>
              <span style={{ margin: '0 8px', opacity: 0.6 }}>{'>'}</span>
              <strong>Manual de IA</strong>
            </span>
          </Title>
          <MainHeaderButtonsWrapper />
        </MainHeader>
        <div className={classes.content}>
          <Paper className={classes.tabsContainer}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="IA Automática" icon={<AIIcon />} />
              <Tab label="IA no FlowBuilder" icon={<FlowIcon />} />
            </Tabs>
          </Paper>
          
          <TabPanel value={tabValue} index={0}>
            {renderAutomaticAITab()}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {renderFlowBuilderAITab()}
          </TabPanel>
        </div>
      </MainContainer>
    </div>
  );
};

export default AITutorial;

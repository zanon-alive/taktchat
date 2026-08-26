import React, { useState, useEffect, Suspense } from "react";
import { makeStyles } from "@mui/styles";
import { Container, Box, CircularProgress } from "@mui/material";
import { Helmet } from "react-helmet";
import api from "../../services/api";
import LandingNav from "./components/LandingNav";
import Hero from "./components/Hero";

const ProductGallery = React.lazy(() => import("./components/ProductGallery"));
const ValueProposition = React.lazy(() => import("../LandingPageV1/components/ValueProposition"));
const Problems = React.lazy(() => import("../LandingPageV1/components/Problems"));
const Features = React.lazy(() => import("../LandingPageV1/components/Features"));
const Plans = React.lazy(() => import("../landing-shared/Plans"));
const SignupForm = React.lazy(() => import("../landing-shared/SignupForm"));
const LeadForm = React.lazy(() => import("../landing-shared/LeadForm"));
const FAQ = React.lazy(() => import("../landing-shared/FAQ"));
const Footer = React.lazy(() => import("./components/Footer"));
const ChatWidget = React.lazy(() => import("../landing-shared/ChatWidget"));
const SiteChatWidget = React.lazy(() => import("../landing-shared/SiteChatWidget"));
const CookieBanner = React.lazy(() => import("../landing-shared/CookieBanner"));

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    overflowX: "hidden",
  },
  section: {
    padding: theme.spacing(10, 0),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(6, 0),
    },
  },
  sectionDark: {
    backgroundColor: "#f8f9fa",
  },
  sectionPrimary: {
    background: "linear-gradient(135deg, #065183 0%, #0a7ab8 100%)",
    color: "#ffffff",
  },
  lazyFallback: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(8, 0),
  },
}));

const fallbackPlans = [
  {
    id: 1,
    name: "Básico",
    amount: "99.00",
    users: 3,
    connections: 1,
    queues: 3,
    recurrence: "mensal",
    trial: true,
    trialDays: 14,
    useWhatsapp: true,
    useCampaigns: false,
    useKanban: false,
    useOpenAi: false,
    useSchedules: true,
    useInternalChat: true,
  },
  {
    id: 2,
    name: "Premium",
    amount: "299.00",
    users: 10,
    connections: 3,
    queues: 10,
    recurrence: "mensal",
    trial: true,
    trialDays: 14,
    useWhatsapp: true,
    useCampaigns: true,
    useKanban: true,
    useOpenAi: true,
    useSchedules: true,
    useInternalChat: true,
  },
  {
    id: 3,
    name: "Enterprise",
    amount: "799.00",
    users: 50,
    connections: 10,
    queues: 50,
    recurrence: "mensal",
    trial: true,
    trialDays: 30,
    useWhatsapp: true,
    useCampaigns: true,
    useKanban: true,
    useOpenAi: true,
    useSchedules: true,
    useInternalChat: true,
    useExternalApi: true,
    useIntegrations: true,
  },
];

const LandingPage = () => {
  const classes = useStyles();
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [signupEnabled, setSignupEnabled] = useState(false);
  const ctaTargetId = signupEnabled ? "cadastro" : "lead-form";

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await api.get("/plans/list", {
          params: { listPublic: "false" },
        });
        if (response.data && Array.isArray(response.data)) {
          const onlyDirect = response.data.filter(
            (plan) => plan.isPublic !== false && (plan.targetType == null || plan.targetType === "direct")
          );
          setPlans(onlyDirect.length > 0 ? onlyDirect : response.data);
        } else if (response.data?.plans) {
          const onlyDirect = response.data.plans.filter(
            (plan) => plan.targetType == null || plan.targetType === "direct"
          );
          setPlans(onlyDirect);
        }
      } catch (error) {
        setPlans(fallbackPlans);
      } finally {
        setLoadingPlans(false);
      }
    };
    loadPlans();
  }, []);

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) {
      return undefined;
    }
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(id);
      tries += 1;
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        clearInterval(timer);
      } else if (tries > 30) {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TaktChat",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers:
      plans.length > 0
        ? plans.map((plan) => ({
            "@type": "Offer",
            name: plan.name,
            price: parseFloat(plan.amount || 0).toFixed(2),
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
            url: "https://taktchat.com.br/landing",
          }))
        : [
            {
              "@type": "Offer",
              price: "99.00",
              priceCurrency: "BRL",
            },
          ],
    description:
      "Plataforma de atendimento e automação para WhatsApp. Centralize conversas, crie fluxos e gerencie equipes.",
    url: "https://taktchat.com.br/landing",
    featureList: [
      "Atendimento WhatsApp Multi-usuário",
      "Chatbot com Inteligência Artificial",
      "Campanhas em Massa",
      "Kanban de Atendimento",
      "Agendamento de Mensagens",
      "Chat Interno da Equipe",
      "API para Integrações",
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TaktChat",
    url: "https://taktchat.com.br",
    logo: "https://taktchat.com.br/logo.png",
    description: "Plataforma de atendimento e automação para WhatsApp",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+55-14-99687-0843",
      contactType: "customer service",
      areaServed: "BR",
      availableLanguage: ["Portuguese"],
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "O que é o TaktChat?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "O TaktChat é uma plataforma de gestão de atendimento para WhatsApp. Com ele, você centraliza atendentes em um número, cria fluxos, automatiza respostas e acompanha as conversas da empresa.",
        },
      },
      {
        "@type": "Question",
        name: "Preciso manter o celular conectado?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Não. Depois de conectar via QR Code, a plataforma mantém a sessão na nuvem.",
        },
      },
      {
        "@type": "Question",
        name: "Posso usar meu número atual?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim. Você pode utilizar o número atual de WhatsApp. A conexão é feita pela leitura de um QR Code.",
        },
      },
      {
        "@type": "Question",
        name: "Existe fidelidade ou multa de cancelamento?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Não. Os planos são pré-pagos e sem fidelidade. Você pode cancelar a qualquer momento.",
        },
      },
    ],
  };

  return (
    <>
      <Helmet>
        <html lang="pt-BR" />
        <title>TaktChat — Atendimento no WhatsApp para equipes</title>
        <meta
          name="title"
          content="TaktChat — Atendimento no WhatsApp para equipes"
        />
        <meta
          name="description"
          content="Centralize o atendimento no WhatsApp, organize a equipe e automatize rotinas com o TaktChat. Veja o produto em tela real e comece pelo cadastro ou pelo formulário de contato."
        />
        <meta
          name="keywords"
          content="WhatsApp Business, atendimento WhatsApp, chatbot, TaktChat, multi-atendente, automação WhatsApp"
        />
        <meta name="author" content="TaktChat" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="language" content="Portuguese" />
        <link rel="canonical" href="https://taktchat.com.br/landing" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://taktchat.com.br/landing" />
        <meta property="og:title" content="TaktChat — Atendimento no WhatsApp para equipes" />
        <meta
          property="og:description"
          content="Centralize conversas, organize a equipe e automatize o que se repetir. Prints reais do produto."
        />
        <meta property="og:image" content="https://taktchat.com.br/landing/f3-atendente-chat-maria.png" />
        <meta property="og:site_name" content="TaktChat" />
        <meta property="og:locale" content="pt_BR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://taktchat.com.br/landing" />
        <meta name="twitter:title" content="TaktChat — Atendimento no WhatsApp para equipes" />
        <meta
          name="twitter:description"
          content="Centralize conversas, organize a equipe e automatize o que se repetir."
        />
        <meta name="twitter:image" content="https://taktchat.com.br/landing/f3-atendente-chat-maria.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#065183" />
        <script type="application/ld+json">{JSON.stringify(softwareApplicationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className={classes.root}>
        <LandingNav ctaTargetId={ctaTargetId} />
        <Hero ctaTargetId={ctaTargetId} />

        <Suspense
          fallback={
            <Box className={classes.lazyFallback}>
              <CircularProgress />
            </Box>
          }
        >
          <ProductGallery />

          <Box id="proposta-valor" className={classes.section}>
            <Container>
              <ValueProposition showSocialProof={false} showCta={false} />
            </Container>
          </Box>

          <Box id="problemas" className={`${classes.section} ${classes.sectionDark}`}>
            <Container>
              <Problems showCta={false} />
            </Container>
          </Box>

          <Box id="features" className={classes.section}>
            <Container>
              <Features ctaAnchorId={ctaTargetId} showCta={false} hideUptimeClaim />
            </Container>
          </Box>

          <Box id="planos" className={`${classes.section} ${classes.sectionDark}`}>
            <Container>
              <Plans
                plans={plans}
                loading={loadingPlans}
                ctaAnchorId={ctaTargetId}
                signupEnabled={signupEnabled}
              />
            </Container>
          </Box>

          <Box
            id="cadastro"
            className={signupEnabled ? `${classes.section} ${classes.sectionPrimary}` : undefined}
          >
            <Container>
              <SignupForm onEnabledChange={setSignupEnabled} />
            </Container>
          </Box>

          <Box id="lead-form-section" className={`${classes.section} ${classes.sectionPrimary}`}>
            <Container>
              <LeadForm />
            </Container>
          </Box>

          <Box id="faq" className={`${classes.section} ${classes.sectionDark}`}>
            <FAQ />
          </Box>

          <Footer />
          <SiteChatWidget />
          <ChatWidget />
          <CookieBanner />
        </Suspense>
      </div>
    </>
  );
};

export default LandingPage;

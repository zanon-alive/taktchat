# Configuração da Validação WhatsApp Assíncrona

## ✅ Configurações Aplicadas

### **Desenvolvimento (.env)**
```env
# Configurações de validação WhatsApp assíncrona
CONTACT_FILTER_ASYNC_VALIDATION=true
CONTACT_VALIDATION_BATCH_SIZE=50
CONTACT_FILTER_DIRECT_SQL=true
CONTACT_FILTER_VALIDATE_WHATSAPP=false
CONTACT_FILTER_INSERT_CHUNK_SIZE=5000
```

### **Produção (stack.portainer.yml)**
```yaml
environment:
  # Configurações de validação WhatsApp assíncrona
  CONTACT_FILTER_ASYNC_VALIDATION: "true"
  CONTACT_VALIDATION_BATCH_SIZE: "50"
  CONTACT_FILTER_DIRECT_SQL: "true"
  CONTACT_FILTER_VALIDATE_WHATSAPP: "false"
  CONTACT_FILTER_INSERT_CHUNK_SIZE: "5000"
```

### **Desenvolvimento (docker-compose.yml)**
```yaml
environment:
  # Configurações de validação WhatsApp assíncrona
  CONTACT_FILTER_ASYNC_VALIDATION: "true"
  CONTACT_VALIDATION_BATCH_SIZE: "50"
  CONTACT_FILTER_DIRECT_SQL: "true"
  CONTACT_FILTER_VALIDATE_WHATSAPP: "false"
  CONTACT_FILTER_INSERT_CHUNK_SIZE: "5000"
```

## 📋 Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|---------|-----------|
| `CONTACT_FILTER_ASYNC_VALIDATION` | `true` | Habilita validação WhatsApp em background |
| `CONTACT_VALIDATION_BATCH_SIZE` | `50` | Quantos contatos validar por lote |
| `CONTACT_FILTER_DIRECT_SQL` | `true` | Usa INSERT SELECT direto (mais rápido) |
| `CONTACT_FILTER_VALIDATE_WHATSAPP` | `false` | Valida WhatsApp no ato (mais lento) |
| `CONTACT_FILTER_INSERT_CHUNK_SIZE` | `5000` | Tamanho do chunk para bulkCreate |

## 🚀 Deploy em Produção (Portainer)

### **1. Atualizar Stack no Portainer**
- Copie o conteúdo do `frontend/stack.portainer.yml` atualizado
- Cole na stack do Portainer
- Clique em "Update the stack"

### **2. Verificar Logs**
Após deploy, verifique se aparecem nos logs:
```
INFO: Job de validação WhatsApp agendado para lista X
INFO: [ValidateWhatsappContacts] *** JOB INICIADO ***
INFO: [ValidateWhatsappContacts] Validando X contatos da lista Y
```

### **3. Monitoramento**
- **Redis**: Verifique se está rodando (`redis://redis:6379/0`)
- **Queue**: Jobs aparecem no Bull Dashboard (se configurado)
- **Logs**: Acompanhe validações em tempo real

## 🔧 Como Funciona

1. **Inserção Rápida**: Contatos são inseridos via SQL direto
2. **Job Assíncrono**: 10 segundos após inserção, inicia validação
3. **Lotes**: Processa 50 contatos por vez com delay de 100ms
4. **Auto-reagendamento**: Continua até validar todos
5. **Atualização**: Marca `isWhatsappValid` e `validatedAt`

## 🐛 Troubleshooting

### **Job não executa:**
- Verificar Redis conectado
- Verificar variável `CONTACT_FILTER_ASYNC_VALIDATION=true`

### **Validação falha:**
- Verificar WhatsApp conectado
- Verificar service `CheckContactNumber`

### **Performance:**
- Ajustar `CONTACT_VALIDATION_BATCH_SIZE` (menor = mais lento, mais seguro)
- Ajustar delay entre contatos no job (padrão 100ms)

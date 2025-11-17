# Testes Automatizados - Verificações de Socket

Este diretório contém os testes automatizados para as verificações de socket implementadas no projeto.

## Estrutura

```
__tests__/
├── setup/
│   ├── socketMocks.js      # Utilitários para mock de socket
│   └── testSetup.js        # Configuração global dos testes
├── components/
│   ├── Ticket.test.js      # Testes do componente Ticket
│   └── TicketsListCustom.test.js  # Testes do componente TicketsListCustom
├── hooks/
│   └── useUserMoments.test.js  # Testes do hook useUserMoments
├── utils/
│   └── socketValidation.test.js  # Testes dos padrões de validação
└── README.md              # Este arquivo
```

## Como Executar

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch
```bash
npm test -- --watch
```

### Executar testes com cobertura
```bash
npm test -- --coverage
```

### Executar um arquivo específico
```bash
npm test -- Ticket.test.js
```

## O que é testado

### 1. Verificações de Socket Básicas
- ✅ Socket null/undefined não deve quebrar
- ✅ Socket sem método `on` não deve quebrar
- ✅ Socket objeto vazio não deve quebrar
- ✅ Socket válido deve registrar listeners

### 2. Verificações de Cleanup
- ✅ `socket.off` deve ser chamado no cleanup
- ✅ Cleanup não deve quebrar quando `socket.off` não é função
- ✅ Cleanup deve verificar se socket existe antes de usar

### 3. Verificações de Emit
- ✅ `socket.emit` deve verificar se é função antes de chamar
- ✅ Emit não deve quebrar quando não é função

### 4. Verificações de User
- ✅ Não deve registrar listeners quando `user.companyId` não existe
- ✅ Não deve registrar listeners quando `user.id` não existe

## Utilitários de Mock

### createMockSocket(options)
Cria um mock de socket válido para testes.

```javascript
const { mockSocket } = createMockSocket({
  connected: true,
  id: 'test-id',
});
```

### createInvalidSocket()
Cria um socket inválido (sem método `on`).

### createEmptySocket()
Cria um socket vazio (objeto vazio).

### createMockUser(overrides)
Cria um mock de usuário.

```javascript
const user = createMockUser({
  id: 1,
  companyId: 1,
});
```

## Padrões de Teste

Todos os testes seguem o padrão:

1. **Arrange**: Configurar mocks e dados de teste
2. **Act**: Renderizar componente ou executar hook
3. **Assert**: Verificar que as verificações funcionam corretamente

## Exemplo de Teste

```javascript
test('não deve chamar socket.on quando socket é null', () => {
  const { mockSocket } = createMockSocket();
  
  renderWithProviders(<Component />, {
    socket: null,
  });

  expect(mockSocket.on).not.toHaveBeenCalled();
});
```

## Cobertura Esperada

Os testes cobrem:
- ✅ Todos os casos de socket inválido
- ✅ Todos os casos de cleanup
- ✅ Verificações de user.companyId
- ✅ Verificações de socket.emit
- ✅ Verificações de socket.off

## Manutenção

Ao adicionar novas verificações de socket:
1. Adicione testes correspondentes
2. Use os utilitários de mock existentes
3. Siga os padrões estabelecidos
4. Atualize este README se necessário


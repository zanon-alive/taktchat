export default {
  formId: 'checkoutForm',
  formField: {
    firstName: {
      name: 'firstName',
      label: 'Nome completo*',
      requiredErrorMsg: 'O nome completo é obrigatório'
    },
    lastName: {
      name: 'lastName',
      label: 'Sobrenome*',
      requiredErrorMsg: 'O sobrenome é obrigatório'
    },
    address1: {
      name: 'address2',
      label: 'Endereço*',
      requiredErrorMsg: 'O Endereço é obrigatório'
    },

    city: {
      name: 'city',
      label: 'Cidade*',
      requiredErrorMsg: 'Cidade é obrigatória'
    },
    state: {
      name: 'state',
      label: 'Estado*',
      requiredErrorMsg: 'Cidade é obrigatória'
    },
    zipcode: {
      name: 'zipcode',
      label: 'CPF/CNPJ*',
      requiredErrorMsg: 'CEP é obrigatório',
      invalidErrorMsg: 'Formato de CEP inválido'
    },
    country: {
      name: 'country',
      label: 'País*',
      requiredErrorMsg: 'País é obrigatório'
    },
    useAddressForPaymentDetails: {
      name: 'useAddressForPaymentDetails',
      label: 'Usar este endereço para detalhes de pagamento'
    },
    nameOnCard: {
      name: 'nameOnCard',
      label: 'Nome no cartão*',
      requiredErrorMsg: 'O nome no cartão é obrigatório'
    },
    cardNumber: {
      name: 'cardNumber',
      label: 'Número do cartão*',
      requiredErrorMsg: 'O número do cartão é obrigatório',
      invalidErrorMsg: 'Número do cartão inválido (ex: 4111111111111)'
    },
    expiryDate: {
      name: 'expiryDate',
      label: 'Data de validade*',
      requiredErrorMsg: 'A data de validade é obrigatória',
      invalidErrorMsg: 'Data de validade inválida'
    },
    cvv: {
      name: 'cvv',
      label: 'CVV*',
      requiredErrorMsg: 'O CVV é obrigatório',
      invalidErrorMsg: 'CVV inválido (ex: 357)'
    }
  }
};

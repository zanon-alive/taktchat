/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Otimizações para reduzir o tamanho do CSS gerado
  corePlugins: {
    // Mantém apenas os plugins essenciais, desabilita os não utilizados
  },
  // Remove classes não utilizadas em produção
  safelist: [], // Adicione aqui classes dinâmicas que não podem ser detectadas
}

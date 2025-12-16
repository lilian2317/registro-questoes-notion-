export const DB = {
  TRT: process.env.DB_TRT_ID,
  TRE: process.env.DB_TRE_ID,
  PGE: process.env.DB_PGE_ID,
};

// Mapeamento de propriedades por base.
// Ajuste aqui se seus nomes no Notion estiverem diferentes.
export const SCHEMA = {
  TRT: {
    title: "Assunto",
    percent: "porcentagem(1)",
    lastDate: "Última Revisão",
  },
  TRE: {
    title: "Assunto",
    // Se não existir nessa base, troque para null
    percent: "porcentagem(1)",
    lastDate: "Revisão (data do 1 estudo)",
  },
  PGE: {
    title: "Assunto",
    // Colunas de revisão (na ordem) onde o app deve escrever a % automaticamente.
    // O seu CSV mostra que existe 1°..10° (com variações de maiúsculas).
    revisionCols: [
      "1° revisão",
      "2° revisão",
      "3° revisão",
      "4° revisão",
      "5° revisão",
      "6° revisão",
      "7° Revisão",
      "8° Revisão",
      "9° Revisão",
      "10° Revisão",
    ],
    lastDate: "Revisão (data do 1 estudo)",
  },
};

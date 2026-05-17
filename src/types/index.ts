export type VendaTipo = 'caixa' | 'unidade' | 'peso';

export interface Produto {
  id: string;
  nome: string;
  icon: string;
  precoCusto: number;
  precoVenda: number;
  // Unidades/Caixa
  vendeUnidade: boolean;
  unidadesPorCaixa: number;
  precoUnitario: number;
  // Peso
  vendePeso: boolean;
  precoKilo: number;

  estoqueCaixas: number;
  estoqueUnidades: number; // avulsas
  estoquePeso: number; // em kg
  
  estoqueMinimo: number;
  categoria: string;
}

export type TipoTransacao = 'venda' | 'despesa' | 'recebimento' | 'fiado' | 'pagamento';

export interface ItemVenda {
  produtoId: string;
  nome: string;
  preco: number;
  qtd: number;
  subtotal: number;
  tipoVenda: VendaTipo;
  custoTotal: number;
  dataCompra?: string;
}

export interface Transacao {
  id: string;
  tipo: TipoTransacao;
  descricao: string;
  valor: number;
  data: string;
  categoria?: string;
  cliente?: string;
  itens?: ItemVenda[];
  custoTotal?: number;
}

export interface Fiado {
  id: string;
  cliente: string;
  telefone?: string;
  itens: ItemVenda[];
  valor: number;
  pago: number;
  status: 'pendente' | 'pago';
  data: string;
}

export interface Settings {
  saldoInicial: number;
  lastWeeklyReset: string | null;
}

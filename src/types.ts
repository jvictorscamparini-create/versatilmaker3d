export type AppView = 
  | 'landing'
  | 'dashboard'
  | 'vendas'
  | 'clientes'
  | 'fila-producao'
  | 'estoque'
  | 'maquinas'
  | 'calculadora'
  | 'calculadora-3d'
  | 'analise-mercado'
  | 'estudio-criativo'
  | 'gerador-3d'
  | 'financeiro'
  | 'integracao-shopee'
  | 'integracao-ml'
  | 'configuracoes';

export interface Printer {
  id: string;
  name: string;
  model: string;
  brand?: string;
  powerWatts: number;
  nozzleDiameter?: number;
  nozzleDiameterMm?: number;
  purchaseCost?: number;
  hourlyDepreciation?: number;
  hourlyCost?: number;
  totalHoursPrinted?: number;
  maintenanceHoursInterval?: number;
  status: 'livre' | 'imprimindo' | 'manutencao';
  currentJob?: string;
  progressPercent?: number;
  timeLeftMinutes?: number;
  nozzleTemp?: number;
  bedTemp?: number;
}

export interface Filament {
  id: string;
  name: string;
  brand: string;
  material: 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'Resina' | 'Nylon';
  color: string;
  hexColor: string;
  weightTotalGrams: number;
  weightRemainingGrams: number;
  pricePerSpool: number;
  density?: number;
  diameterMm: number;
}

export interface ProductionCard {
  id: string;
  title: string;
  productName: string;
  clientName?: string;
  orderNumber?: string;
  origin: 'Mercado Livre' | 'Shopee' | 'WhatsApp' | 'Direto';
  printerId?: string;
  filamentId?: string;
  weightGrams: number;
  printTimeHours: number;
  status: 'a_fazer' | 'imprimindo' | 'finalizado';
  priority: 'normal' | 'alta' | 'urgente';
  createdAt: string;
  dueDate?: string;
  notes?: string;
}

export interface SavedCalculation {
  id: string;
  productName: string;
  savedAt: string;
  filaments: {
    spoolPrice: number;
    spoolWeightGrams: number;
    pieceWeightGrams: number;
  }[];
  packaging: {
    boxPrice: number;
    bubbleWrapPrice: number;
    tapePrice: number;
  };
  energy: {
    timeHours: number;
    powerWatts: number;
    kwhCost: number;
  };
  salesConfig: {
    platform: 'shopee' | 'mercadolivre' | 'direto' | 'personalizado';
    shippingFixed: number;
    marketplaceCommission: number;
    taxPercent: number;
    targetMarginPercent: number;
    manualMode: boolean;
  };
  results: {
    productCost: number;
    suggestedPrice: number;
    marketplaceFees: number;
    taxes: number;
    totalCharges: number;
    netProfit: number;
    breakEvenPrice: number;
  };
}

export interface FinancialEntry {
  id: string;
  description: string;
  category: 'venda' | 'filamento' | 'embalagem' | 'energia' | 'manutencao' | 'taxa_marketplace' | 'outros';
  type: 'receita' | 'despesa';
  amount: number;
  date: string;
  platform?: 'Mercado Livre' | 'Shopee' | 'Direto' | 'Loja';
  status: 'confirmado' | 'pendente' | 'cancelado';
}

export interface MarketAnalysisItem {
  id: string;
  platform: 'Mercado Livre' | 'Shopee';
  date: string;
  userListing: {
    title: string;
    price: number;
    shipping: string;
    sales: number;
    rating: number;
    url?: string;
  };
  competitorListing: {
    title: string;
    price: number;
    shipping: string;
    sales: number;
    rating: number;
    url?: string;
  };
  result: {
    scoreUser: number;
    scoreCompetitor: number;
    priceGap: {
      difference: number;
      percentage: number;
      verdict: string;
    };
    seoComparison: {
      userKeywords: string[];
      competitorKeywords: string[];
      missingHighVolumeKeywords: string[];
    };
    logisticsAnalysis: string;
    strengthsUser: string[];
    weaknessesUser: string[];
    actionPlan: { step: string; action: string }[];
    suggestedNewTitle: string;
  };
}

export interface CreativeProject {
  id: string;
  productName: string;
  niche: string;
  differentials: string;
  scenario1: string;
  scenario2: string;
  baseImage?: string;
  createdAt: string;
  titles: string[];
  descriptions: {
    short: string;
    full: string;
    bulletPoints: string[];
    seoTags: string[];
  };
  salesConsultant: {
    pricingTip: string;
    bundleIdeas: string[];
    conversionHooks: string[];
    marketplaceTips: {
      mercadoLivre: string;
      shopee: string;
    };
  };
  mockupPrompts?: string[];
}

export interface Model3DItem {
  id: string;
  name: string;
  category: string;
  quality: 'rapido' | 'padrao' | 'ultra';
  createdAt: string;
  triangles: number;
  vertices: number;
  estimatedWeightGrams: number;
  estimatedTimeHours: number;
  previewType: 'vase' | 'cat' | 'phone_stand' | 'skull' | 'planter';
  sourceImageUrl?: string;
}

export interface OrderItem {
  id: string;
  code?: string;
  orderCode?: string;
  clientName?: string;
  customerName?: string;
  platform: 'Mercado Livre' | 'Shopee' | 'WhatsApp' | 'Direto';
  productName: string;
  quantity: number;
  unitPrice?: number;
  totalPrice: number;
  date: string;
  status: 'pendente_producao' | 'em_impressao' | 'em_producao' | 'pronto_envio' | 'enviado' | 'entregue' | 'pago' | 'processando';
  weightTotalGrams?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  notes?: string;
}

export interface CreativeAdResult {
  titles: string[];
  description: string;
  tags: string[];
  photoPrompts: string[];
}


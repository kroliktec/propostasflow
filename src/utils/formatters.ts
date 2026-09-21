import { Product, Proposal, Emissor } from '../types';

export const formatCurrency = (val: number | null | undefined): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val || 0);
};

export const formatDate = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
};

export const formatDateTime = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const maskCNPJ = (value: string): string => {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 11) {
    // CPF
    return clean
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  }
  // CNPJ
  return clean
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

export const maskPhone = (value: string): string => {
  const clean = value.replace(/\D/g, '');
  if (clean.length > 10) {
    return clean.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (clean.length > 5) {
    return clean.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (clean.length > 2) {
    return clean.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  }
  return clean;
};

export const generateWhatsAppText = (
  proposal: Proposal,
  productsMap: Map<string, Product>,
  emissor?: Emissor
): string => {
  const lines: string[] = [];

  lines.push(`*PROPOSTA COMERCIAL — ${proposal.empresa.toUpperCase()}*`);
  if (emissor) {
    lines.push(`*Emissor:* ${emissor.razao} (${emissor.cnpj})`);
  }
  lines.push(`*Data:* ${formatDate(proposal.createdAt)} | *Validade:* ${proposal.validade}`);
  if (proposal.contato) {
    lines.push(`*Aos cuidados de:* ${proposal.contato}`);
  }
  lines.push('');
  lines.push('*ESCOPO & PRODUTOS CONTRATADOS:*');

  proposal.items.forEach((item, index) => {
    const prod = productsMap.get(item.productId);
    const prodName = prod?.name || item.productId;
    const prodCode = prod?.codigo ? `[${prod.codigo}] ` : '';
    const itemSetup = (item.customSetup ?? item.setup) * item.qty;
    const itemMrr = (item.customMrr ?? item.mrr) * item.qty;

    let priceDetails = '';
    if (itemSetup > 0 && itemMrr > 0) {
      priceDetails = `Setup: ${formatCurrency(itemSetup)} + Mensal: ${formatCurrency(itemMrr)}`;
    } else if (itemSetup > 0) {
      priceDetails = `Investimento inicial: ${formatCurrency(itemSetup)}`;
    } else {
      priceDetails = `Mensal: ${formatCurrency(itemMrr)}`;
    }

    lines.push(`${index + 1}. *${prodCode}${prodName}*`);
    lines.push(`   └ Qtd: ${item.qty} un | ${priceDetails}`);
  });

  lines.push('');
  lines.push('*RESUMO DE INVESTIMENTO:*');
  if (proposal.totalSetup > 0) {
    lines.push(`• *Investimento de Implantação (Setup):* ${formatCurrency(proposal.totalSetup)}`);
  }
  lines.push(`• *Recorrência Mensal (MRR):* ${formatCurrency(proposal.totalMrr)}/mês`);

  if (proposal.consideracoes && proposal.consideracoes.trim()) {
    lines.push('');
    lines.push('*Condições Gerais:*');
    lines.push(proposal.consideracoes.trim());
  }

  lines.push('');
  lines.push('_Ficamos à disposição para esclarecimentos e alinhamento dos próximos passos._');

  return lines.join('\n');
};

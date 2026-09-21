import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit3, Building2, Mail, Phone, Search, FileText, User } from 'lucide-react';
import { Cliente, Proposal } from '../types';
import { maskCNPJ, maskPhone, generateId } from '../utils/formatters';

interface ClientsViewProps {
  clientes: Cliente[];
  proposals: Proposal[];
  onAddCliente: (cliente: Cliente) => void;
  onUpdateCliente: (cliente: Cliente) => void;
  onDeleteCliente: (id: string) => void;
  onCreateProposalForClient: (cliente: Cliente) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clientes,
  proposals,
  onAddCliente,
  onUpdateCliente,
  onDeleteCliente,
  onCreateProposalForClient,
  onNotify
}) => {
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [empresa, setEmpresa] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contato, setContato] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  const openAddModal = () => {
    setEditingClient(null);
    setEmpresa('');
    setCnpj('');
    setContato('');
    setEmail('');
    setTelefone('');
    setShowModal(true);
  };

  const openEditModal = (c: Cliente) => {
    setEditingClient(c);
    setEmpresa(c.empresa);
    setCnpj(c.cnpj);
    setContato(c.contato);
    setEmail(c.email);
    setTelefone(c.telefone || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa.trim()) {
      onNotify('O nome da empresa é obrigatório.', 'error');
      return;
    }

    if (editingClient) {
      onUpdateCliente({
        ...editingClient,
        empresa: empresa.trim(),
        cnpj: cnpj.trim(),
        contato: contato.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
      });
      onNotify('Cliente atualizado com sucesso!', 'success');
    } else {
      onAddCliente({
        id: generateId(),
        empresa: empresa.trim(),
        cnpj: cnpj.trim(),
        contato: contato.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
      });
      onNotify('Novo cliente adicionado com sucesso!', 'success');
    }

    setShowModal(false);
  };

  const filtered = clientes.filter(
    (c) =>
      c.empresa.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj.includes(search) ||
      c.contato.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Gestão de Clientes
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Cadastre clientes para preenchimento ágil durante a criação de propostas.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-[#5b0250] hover:bg-[#47013e] text-white font-bold text-xs shadow-md transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Adicionar Cliente</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente por empresa, CNPJ ou contato..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cli) => {
            const clientProposals = proposals.filter((p) => p.empresa.toLowerCase() === cli.empresa.toLowerCase());
            return (
              <div
                key={cli.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {cli.empresa}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(cli)}
                        className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        title="Editar cliente"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCliente(cli.id)}
                        className="p-1 text-zinc-400 hover:text-red-600"
                        title="Excluir cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 mt-3 text-xs text-zinc-500">
                    {cli.cnpj && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Building2 className="w-3.5 h-3.5 opacity-60" />
                        <span>{cli.cnpj}</span>
                      </div>
                    )}
                    {cli.contato && (
                      <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
                        <User className="w-3.5 h-3.5 opacity-60" />
                        <span>{cli.contato}</span>
                      </div>
                    )}
                    {cli.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 opacity-60" />
                        <span>{cli.email}</span>
                      </div>
                    )}
                    {cli.telefone && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Phone className="w-3.5 h-3.5 opacity-60" />
                        <span>{cli.telefone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    {clientProposals.length} {clientProposals.length === 1 ? 'proposta' : 'propostas'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onCreateProposalForClient(cli)}
                    className="text-xs font-bold text-[#5b0250] dark:text-pink-300 hover:underline flex items-center gap-1"
                  >
                    <span>+ Nova Proposta</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900 space-y-3">
          <Users className="w-8 h-8 text-zinc-400 mx-auto" />
          <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
            Nenhum cliente encontrado
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Cadastre empresas e contatos frequentes para agilizar o processo de geração de orçamentos.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-[#5b0250] text-white text-xs font-bold shadow-xs hover:bg-[#47013e]"
          >
            + Cadastrar Cliente
          </button>
        </div>
      )}

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <form
            onSubmit={handleSave}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 p-6 z-10 space-y-4"
          >
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Empresa / Razão *</label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Nome da empresa"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">CNPJ</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                placeholder="00.000.000/0001-00"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-xs font-mono focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Contato Responsável</label>
              <input
                type="text"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                placeholder="Nome do decisor"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@empresa.com"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Telefone / WhatsApp</label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(maskPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-xs font-mono focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#5b0250] text-white text-xs font-bold shadow-xs hover:bg-[#47013e]"
              >
                Salvar Cliente
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

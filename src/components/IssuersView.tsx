import React, { useState } from 'react';
import { Building, Plus, Trash2, Edit3, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { Emissor } from '../types';
import { maskCNPJ, maskPhone, generateId } from '../utils/formatters';

interface IssuersViewProps {
  emissores: Emissor[];
  onAddEmissor: (emissor: Emissor) => void;
  onUpdateEmissor: (emissor: Emissor) => void;
  onDeleteEmissor: (id: string) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const IssuersView: React.FC<IssuersViewProps> = ({
  emissores,
  onAddEmissor,
  onUpdateEmissor,
  onDeleteEmissor,
  onNotify,
}) => {
  const [editingEmissor, setEditingEmissor] = useState<Emissor | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [razao, setRazao] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');

  const openAdd = () => {
    setEditingEmissor(null);
    setRazao('');
    setCnpj('');
    setEmail('');
    setTelefone('');
    setEndereco('');
    setShowModal(true);
  };

  const openEdit = (e: Emissor) => {
    setEditingEmissor(e);
    setRazao(e.razao);
    setCnpj(e.cnpj);
    setEmail(e.email || '');
    setTelefone(e.telefone || '');
    setEndereco(e.endereco || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!razao.trim() || !cnpj.trim()) {
      onNotify('Razão Social e CNPJ são obrigatórios.', 'error');
      return;
    }

    if (editingEmissor) {
      onUpdateEmissor({
        ...editingEmissor,
        razao: razao.trim(),
        cnpj: cnpj.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        endereco: endereco.trim(),
      });
      onNotify('Emissor atualizado com sucesso!', 'success');
    } else {
      onAddEmissor({
        id: generateId(),
        razao: razao.trim(),
        cnpj: cnpj.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        endereco: endereco.trim(),
      });
      onNotify('Novo emissor cadastrado!', 'success');
    }

    setShowModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Emissores & Contratadas
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure as empresas contratadas exibidas no cabeçalho e rodapé dos orçamentos em PDF.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-5 py-2.5 rounded-xl bg-[#5b0250] hover:bg-[#47013e] text-white font-bold text-xs shadow-md transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Adicionar Emissor</span>
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {emissores.map((emi) => (
          <div
            key={emi.id}
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#5b0250]/10 text-[#5b0250] flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                      {emi.razao}
                    </h3>
                    <span className="text-[11px] font-mono text-zinc-400">
                      CNPJ: {emi.cnpj}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(emi)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
                    title="Editar emissor"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {emissores.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteEmissor(emi.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg"
                      title="Excluir emissor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 mt-4 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 opacity-60" />
                  <span>{emi.email}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <Phone className="w-3.5 h-3.5 opacity-60" />
                  <span>{emi.telefone}</span>
                </div>
                {emi.endereco && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 opacity-60 shrink-0 mt-0.5" />
                    <span className="text-zinc-500 leading-tight">{emi.endereco}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-emerald-600 font-bold">Ativo nas propostas</span>
              <span className="text-zinc-400 font-mono text-[10px]">ID: {emi.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <form
            onSubmit={handleSave}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 p-6 z-10 space-y-4"
          >
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
              {editingEmissor ? 'Editar Emissor' : 'Novo Emissor'}
            </h3>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Razão Social *</label>
              <input
                type="text"
                value={razao}
                onChange={(e) => setRazao(e.target.value)}
                placeholder="Ex: Krolik Telecomunicações LTDA"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">CNPJ *</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                placeholder="00.000.000/0001-00"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-xs font-mono focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Email Comercial</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@krolik.com.br"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Telefone / Central</label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(maskPhone(e.target.value))}
                placeholder="(11) 4000-0000"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-xs font-mono focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Endereço Completo</label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Av. Paulista, 1000 - São Paulo, SP"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
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
                Salvar Emissor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

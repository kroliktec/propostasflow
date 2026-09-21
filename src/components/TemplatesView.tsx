import React, { useState } from 'react';
import { Files, Upload, Trash2, Eye, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { PdfTemplate } from '../types';
import { generateId, formatDate } from '../utils/formatters';

interface TemplatesViewProps {
  templates: PdfTemplate[];
  onAddTemplate: (template: PdfTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  templates,
  onAddTemplate,
  onDeleteTemplate,
  onNotify,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<PdfTemplate | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      onNotify('Por favor, selecione um arquivo no formato PDF.', 'error');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          // Result is "data:application/pdf;base64,..."
          const base64Clean = result.split(',')[1] || result;

          // Validate PDF integrity and inspect page count
          const binaryStr = atob(base64Clean);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }

          const pdfDoc = await PDFDocument.load(bytes);
          const pageCount = pdfDoc.getPageCount();

          const newTemplate: PdfTemplate = {
            id: generateId(),
            name: file.name.replace(/\.pdf$/i, ''),
            pdfBase64: base64Clean,
            base64: base64Clean,
            pageCount,
            sizeKb: Math.round(file.size / 1024),
            sizeBytes: file.size,
            createdAt: new Date().toISOString(),
            uploadedAt: new Date().toISOString(),
          };

          onAddTemplate(newTemplate);
          onNotify(`Template "${file.name}" carregado com sucesso (${pageCount} páginas)!`, 'success');
        } catch (innerErr) {
          console.error(innerErr);
          onNotify('Arquivo PDF inválido ou corrompido.', 'error');
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        onNotify('Falha ao ler o arquivo PDF.', 'error');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      onNotify('Erro ao processar template PDF.', 'error');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Templates de Fundo para PDF
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Faça upload do layout timbrado oficial da sua empresa para que os orçamentos sejam gerados sobre ele.
          </p>
        </div>

        <label className="px-5 py-2.5 rounded-xl bg-[#5b0250] hover:bg-[#47013e] text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Processando...' : '+ Upload Template PDF'}</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Info card */}
      <div className="bg-[#5b0250]/5 dark:bg-[#5b0250]/15 rounded-3xl p-5 border border-[#5b0250]/15 text-xs space-y-1.5">
        <h4 className="font-extrabold text-[#5b0250] dark:text-pink-300 flex items-center gap-2">
          <span>Como funciona a mescla com Template?</span>
        </h4>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
          Ao exportar uma proposta, o sistema utiliza a primeira página do seu PDF como plano de fundo artístico (cabeçalho timbrado, rodapé institucional, marca d'água) e desenha por cima a tabela de produtos, preços calculados e bento cards financeiros de forma matemática e nítida.
        </p>
      </div>

      {/* Templates List */}
      {templates.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#5b0250]/10 text-[#5b0250] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(tpl)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
                      title="Visualizar template"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTemplate(tpl.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg"
                      title="Excluir template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {tpl.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                    <span>{tpl.pageCount || 1} pág{(tpl.pageCount || 1) > 1 ? 's' : ''}</span>
                    <span>• {tpl.sizeKb || 0} KB</span>
                    <span>• {formatDate(tpl.uploadedAt || tpl.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pronto para merge</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(tpl)}
                  className="font-bold text-[#5b0250] dark:text-pink-300 hover:underline"
                >
                  Pré-visualizar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900 space-y-3">
          <Files className="w-8 h-8 text-zinc-400 mx-auto" />
          <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
            Nenhum template PDF personalizado
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Faça upload do template timbrado da Krolik para gerar orçamentos com a identidade visual da empresa.
          </p>
        </div>
      )}

      {/* Modal Preview */}
      {previewTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewTemplate(null)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 p-6 z-10 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                Visualização: {previewTemplate.name}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-[450px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10">
              <iframe
                src={`data:application/pdf;base64,${previewTemplate.pdfBase64 || previewTemplate.base64}`}
                title="Prévia do Template"
                className="w-full h-full bg-zinc-100"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

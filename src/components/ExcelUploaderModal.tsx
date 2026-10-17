import { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Download, 
  FileText, 
  RotateCcw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { parseExcelFile, downloadSampleExcelTemplate } from '../utils/excelParser';
import type { SiteRecord, UploadedFileMetadata } from '../types/dashboard';

interface ExcelUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (sites: SiteRecord[], metadata: UploadedFileMetadata) => void;
  onResetToDefault: () => void;
  activeMetadata: UploadedFileMetadata | null;
}

export const ExcelUploaderModal: React.FC<ExcelUploaderModalProps> = ({
  isOpen,
  onClose,
  onApplyData,
  onResetToDefault,
  activeMetadata,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{
    sites: SiteRecord[];
    fileName: string;
    totalRows: number;
    detectedColumns: string[];
    companies: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (selectedFile: File) => {
    setErrorMsg(null);
    setIsProcessing(true);


    try {
      const buffer = await selectedFile.arrayBuffer();
      const result = parseExcelFile(buffer, selectedFile.name);
      setParsedPreview(result);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'حدث خطأ أثناء قراءة ملف الإكسيل. يرجى التأكد من سلامة الملف وصيغته.'
      );
      setParsedPreview(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    if (parsedPreview) {
      onApplyData(parsedPreview.sites, {
        fileName: parsedPreview.fileName,
        uploadTime: new Date().toLocaleTimeString('ar-EG'),
        totalRows: parsedPreview.totalRows,
        detectedColumns: parsedPreview.detectedColumns,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="pbi-header-banner p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/20 text-emerald-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                استيراد وتحليل ملف Excel (Upload & Analyze)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                ارفع أي شيت إكسيل لتحديث كافة الرسوم البيانية والجداول ومؤشرات الأداء فورياً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Active dataset banner if currently using uploaded file */}
          {activeMetadata && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    يتم حالياً تحليل: {activeMetadata.fileName}
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    عدد الصفوف: {activeMetadata.totalRows} موقع • وقت الرفع: {activeMetadata.uploadTime}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  onResetToDefault();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 rounded-lg transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>العودة للبيانات الأصلية</span>
              </button>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-sky-500 bg-sky-50/80 scale-[0.99]'
                : 'border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 hover:border-slate-400'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Upload className="w-7 h-7" />
            </div>

            <h4 className="text-sm font-bold text-slate-800">
              اسحب وأفلت ملف Excel هنا، أو انقر للاختيار من جهازك
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              يدعم ملفات (.xlsx, .xls, .csv) • يتم تحليل وتطبيع الأعمدة تلقائياً
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="text-center py-4 text-xs font-semibold text-sky-600 animate-pulse">
              جاري قراءة ومعالجة شيت الإكسيل واستخراج المؤشرات...
            </div>
          )}

          {/* Parsed Preview Card */}
          {parsedPreview && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span className="font-bold text-xs text-slate-800">
                    ملخص الملف المقروء: {parsedPreview.fileName}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                  {parsedPreview.totalRows} موقع ميداني
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    الشركات والمشغلون المكتشفون:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {parsedPreview.companies.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 bg-slate-100 font-semibold text-slate-700 rounded text-[11px]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    الأعمدة المكتشفة:
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 block truncate">
                    {parsedPreview.detectedColumns.slice(0, 5).join(' • ')}
                    {parsedPreview.detectedColumns.length > 5 ? ' ...' : ''}
                  </span>
                </div>
              </div>

              {/* Sample preview table */}
              <div className="overflow-x-auto max-h-36 rounded border border-slate-200 bg-white">
                <table className="w-full text-right text-[11px]">
                  <thead className="bg-slate-100 text-slate-600 font-bold">
                    <tr>
                      <th className="p-1.5">كود الموقع</th>
                      <th className="p-1.5">الشركة</th>
                      <th className="p-1.5">موقف العام</th>
                      <th className="p-1.5 text-center">الروابط</th>
                      <th className="p-1.5">السنترال</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedPreview.sites.slice(0, 3).map((site) => (
                      <tr key={site.id}>
                        <td className="p-1.5 font-mono font-semibold text-sky-800">{site.siteCode}</td>
                        <td className="p-1.5 font-medium">{site.company}</td>
                        <td className="p-1.5">{site.status}</td>
                        <td className="p-1.5 text-center font-mono">{site.linksCount}</td>
                        <td className="p-1.5 text-slate-500">{site.central}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sample template download link */}
          <div className="flex items-center justify-between p-3 bg-sky-50/60 border border-sky-100 rounded-xl text-xs">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              هل تريد تحميل نموذج ملف Excel جاهز بالترتيب المثالي للأعمدة؟
            </span>
            <button
              type="button"
              onClick={downloadSampleExcelTemplate}
              className="flex items-center gap-1 text-sky-700 hover:text-sky-900 font-bold hover:underline cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل النموذج الاسترشادي</span>
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            إلغاء
          </button>

          <button
            type="button"
            disabled={!parsedPreview}
            onClick={handleApply}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all cursor-pointer"
          >
            <span>تحليل وتطبيق البيانات على الداشبورد</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

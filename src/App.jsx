import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  Pill, 
  Printer, 
  HeartPulse, 
  Stethoscope,
  Utensils,
  Settings,
  Building,
  Save,
  RotateCcw,
  Download,
  Upload,
  Palette,
  CheckCircle2,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  Clock,
  Phone,
  MapPin,
  Map,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  console.log('App rendering...');
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'M',
    caregiverName: '',
    procedures: [''],
    date: new Date().toLocaleDateString('pt-BR'),
    customNotes: '',
    selectedHospitalId: '',
    selectedDoctorId: '',
    selectedReturnLocationId: '',
    selectedEmergencyLocationId: '',
    returnDays: '15'
  });

  const [configData, setConfigData] = useState(() => {
    const saved = localStorage.getItem('discharge_config_v3');
    const defaults = {
      hospitals: [],
      returnLocations: [],
      emergencyLocations: [],
      doctors: [],
      commonProcedures: ['Colecistectomia Videolaparoscópica', 'Hernioplastia Inguinal', 'Apendicectomia', 'Histerectomia']
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Garante que todos os campos novos existam no dado carregado
        return { ...defaults, ...parsed };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('discharge_theme') || '#1e3a8a'; // Default blue-900
  });

  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    localStorage.setItem('discharge_config_v3', JSON.stringify(configData));
  }, [configData]);

  useEffect(() => {
    localStorage.setItem('discharge_theme', themeColor);
  }, [themeColor]);

  // Sincronizar seleções padrões ao trocar hospital ou carregar
  useEffect(() => {
    if (formData.selectedHospitalId) {
      const hospitalReturns = configData.returnLocations.filter(r => r.hospitalId == formData.selectedHospitalId);
      const hospitalEmergencies = configData.emergencyLocations.filter(e => e.hospitalId == formData.selectedHospitalId);
      
      if (!formData.selectedReturnLocationId && hospitalReturns.length > 0) {
        setFormData(prev => ({ ...prev, selectedReturnLocationId: hospitalReturns[0].id }));
      }
      if (!formData.selectedEmergencyLocationId && hospitalEmergencies.length > 0) {
        setFormData(prev => ({ ...prev, selectedEmergencyLocationId: hospitalEmergencies[0].id }));
      }
    }
  }, [formData.selectedHospitalId, configData]);

  // Sincronizar defaults com o formulário se nada estiver selecionado
  useEffect(() => {
    if (!formData.selectedHospitalId && configData.hospitals.length > 0) {
      const defaultHospital = configData.hospitals.find(h => h.isDefault) || configData.hospitals[0];
      setFormData(prev => ({ ...prev, selectedHospitalId: defaultHospital.id }));
    }
    if (!formData.selectedDoctorId && configData.doctors.length > 0) {
      const defaultDoctor = configData.doctors.find(d => d.isDefault) || configData.doctors[0];
      setFormData(prev => ({ ...prev, selectedDoctorId: defaultDoctor.id }));
    }
  }, [configData, formData.selectedHospitalId, formData.selectedDoctorId]);

  const [activeTab, setActiveTab] = useState('patient');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetSettings = () => {
    if (window.confirm('Tem certeza que deseja resetar todas as configurações?')) {
      const defaultConfig = {
        hospitalName: '',
        unitName: 'Unidade de Gastroenterologia e Cirurgia do Aparelho Digestivo (UGAD)',
        doctorName: '',
        doctorCRM: '',
        returnLocation: '',
        emergencyLocation: '',
        commonProcedures: ['Colecistectomia Videolaparoscópica', 'Hernioplastia Inguinal', 'Apendicectomia', 'Histerectomia']
      };
      setConfigData(defaultConfig);
      setThemeColor('#1e3a8a');
      alert('Configurações resetadas com sucesso!');
    }
  };

  const exportSettings = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ configData, themeColor }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "configuracoes_alta.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importSettings = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.configData) setConfigData(imported.configData);
        if (imported.themeColor) setThemeColor(imported.themeColor);
        alert('Configurações importadas com sucesso!');
      } catch (err) {
        alert('Erro ao importar arquivo. Certifique-se de que é um arquivo JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  const addHospital = (data) => setConfigData(prev => ({ ...prev, hospitals: [...prev.hospitals, { ...data, id: Date.now() }] }));
  const removeHospital = (id) => setConfigData(prev => ({ 
    ...prev, 
    hospitals: prev.hospitals.filter(h => h.id !== id),
    returnLocations: prev.returnLocations.filter(r => r.hospitalId !== id),
    emergencyLocations: prev.emergencyLocations.filter(e => e.hospitalId !== id)
  }));

  const addReturnLocation = (data) => setConfigData(prev => ({ ...prev, returnLocations: [...prev.returnLocations, { ...data, id: Date.now() }] }));
  const removeReturnLocation = (id) => setConfigData(prev => ({ ...prev, returnLocations: prev.returnLocations.filter(r => r.id !== id) }));

  const addEmergencyLocation = (data) => setConfigData(prev => ({ ...prev, emergencyLocations: [...prev.emergencyLocations, { ...data, id: Date.now() }] }));
  const removeEmergencyLocation = (id) => setConfigData(prev => ({ ...prev, emergencyLocations: prev.emergencyLocations.filter(e => e.id !== id) }));

  const addDoctor = (data) => setConfigData(prev => ({ ...prev, doctors: [...prev.doctors, { ...data, id: Date.now() }] }));
  const removeDoctor = (id) => setConfigData(prev => ({ ...prev, doctors: prev.doctors.filter(d => d.id !== id) }));
  const setDefaultDoctor = (id) => setConfigData(prev => ({ ...prev, doctors: prev.doctors.map(d => ({ ...d, isDefault: d.id === id })) }));

  const updateProcedure = (index, value) => {
    const newProcs = [...formData.procedures];
    newProcs[index] = value;
    setFormData(prev => ({ ...prev, procedures: newProcs }));
  };

  const addProcedureVOX = () => {
    setFormData(prev => ({ ...prev, procedures: [...prev.procedures, ''] }));
  };

  const removeProcedureVOX = (index) => {
    if (formData.procedures.length > 1) {
      const newProcs = formData.procedures.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, procedures: newProcs }));
    }
  };

  const resetForm = () => {
    if (window.confirm('Deseja limpar todos os dados do paciente atual?')) {
      setFormData(prev => ({
        ...prev,
        patientName: '',
        age: '',
        gender: 'M',
        caregiverName: '',
        procedures: [''],
        date: new Date().toLocaleDateString('pt-BR'),
        customNotes: '',
      }));
    }
  };


  const addProcedure = (proc) => {
    if (!proc || configData.commonProcedures.includes(proc)) return;
    setConfigData(prev => ({ ...prev, commonProcedures: [...prev.commonProcedures, proc] }));
  };

  const removeProcedure = (proc) => {
    setConfigData(prev => ({ ...prev, commonProcedures: prev.commonProcedures.filter(p => p !== proc) }));
  };

  const selectedHospital = configData.hospitals.find(h => h.id == formData.selectedHospitalId) || {};
  const selectedDoctor = configData.doctors.find(d => d.id == formData.selectedDoctorId) || {};
  const selectedReturn = configData.returnLocations.find(r => r.id == formData.selectedReturnLocationId) || {};
  const selectedEmergency = configData.emergencyLocations.find(e => e.id == formData.selectedEmergencyLocationId) || {};

  console.log('Selected Entities:', { selectedHospital, selectedDoctor, selectedReturn, selectedEmergency });

  const handlePrint = () => {
    window.print();
  };

  // Funções de personalização de texto
  const isPediatric = formData.age !== '' && parseInt(formData.age) < 18;
  const isElderly = formData.age !== '' && parseInt(formData.age) >= 65;

  const getPronoun = () => {
    if (formData.gender === 'M') return 'o';
    if (formData.gender === 'F') return 'a';
    return 'o(a)';
  };

  const getPatientTitle = () => {
    if (isPediatric) return `pequeno(a) ${formData.patientName}`;
    if (isElderly) return `${formData.gender === 'M' ? 'Sr.' : formData.gender === 'F' ? 'Sra.' : 'Sr(a).'} ${formData.patientName}`;
    return formData.patientName;
  };

  const getGreeting = () => {
    if (!formData.patientName) return "Preencha os dados ao lado para gerar o documento.";

    const unit = selectedHospital.hospitalName || 'equipe cirúrgica';

    if (isPediatric) {
      const caregiverText = formData.caregiverName ? `Prezado(a) ${formData.caregiverName}` : "Prezados pais ou responsáveis";
      return `${caregiverText}, a ${unit} parabeniza pela alta d${getPronoun()} paciente ${formData.patientName}. Este manual foi feito para orientá-los nos cuidados em casa.`;
    } 
    
    if (isElderly && formData.caregiverName) {
      return `Prezado(a) cuidador(a) ${formData.caregiverName}, a ${unit} preparou estas orientações para a recuperação segura d${getPronoun()} ${getPatientTitle()} em domicílio.`;
    }

    return `Olá, ${getPatientTitle()}. A ${unit} parabeniza por sua alta hospitalar. Preparamos este manual para guiar sua recuperação em casa de forma segura e tranquila.`;
  };

  // Gerar lista de datas para o dropdown (Hoje, Ontem e últimos 5 dias)
  const getDateOptions = () => {
    const options = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = i === 0 ? 'Hoje' : i === 1 ? 'Ontem' : d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' });
      options.push({ label, value: d.toLocaleDateString('pt-BR') });
    }
    return options;
  };

  // Cálculo da data de retorno baseada em dias
  const getCalculatedReturnDate = () => {
    if (!formData.date || !formData.returnDays) return null;
    try {
      const [day, month, year] = formData.date.split('/');
      const date = new Date(year, month - 1, day);
      date.setDate(date.getDate() + parseInt(formData.returnDays));
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) { return null; }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 print:bg-white transition-colors duration-500 theme-transition">
      
      {/* Header - Fixo e Full-Width */}
      <header 
        className="h-16 text-white px-6 shadow-lg print:hidden sticky top-0 z-40 flex items-center justify-between transition-colors duration-500"
        style={{ backgroundColor: themeColor }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black leading-none uppercase tracking-tighter">OREN.AI</h1>
            <p className="text-[10px] text-blue-100 font-bold opacity-80 uppercase tracking-widest mt-1">ORIENTAÇÕES OREN.AI</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={resetForm}
            className="flex items-center gap-2 bg-white/10 hover:bg-red-500/50 px-4 py-2 rounded-lg font-bold text-sm transition-all border border-white/20"
          >
            <RotateCcw className="w-4 h-4" />
            NOVA ALTA
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            IMPRIMIR
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:rotate-90"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Overlay para o Drawer */}
      {isSettingsOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity animate-fade-in"
          onClick={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Drawer de Configurações */}
      <aside 
        className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white/95 backdrop-blur-xl shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[60] transition-transform duration-500 ease-in-out transform ${isSettingsOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Configurações</h2>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Conteúdo das Configurações (Mesmo conteúdo anterior) */}
          <div className="space-y-6 pb-20">
            {/* 1. Gestão de Hospitais */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Building className="w-4 h-4" />
                [1] Cadastro de Hospitais
              </h2>
              <div className="space-y-2 mb-4">
                {configData.hospitals.map(h => (
                  <div key={h.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div>
                      <p className="text-sm font-bold text-slate-700 uppercase">{h.hospitalName}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{h.cnpj || 'CNPJ não informado'}</p>
                    </div>
                    <button onClick={() => removeHospital(h.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-slate-200">
                <HospitalForm onAdd={addHospital} themeColor={themeColor} />
              </div>
            </div>

            {/* 2. Gestão de Locais de Retorno */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                [2] Locais de Retorno
              </h2>
              <div className="space-y-2 mb-4">
                {configData.returnLocations.map(r => {
                  const h = configData.hospitals.find(h => h.id == r.hospitalId);
                  return (
                    <div key={r.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{r.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase">{h?.hospitalName || 'Hospital não vinculado'}</p>
                      </div>
                      <button onClick={() => removeReturnLocation(r.id)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-slate-200">
                <ReturnLocationForm hospitals={configData.hospitals} onAdd={addReturnLocation} themeColor={themeColor} />
              </div>
            </div>

            {/* 3. Gestão de Locais de Emergência */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                [3] Locais de Emergência
              </h2>
              <div className="space-y-2 mb-4">
                {configData.emergencyLocations.map(e => {
                  const h = configData.hospitals.find(h => h.id == e.hospitalId);
                  return (
                    <div key={e.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{e.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase">{h?.hospitalName || 'Hospital não vinculado'}</p>
                      </div>
                      <button onClick={() => removeEmergencyLocation(e.id)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-slate-200">
                <EmergencyLocationForm hospitals={configData.hospitals} onAdd={addEmergencyLocation} themeColor={themeColor} />
              </div>
            </div>

            {/* 4. Gestão de Médicos */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                [4] Corpo Clínico
              </h2>
              <div className="space-y-2 mb-4">
                {configData.doctors.map(d => (
                  <div key={d.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={d.isDefault}
                        onChange={() => setDefaultDoctor(d.id)}
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-700">{d.doctorName}</p>
                        <p className="text-[10px] text-slate-400 uppercase">CRM {d.doctorCRM}</p>
                      </div>
                    </div>
                    <button onClick={() => removeDoctor(d.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-slate-200">
                <DoctorForm onAdd={addDoctor} themeColor={themeColor} />
              </div>
            </div>

            {/* 5. Gestão de Procedimentos Favoritos */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Save className="w-4 h-4" />
                [5] Procedimentos Comuns
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {configData.commonProcedures?.map(p => (
                  <div key={p} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 shadow-sm">
                    {p}
                    <button onClick={() => removeProcedure(p)} className="text-red-400 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  id="newProcInput"
                  placeholder="Novo procedimento..." 
                  className="flex-1 p-2 border rounded-lg text-sm" 
                  onKeyDown={e => { if(e.key === 'Enter') { addProcedure(e.target.value); e.target.value = '' } }}
                />
                <button 
                  onClick={() => { const inp = document.getElementById('newProcInput'); addProcedure(inp.value); inp.value = '' }} 
                  className="p-2 bg-blue-600 text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 6. Estilo e Dados */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                [5] Personalização e Backup
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Cor da Identidade Visual</label>
                  <div className="flex flex-wrap gap-2">
                    {['#1e3a8a', '#0f766e', '#7e22ce', '#be123c', '#111827', '#15803d'].map(color => (
                      <button
                        key={color}
                        onClick={() => setThemeColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${themeColor === color ? 'border-white ring-2 ring-slate-400' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-8 h-8 rounded-full overflow-hidden border-none cursor-pointer" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button onClick={exportSettings} className="flex items-center justify-center gap-2 p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                    <Download className="w-3.5 h-3.5" /> EXPORTAR
                  </button>
                  <label className="flex items-center justify-center gap-2 p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> IMPORTAR
                    <input type="file" className="hidden" accept=".json" onChange={importSettings} />
                  </label>
                  <button onClick={resetSettings} className="col-span-2 flex items-center justify-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-[10px] font-black text-red-600 hover:bg-red-100 transition-colors uppercase tracking-widest">
                    <RotateCcw className="w-3.5 h-3.5" /> Resetar Banco de Dados
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 print:block print:p-0 min-h-[calc(100vh-64px)]">
        
        {/* Painel de Dados do Paciente (Left Sidebar) */}
        <section className="lg:col-span-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 print:hidden h-fit sticky top-20 transition-all custom-scrollbar">
          <div className="p-6 space-y-4 animate-fade-in">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b pb-2">
              <User className="w-4 h-4" />
              Dados do Paciente
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nome do Paciente</label>
                <input 
                  type="text" 
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none transition-shadow bg-white"
                  style={{ '--tw-ring-color': themeColor }}
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Idade</label>
                  <input 
                    type="number" 
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none bg-white transition-shadow"
                    style={{ '--tw-ring-color': themeColor }}
                    placeholder="Ex: 45"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Sexo</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none bg-white transition-shadow"
                    style={{ '--tw-ring-color': themeColor }}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">🏥 Meu Hospital</label>
                <select 
                  name="selectedHospitalId"
                  value={formData.selectedHospitalId}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none bg-white transition-shadow text-xs font-bold text-slate-700 uppercase tracking-tight"
                  style={{ '--tw-ring-color': themeColor }}
                >
                  <option value="">Selecione o Hospital...</option>
                  {configData.hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.hospitalName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">📅 Local de Retorno</label>
                  <select 
                    name="selectedReturnLocationId"
                    value={formData.selectedReturnLocationId}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none bg-white transition-shadow disabled:bg-slate-100 disabled:text-slate-400 text-xs font-bold text-slate-700 uppercase tracking-tight"
                    style={{ '--tw-ring-color': themeColor }}
                    disabled={!formData.selectedHospitalId}
                  >
                    <option value="">Selecione o Local...</option>
                    {configData.returnLocations.filter(r => r.hospitalId == formData.selectedHospitalId).map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">🚨 Emergência</label>
                  <select 
                    name="selectedEmergencyLocationId"
                    value={formData.selectedEmergencyLocationId}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none bg-white transition-shadow disabled:bg-slate-100 disabled:text-slate-400 text-xs font-bold text-slate-700 uppercase tracking-tight"
                    style={{ '--tw-ring-color': themeColor }}
                    disabled={!formData.selectedHospitalId}
                  >
                    <option value="">Selecione a Unidade...</option>
                    {configData.emergencyLocations.filter(e => e.hospitalId == formData.selectedHospitalId).map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">👨‍⚕️ Médico Responsável</label>
                <select 
                  name="selectedDoctorId"
                  value={formData.selectedDoctorId}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none bg-white transition-shadow text-xs font-bold text-slate-700 uppercase tracking-tight"
                  style={{ '--tw-ring-color': themeColor }}
                >
                  <option value="">Selecione o Médico...</option>
                  {configData.doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.doctorName} (CRM {d.doctorCRM})</option>
                  ))}
                </select>
              </div>

              {(isPediatric || isElderly) && (
                <div className="animate-fade-in bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <label className="block text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">
                    Nome do {isPediatric ? 'Responsável' : 'Cuidador'}
                  </label>
                  <input 
                    type="text" 
                    name="caregiverName"
                    value={formData.caregiverName}
                    onChange={handleChange}
                    className="w-full p-2 border border-blue-200 rounded-lg focus:ring-2 outline-none bg-white"
                    style={{ '--tw-ring-color': themeColor }}
                    placeholder="Ex: Maria da Silva"
                  />
                </div>
              )}

              {/* SISTEMA CAIXA VOX - PROCEDIMENTOS DINÂMICOS */}
              <div className="space-y-4">
                {formData.procedures.map((proc, index) => (
                  <div key={index} className="animate-fade-in p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {index === 0 ? '📋 Procedimento Principal' : `📦 Procedimento Adicional ${index}`}
                      </label>
                      {index > 0 && (
                        <button onClick={() => removeProcedureVOX(index)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <select 
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 outline-none bg-white text-[11px] font-black text-slate-700 uppercase tracking-tighter"
                        style={{ '--tw-ring-color': themeColor }}
                        onChange={(e) => updateProcedure(index, e.target.value)}
                        value={configData.commonProcedures?.includes(proc) ? proc : ""}
                      >
                        <option value="">Selecione um Favorito...</option>
                        {configData.commonProcedures?.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>

                      <input 
                        type="text" 
                        value={proc}
                        onChange={(e) => updateProcedure(index, e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none bg-white text-sm font-bold"
                        style={{ '--tw-ring-color': themeColor }}
                        placeholder="Nome do procedimento..."
                      />
                    </div>

                    {/* Gatilho para próxima Caixa VOX */}
                    {index === formData.procedures.length - 1 && (
                      <div className="mt-4 pt-4 border-t border-dashed border-slate-300">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              className="sr-only" 
                              onChange={(e) => { if(e.target.checked) addProcedureVOX() }}
                              checked={false}
                            />
                            <div className="w-5 h-5 bg-white border-2 border-slate-300 rounded transition-colors group-hover:border-blue-500 flex items-center justify-center">
                              <Plus className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100" />
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                            Houve outro procedimento realizado?
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">📅 Data da Alta</label>
                <select 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none bg-white transition-shadow text-xs font-bold text-slate-700 uppercase tracking-tight"
                  style={{ '--tw-ring-color': themeColor }}
                >
                  {getDateOptions().map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Dias para Retorno</label>
                  <input 
                    type="number" 
                    name="returnDays"
                    value={formData.returnDays}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none bg-white transition-shadow"
                    style={{ '--tw-ring-color': themeColor }}
                    placeholder="Ex: 15"
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-[10px] text-slate-400 font-bold uppercase leading-tight italic">
                    O sistema calcula a data <br /> automaticamente
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Observações (Opcional)</label>
                <textarea 
                  name="customNotes"
                  value={formData.customNotes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none bg-white transition-shadow resize-none"
                  style={{ '--tw-ring-color': themeColor }}
                  placeholder="Ex: Retirar pontos em 10 dias."
                ></textarea>
              </div>
            </div>
          </div>
        </section>

        {/* Visualização / Impressão (Right Column) */}
        <section className="lg:col-span-8 bg-white p-8 md:p-12 rounded-2xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:w-full min-h-[297mm] transition-all">
          
          {/* CABEÇALHO INSTITUCIONAL */}
          <div className="text-center border-b-4 pb-6 mb-8" style={{ borderColor: themeColor }}>
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-1">
              {selectedHospital.hospitalName || 'Hospital não selecionado'}
            </h2>
            <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ color: themeColor }}>
              Orientações de Alta Hospitalar
            </h1>
          </div>

          {/* BLOCO 1: DADOS DO PACIENTE - ALARGADO E COM DESTAQUE */}
          <div className="mb-8">
            <div className="flex items-center gap-2 bg-slate-100 p-3 rounded-t-xl border border-slate-200">
              <User className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-black uppercase text-slate-600 tracking-widest">👤 Identificação do Paciente</span>
            </div>
            <div className="border border-t-0 border-slate-200 rounded-b-xl overflow-hidden shadow-sm">
              <div className="p-6 bg-white">
                <p className="text-[11px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Nome Completo</p>
                <p className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                  {formData.patientName || '________________________________________________'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 mb-6">
            {/* BLOCO 2: INFORMAÇÕES DE ALTA */}
            <div>
              <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-t-lg border border-slate-200">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-black uppercase text-slate-600 tracking-wider">📅 Alta e Retorno</span>
              </div>
              <div className="border border-t-0 border-slate-200 rounded-b-lg overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-slate-200 text-center">
                  <div className="p-3">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Data da Alta</p>
                    <p className="text-sm font-black text-slate-700">{formData.date}</p>
                  </div>
                  <div className="p-3 bg-blue-50/30">
                    <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">Retorno Previsto ✦</p>
                    <p className="text-sm font-black text-blue-900">{getCalculatedReturnDate() || '___/___/___'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BLOCO 4: PROCEDIMENTOS REALIZADOS */}
          <div className="mb-6">
            <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-t-lg border border-slate-200">
              <Activity className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-black uppercase text-slate-600 tracking-wider">📋 Procedimento(s) Realizado(s)</span>
            </div>
            <div className="p-4 border border-t-0 border-slate-200 rounded-b-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {formData.procedures.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 py-1">
                    {formData.procedures.length > 1 && (
                      <span className="text-[10px] font-black bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Nº 0{i + 1}</span>
                    )}
                    <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{p || '___________________________'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BLOCO 5: LOCAIS DE ATENDIMENTO */}
          <div className="mb-10 grid grid-cols-2 gap-6">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">📌 Local de Retorno</p>
              </div>
              <p className="text-xs font-black text-slate-800 uppercase">{selectedReturn.name || 'Não selecionado'}</p>
              <p className="text-[10px] text-slate-500 mt-1">{selectedReturn.address || 'Endereço não disponível'}</p>
            </div>
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <p className="text-[10px] uppercase font-black text-red-400 tracking-widest">🚨 Unidade de Emergência</p>
              </div>
              <p className="text-xs font-black text-red-900 uppercase">{selectedEmergency.name || 'Não selecionado'}</p>
              <p className="text-[10px] text-red-600/70 mt-1">{selectedEmergency.address || 'Endereço não disponível'}</p>
            </div>
          </div>

          {/* Introdução */}
          <div className="mb-8 text-slate-700 leading-relaxed text-justify text-lg">
            <p>{getGreeting()}</p>
            <p className="mt-2">
              É normal sentir-se um pouco fadigado ou apresentar dor leve a moderada nos primeiros dias. 
              O sucesso da cirurgia continua agora em sua casa. Siga rigorosamente as orientações abaixo.
            </p>
          </div>

          {/* Seções de Cuidados */}
          <div className="space-y-6">
            
            {/* Medicamentos */}
            <div className="flex gap-4">
              <div className="mt-1 bg-blue-100 p-2 rounded-full h-fit print:border print:border-slate-300">
                <Pill className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">1. Medicações</h3>
                <ul className="list-disc list-inside text-slate-600 mt-2 space-y-1">
                  <li>Siga a receita médica de alta rigorosamente. Respeite os horários e doses.</li>
                  <li><strong>Controle da dor:</strong> Tome os analgésicos prescritos mesmo que a dor esteja fraca no início, para evitar picos de dor.</li>
                  <li>Não tome medicamentos por conta própria, especialmente outros anti-inflamatórios ou chás.</li>
                </ul>
              </div>
            </div>

            {/* Cuidados com a Ferida */}
            <div className="flex gap-4">
              <div className="mt-1 bg-teal-100 p-2 rounded-full h-fit print:border print:border-slate-300">
                <Activity className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">2. Cuidados com a Ferida Cirúrgica (Curativo)</h3>
                <ul className="list-disc list-inside text-slate-600 mt-2 space-y-1">
                  <li>Mantenha o local da cirurgia <strong>sempre limpo e seco</strong>.</li>
                  <li>Lave a ferida apenas com água e sabão (de preferência neutro) durante o banho, de forma suave.</li>
                  <li>Seque bem a incisão com uma toalha limpa ou gaze, sem esfregar.</li>
                  <li><strong>NÃO</strong> aplique pomadas, pós, borra de café ou receitas caseiras sobre a ferida.</li>
                  <li>Caso a ferida suje a roupa com um pouco de sangue nos primeiros dias, é considerado normal. Proteja com gaze seca e micropore.</li>
                </ul>
              </div>
            </div>

            {/* Alimentação */}
            <div className="flex gap-4">
              <div className="mt-1 bg-orange-100 p-2 rounded-full h-fit print:border print:border-slate-300">
                <Utensils className="w-5 h-5 text-orange-700" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">3. Alimentação e Hidratação</h3>
                <ul className="list-disc list-inside text-slate-600 mt-2 space-y-1">
                  {isPediatric ? (
                    <li>Inicie com alimentos leves e ofereça bastante líquido (água e sucos naturais). Evite doces em excesso.</li>
                  ) : (
                    <li>Mantenha uma dieta leve e de fácil digestão nos primeiros dias. Evite gorduras, frituras e alimentos ultraprocessados.</li>
                  )}
                  <li>Beba bastante água (6 a 8 copos por dia), salvo restrição médica específica. A hidratação ajuda na cicatrização e no funcionamento do intestino.</li>
                  <li>É comum o intestino ficar preguiçoso após a cirurgia. Caminhadas curtas e hidratação ajudam.</li>
                </ul>
              </div>
            </div>

            {/* Repouso e Movimentação */}
            <div className="flex gap-4">
              <div className="mt-1 bg-purple-100 p-2 rounded-full h-fit print:border print:border-slate-300">
                <HeartPulse className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">4. Repouso e Atividades</h3>
                <ul className="list-disc list-inside text-slate-600 mt-2 space-y-1">
                  <li><strong>Não fique o dia todo na cama.</strong> Caminhar pequenas distâncias dentro de casa previne trombose e melhora a respiração.</li>
                  {isPediatric ? (
                    <li>Evite que a criança pule, corra ou faça brincadeiras bruscas por pelo menos 15 a 30 dias (conforme orientação médica).</li>
                  ) : isElderly ? (
                    <li>Levante-se devagar para evitar tonturas. Caminhe com supervisão do cuidador para prevenir quedas.</li>
                  ) : (
                    <li>Não carregue peso (acima de 5kg), não dirija e evite esforço físico intenso (como academia) por 30 a 45 dias, até liberação médica.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Sinais de Alerta Adaptativos */}
            <div className="flex gap-4 bg-red-50 p-6 rounded-2xl border border-red-100 print:border-red-300 mt-8 break-inside-avoid shadow-sm">
              <div className="mt-1 bg-red-600 p-2.5 rounded-xl h-fit">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="w-full">
                <h3 className="font-black text-xl text-red-900 uppercase tracking-tight">🚨 Sinais de Alerta: ORIENTAÇÕES OREN.AI</h3>
                <p className="text-red-800 text-sm mt-1 mb-4 leading-relaxed font-medium">
                  Se {isPediatric ? 'a criança' : isElderly ? 'o paciente' : 'você'} apresentar qualquer um dos sinais abaixo, dirija-se <strong>IMEDIATAMENTE</strong> ao 
                  <span className="bg-red-200 px-1 rounded ml-1 text-red-950 font-black underline uppercase">
                    {selectedEmergency.name || 'Pronto-Socorro do Hospital'}
                  </span>:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-red-900 font-bold text-sm">
                  <li className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-red-100">🌡️ Febre acima de 37.8°C</li>
                  <li className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-red-100">😣 Dor que não cede com remédios</li>
                  <li className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-red-100">🩹 Pus ou vermelhidão na ferida</li>
                  <li className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-red-100">🤢 Vômitos persistentes</li>
                  <li className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-red-100">🫁 Falta de ar ou dor no peito</li>
                  <li className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-red-100">🦵 Inchaço súbito nas pernas</li>
                </ul>
              </div>
            </div>

            {/* Orientações Personalizadas */}
            {formData.customNotes && (
              <div className="flex gap-4">
                <div className="mt-1 bg-slate-200 p-2 rounded-full h-fit print:border print:border-slate-300">
                  <FileText className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">6. Orientações Específicas do Cirurgião</h3>
                  <p className="text-slate-700 whitespace-pre-line mt-2 bg-yellow-50 p-3 rounded border border-yellow-200">
                    {formData.customNotes}
                  </p>
                </div>
              </div>
            )}

            {/* 📅 Locais de Retorno Agendados */}
            <div className="flex gap-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 print:border-slate-300 mt-6 break-inside-avoid shadow-sm">
              <div className="mt-1 bg-blue-600 p-2.5 rounded-xl h-fit shadow-md shadow-blue-200 print:shadow-none">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="w-full">
                <h3 className="font-black text-xl text-blue-900 uppercase tracking-tight">📅 Meus Retornos Agendados</h3>
                <p className="text-blue-800 text-sm mt-1 mb-4 leading-relaxed font-medium">
                  Este é o local exato onde você deve comparecer no dia do seu retorno agendado:
                </p>
                <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-lg font-black text-blue-950 uppercase mb-1">{selectedReturn.name || '__________________________'}</p>
                    {formData.returnDays && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">
                        Em {formData.returnDays} dias
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 border-t pt-3 mt-1">
                    <p className="text-sm text-slate-800 font-bold flex items-center gap-2 italic">
                      <Calendar className="w-4 h-4 text-blue-500" /> Data Prevista: {getCalculatedReturnDate() || '____________________'}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" /> {selectedReturn.address || 'Consultar Ala/Andar na Recepção'}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" /> {selectedReturn.time || 'Horário conforme agendamento'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 🚨 Emergência / Onde Ir Agora */}
            <div className="flex gap-4 bg-red-50/50 p-6 rounded-2xl border border-red-200 print:border-slate-300 mt-6 break-inside-avoid shadow-sm">
              <div className="mt-1 bg-red-600 p-2.5 rounded-xl h-fit shadow-md shadow-red-200 print:shadow-none">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="w-full">
                <h3 className="font-black text-xl text-red-900 uppercase tracking-tight">🚨 Emergência / Onde ir Agora</h3>
                <p className="text-red-800 text-sm mt-1 mb-4 leading-relaxed font-medium">
                  Em caso de sinais de alerta (febre, dor intensa, pus), dirija-se imediatamente a:
                </p>
                <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm">
                  <p className="text-lg font-black text-red-950 uppercase mb-1">{selectedEmergency.name || 'Pronto-Socorro do Hospital'}</p>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" /> {selectedEmergency.address || 'Entrada de Emergência Principal'}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-500" /> {selectedEmergency.availability || 'Disponibilidade 24h'}
                    </p>
                    {selectedEmergency.phone && (
                      <p className="text-sm text-red-700 font-bold flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {selectedEmergency.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Mensagem de Encerramento e Assinatura */}
          <div className="mt-12 pt-8 border-t border-slate-200 text-center break-inside-avoid">
            <p className="text-lg italic text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              "Agradecemos sua confiança em nossa equipe. Foi uma honra cuidar de você. <br />
              Desejamos uma recuperação plena e repleta de saúde."
            </p>
            
            <div className="flex flex-col items-center">
              <div className="w-64 border-b-2 border-slate-400 mb-2"></div>
              <p className="text-sm font-black uppercase text-slate-800">{selectedDoctor.doctorName || 'Assinatura do Médico'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {selectedHospital.hospitalName || 'Equipe Cirúrgica'} 
                {selectedDoctor.doctorCRM ? ` / CRM ${selectedDoctor.doctorCRM}` : ' / CRM ___________'}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// [1] Formulário de Hospital
function HospitalForm({ onAdd, themeColor }) {
  const [data, setData] = useState({ hospitalName: '', cnpj: '', address: '' });
  return (
    <div className="space-y-3">
      <input placeholder="Nome do Hospital (ex: Stella Maris)" className="w-full p-2 border rounded-lg text-sm" value={data.hospitalName} onChange={e => setData({...data, hospitalName: e.target.value.toUpperCase()})} />
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="CNPJ" className="w-full p-2 border rounded-lg text-sm" value={data.cnpj} onChange={e => setData({...data, cnpj: e.target.value})} />
        <input placeholder="Endereço Principal" className="w-full p-2 border rounded-lg text-sm" value={data.address} onChange={e => setData({...data, address: e.target.value})} />
      </div>
      <button onClick={() => { if(data.hospitalName) onAdd(data); setData({ hospitalName: '', cnpj: '', address: '' }) }} className="w-full p-2 rounded-lg text-white text-xs font-black uppercase tracking-widest" style={{ backgroundColor: themeColor }}>+ Cadastrar Hospital</button>
    </div>
  );
}

// [2] Formulário de Local de Retorno
function ReturnLocationForm({ hospitals, onAdd, themeColor }) {
  const [data, setData] = useState({ hospitalId: '', name: '', address: '', time: '', type: 'Retorno' });
  return (
    <div className="space-y-3">
      <select className="w-full p-2 border rounded-lg text-sm" value={data.hospitalId} onChange={e => setData({...data, hospitalId: e.target.value})}>
        <option value="">Vincular ao Hospital...</option>
        {hospitals.map(h => <option key={h.id} value={h.id}>{h.hospitalName}</option>)}
      </select>
      <input placeholder="Nome do Local (ex: Ambulatório de Cardiologia)" className="w-full p-2 border rounded-lg text-sm" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Ala / Sala" className="w-full p-2 border rounded-lg text-sm" value={data.address} onChange={e => setData({...data, address: e.target.value})} />
        <input placeholder="Horário (ex: 08h às 17h)" className="w-full p-2 border rounded-lg text-sm" value={data.time} onChange={e => setData({...data, time: e.target.value})} />
      </div>
      <button onClick={() => { if(data.hospitalId && data.name) onAdd(data); setData({ hospitalId: '', name: '', address: '', time: '', type: 'Retorno' }) }} className="w-full p-2 rounded-lg text-white text-xs font-black uppercase tracking-widest" style={{ backgroundColor: themeColor }}>+ Vincular Local de Retorno</button>
    </div>
  );
}

// [3] Formulário de Local de Emergência
function EmergencyLocationForm({ hospitals, onAdd, themeColor }) {
  const [data, setData] = useState({ hospitalId: '', name: '', address: '', phone: '', availability: '24h' });
  return (
    <div className="space-y-3">
      <select className="w-full p-2 border rounded-lg text-sm" value={data.hospitalId} onChange={e => setData({...data, hospitalId: e.target.value})}>
        <option value="">Vincular ao Hospital...</option>
        {hospitals.map(h => <option key={h.id} value={h.id}>{h.hospitalName}</option>)}
      </select>
      <input placeholder="Nome da Unidade (ex: Pronto-Socorro Adulto)" className="w-full p-2 border rounded-lg text-sm" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Entrada / Acesso" className="w-full p-2 border rounded-lg text-sm" value={data.address} onChange={e => setData({...data, address: e.target.value})} />
        <input placeholder="Disponibilidade (ex: 24h)" className="w-full p-2 border rounded-lg text-sm" value={data.availability} onChange={e => setData({...data, availability: e.target.value})} />
      </div>
      <input placeholder="Telefone Direto (opcional)" className="w-full p-2 border rounded-lg text-sm" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} />
      <button onClick={() => { if(data.hospitalId && data.name) onAdd(data); setData({ hospitalId: '', name: '', address: '', phone: '', availability: '24h' }) }} className="w-full p-2 rounded-lg text-white text-xs font-black uppercase tracking-widest" style={{ backgroundColor: themeColor }}>+ Vincular Local de Emergência</button>
    </div>
  );
}

// [4] Formulário de Médico
function DoctorForm({ onAdd, themeColor }) {
  const [data, setData] = useState({ doctorName: '', doctorCRM: '' });
  return (
    <div className="space-y-2">
      <input placeholder="Nome do Médico" className="w-full p-2 border rounded-lg text-sm" value={data.doctorName} onChange={e => setData({...data, doctorName: e.target.value})} />
      <input placeholder="CRM" className="w-full p-2 border rounded-lg text-sm" value={data.doctorCRM} onChange={e => setData({...data, doctorCRM: e.target.value})} />
      <button onClick={() => { if(data.doctorName) onAdd(data); setData({ doctorName: '', doctorCRM: '' }) }} className="w-full p-2 rounded-lg text-white text-xs font-black uppercase tracking-widest" style={{ backgroundColor: themeColor }}>+ Cadastrar Médico</button>
    </div>
  );
}

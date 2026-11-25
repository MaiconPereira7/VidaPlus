import { useEffect, useRef, useState } from "react";
import { Bell, Camera, Lock, Save, User } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { Avatar, PageHeader, Panel, Toggle, btnPrimary, btnSecondary, inputClass } from "../../components/supervisor/ui";
import { SUPERVISOR } from "../../data/supervisorMock";

export default function Configuracoes() {
  const [perfil, setPerfil] = useState({ nome: SUPERVISOR.nome, email: SUPERVISOR.email, cargo: SUPERVISOR.cargo });
  const [foto, setFoto] = useState(null);
  const [notif, setNotif] = useState({ email: true, push: true, sms: false });
  const [senhaAberta, setSenhaAberta] = useState(false);
  const [dois, setDois] = useState(false);
  const fileRef = useRef(null);
  const { showToast } = useToast();

  // Libera a URL temporária da foto ao trocar ou sair.
  useEffect(() => () => foto && URL.revokeObjectURL(foto), [foto]);

  function onFoto(e) {
    const file = e.target.files?.[0];
    if (file) setFoto(URL.createObjectURL(file));
  }

  function setCampo(c) {
    return (e) => setPerfil((p) => ({ ...p, [c]: e.target.value }));
  }

  function salvar(e) {
    e.preventDefault();
    setSenhaAberta(false);
    showToast("Alterações salvas");
  }

  return (
    <form onSubmit={salvar}>
      <PageHeader title="Configurações" subtitle="Gerencie seu perfil, notificações e segurança" />

      <div className="space-y-4">
        <Panel className="hover:shadow-sm">
          <SectionHead icon={User} title="Perfil do Supervisor" />
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {foto ? (
                  <img src={foto} alt="Foto do supervisor" className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <Avatar nome={perfil.nome || "?"} size="lg" />
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg-card bg-accent text-white transition-transform hover:scale-110"
                  aria-label="Alterar foto"
                >
                  <Camera size={15} />
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFoto} className="hidden" />
              <span className="text-xs text-text-muted">JPG ou PNG</span>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field label="Nome" htmlFor="cfg-nome">
                <input id="cfg-nome" value={perfil.nome} onChange={setCampo("nome")} className={inputClass} />
              </Field>
              <Field label="Cargo" htmlFor="cfg-cargo">
                <input id="cfg-cargo" value={perfil.cargo} onChange={setCampo("cargo")} className={inputClass} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="E-mail" htmlFor="cfg-email">
                  <input id="cfg-email" type="email" value={perfil.email} onChange={setCampo("email")} className={inputClass} />
                </Field>
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="hover:shadow-sm">
          <SectionHead icon={Bell} title="Notificações" />
          <div className="divide-y divide-border">
            <Toggle label="Alertas por e-mail" description="Resumo diário e alertas críticos" checked={notif.email} onChange={(v) => setNotif((n) => ({ ...n, email: v }))} />
            <Toggle label="Notificações push" description="No navegador, em tempo real" checked={notif.push} onChange={(v) => setNotif((n) => ({ ...n, push: v }))} />
            <Toggle label="SMS" description="Apenas alertas de nível alto" checked={notif.sms} onChange={(v) => setNotif((n) => ({ ...n, sms: v }))} />
          </div>
        </Panel>

        <Panel className="hover:shadow-sm">
          <SectionHead icon={Lock} title="Segurança" />
          <div className="divide-y divide-border">
            <div className="py-3">
              <div className="flex items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium text-text-primary">Senha</span>
                  <span className="block text-xs text-text-secondary">Alterada há 3 meses</span>
                </span>
                <button type="button" onClick={() => setSenhaAberta((o) => !o)} className={`${btnSecondary} py-2`}>
                  {senhaAberta ? "Cancelar" : "Alterar senha"}
                </button>
              </div>
              {senhaAberta && (
                <div className="animate-fade-in mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="Senha atual" htmlFor="cfg-s1">
                    <input id="cfg-s1" type="password" autoComplete="current-password" className={inputClass} />
                  </Field>
                  <Field label="Nova senha" htmlFor="cfg-s2">
                    <input id="cfg-s2" type="password" autoComplete="new-password" className={inputClass} />
                  </Field>
                  <Field label="Confirmar nova senha" htmlFor="cfg-s3">
                    <input id="cfg-s3" type="password" autoComplete="new-password" className={inputClass} />
                  </Field>
                </div>
              )}
            </div>
            <Toggle
              label="Autenticação em dois fatores (2FA)"
              description={dois ? "Ativada — código pedido a cada novo acesso" : "Proteção extra com código no celular"}
              checked={dois}
              onChange={setDois}
            />
          </div>
        </Panel>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-6 flex justify-end border-t border-border bg-bg-primary/90 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <button type="submit" className={`${btnPrimary} w-full sm:w-auto`}>
          <Save size={17} />
          Salvar Alterações
        </button>
      </div>
    </form>
  );
}

function SectionHead({ icon: Icon, title }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-light text-accent-hover dark:text-accent">
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <h2 className="card-title">{title}</h2>
    </div>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-text-secondary">{label}</label>
      {children}
    </div>
  );
}

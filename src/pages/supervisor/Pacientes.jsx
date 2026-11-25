import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { AdesaoBar, Avatar, PageHeader, Panel, selectClass } from "../../components/supervisor/ui";
import { HUMORES, PACIENTES, formatUltimoAcesso } from "../../data/supervisorMock";

const POR_PAGINA = 5;

export default function Pacientes() {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [ordem, setOrdem] = useState("nome");
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = PACIENTES.filter(
      (p) =>
        (!termo || p.nome.toLowerCase().includes(termo) || p.email.toLowerCase().includes(termo)) &&
        (status === "todos" || (status === "ativos" ? p.ativo : !p.ativo))
    );
    const sorters = {
      nome: (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
      atividade: (a, b) => a.ultimoAcessoMin - b.ultimoAcessoMin,
      adesao: (a, b) => b.adesao - a.adesao,
    };
    return lista.sort(sorters[ordem]);
  }, [busca, status, ordem]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  function onFiltro(setter) {
    return (e) => {
      setter(e.target.value);
      setPagina(1);
    };
  }

  return (
    <>
      <PageHeader title="Pacientes" subtitle={`${PACIENTES.length} pacientes acompanhados`} />

      <Panel className="mb-4 hover:shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={busca}
              onChange={onFiltro(setBusca)}
              placeholder="Buscar por nome ou e-mail"
              aria-label="Buscar paciente"
              className={`${selectClass} w-full pl-10`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex">
            <select value={status} onChange={onFiltro(setStatus)} aria-label="Status" className={selectClass}>
              <option value="todos">Status: Todos</option>
              <option value="ativos">Status: Ativos</option>
              <option value="inativos">Status: Inativos</option>
            </select>
            <select value={ordem} onChange={onFiltro(setOrdem)} aria-label="Ordenar por" className={selectClass}>
              <option value="nome">Ordenar: Nome</option>
              <option value="atividade">Ordenar: Última atividade</option>
              <option value="adesao">Ordenar: Adesão</option>
            </select>
          </div>
        </div>
      </Panel>

      <Panel className="overflow-hidden p-0 hover:shadow-sm">
        {visiveis.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={Users} title="Nenhum paciente encontrado" description="Tente ajustar a busca ou os filtros." />
          </div>
        ) : (
          <>
            {/* Tabela (md+) */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    <th className="px-5 py-3">Paciente</th>
                    <th className="px-3 py-3">Idade</th>
                    <th className="px-3 py-3">Último acesso</th>
                    <th className="px-3 py-3 text-center">Humor</th>
                    <th className="px-3 py-3">Hidratação</th>
                    <th className="px-3 py-3 w-44">Adesão</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visiveis.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar nome={p.nome} size="sm" seed={p.id} />
                          <div>
                            <p className="font-medium text-text-primary">{p.nome}</p>
                            <StatusChip ativo={p.ativo} />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-text-secondary">{p.idade} anos</td>
                      <td className="px-3 py-3 text-text-secondary">{formatUltimoAcesso(p.ultimoAcessoMin)}</td>
                      <td className="px-3 py-3 text-center text-xl" title={HUMORES[p.humor].label}>
                        {HUMORES[p.humor].emoji}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-text-secondary">
                        {p.copos}/{p.meta}
                      </td>
                      <td className="px-3 py-3">
                        <AdesaoBar value={p.adesao} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <DetalhesLink id={p.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards (mobile) */}
            <ul className="divide-y divide-border md:hidden">
              {visiveis.map((p) => (
                <li key={p.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar nome={p.nome} seed={p.id} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-text-primary">{p.nome}</p>
                      <p className="text-xs text-text-secondary">
                        {p.idade} anos · {formatUltimoAcesso(p.ultimoAcessoMin)}
                      </p>
                    </div>
                    <span className="text-2xl" title={HUMORES[p.humor].label}>{HUMORES[p.humor].emoji}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
                    <span className="shrink-0">💧 {p.copos}/{p.meta}</span>
                    <div className="flex-1">
                      <AdesaoBar value={p.adesao} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <DetalhesLink id={p.id} full />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 text-sm">
          <p className="text-text-secondary">
            {filtrados.length === 0
              ? "0 resultados"
              : `${(paginaAtual - 1) * POR_PAGINA + 1}–${Math.min(paginaAtual * POR_PAGINA, filtrados.length)} de ${filtrados.length}`}
          </p>
          <div className="flex items-center gap-1">
            <PageBtn onClick={() => setPagina(paginaAtual - 1)} disabled={paginaAtual === 1} label="Página anterior">
              <ChevronLeft size={16} />
            </PageBtn>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <PageBtn key={n} onClick={() => setPagina(n)} active={n === paginaAtual} label={`Página ${n}`}>
                {n}
              </PageBtn>
            ))}
            <PageBtn onClick={() => setPagina(paginaAtual + 1)} disabled={paginaAtual === totalPaginas} label="Próxima página">
              <ChevronRight size={16} />
            </PageBtn>
          </div>
        </div>
      </Panel>
    </>
  );
}

function StatusChip({ ativo }) {
  return (
    <span className={`text-xs ${ativo ? "text-accent" : "text-text-muted"}`}>{ativo ? "● Ativo" : "○ Inativo"}</span>
  );
}

function DetalhesLink({ id, full = false }) {
  return (
    <Link
      to={`/supervisor/pacientes/${id}`}
      className={`inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary transition-all hover:border-accent hover:bg-accent-light hover:text-accent-hover dark:hover:text-accent ${
        full ? "w-full py-2" : ""
      }`}
    >
      Ver Detalhes
    </Link>
  );
}

function PageBtn({ children, onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-accent text-white" : "text-text-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
      }`}
    >
      {children}
    </button>
  );
}

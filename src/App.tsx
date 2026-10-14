import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import Login from "./Login";
import { seedClients, seedReadme } from "./seedData";

type Page = "home" | "call-list" | "pipeline" | "readme";
type Stage = "research" | "coldCall" | "meetingSet" | "meetingHad" | "saleCall" | "sold";
type StageState = "not-done" | "pending" | "rejected" | "done";

type Client = {
  id: string;
  priority: string;
  business: string;
  category: string;
  address: string;
  phone: string;
  rating: number | null;
  reviews: number | null;
  reason: string;
  websiteChecked: string;
  called: string;
  outcome: string;
  followUpDate: string;
  notes: string;
  amountPaid: number | null;
  pipeline: Record<Stage, StageState>;
};

type ReadmeItem = { title: string; body: string };

const stages: { key: Stage; label: string }[] = [
  { key: "research", label: "Research" },
  { key: "coldCall", label: "Cold call" },
  { key: "meetingSet", label: "Meeting set" },
  { key: "meetingHad", label: "Meeting had" },
  { key: "saleCall", label: "Sale call" },
  { key: "sold", label: "Sold" },
];

const states: { key: StageState; label: string }[] = [
  { key: "not-done", label: "Not done" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
  { key: "done", label: "Done" },
];

const emptyPipeline = (): Record<Stage, StageState> => ({
  research: "not-done",
  coldCall: "not-done",
  meetingSet: "not-done",
  meetingHad: "not-done",
  saleCall: "not-done",
  sold: "not-done",
});

const emptyClient = (): Client => ({
  id: crypto.randomUUID(),
  priority: "B",
  business: "",
  category: "",
  address: "",
  phone: "",
  rating: null,
  reviews: null,
  reason: "",
  websiteChecked: "",
  called: "",
  outcome: "",
  followUpDate: "",
  notes: "",
  amountPaid: null,
  pipeline: emptyPipeline(),
});

function loadClients(): Client[] {
  try {
    const stored = localStorage.getItem("isleworth-clients-v1");
    if (stored) {
      return (JSON.parse(stored) as Client[]).map((client) => ({
        ...client,
        amountPaid: client.amountPaid ?? null,
        pipeline: { ...emptyPipeline(), ...client.pipeline },
      }));
    }
  } catch {
    // Seed data is a safe fallback if browser storage is unavailable.
  }
  return seedClients.map((client) => ({
    ...client,
    amountPaid: null,
    pipeline: { ...client.pipeline },
  })) as Client[];
}

function loadReadme(): ReadmeItem[] {
  const normalize = (items: ReadmeItem[]) => items
    .filter((item) => !["Website checked", "Website status"].includes(item.title))
    .map((item) => ({
      ...item,
      body: item.body
        .replace("Website checked?, ", "")
        .replace("Website checked? = No site | ", ""),
    }));
  try {
    const stored = localStorage.getItem("isleworth-readme-v1");
    if (stored) return normalize(JSON.parse(stored));
  } catch {
    // Seed data is a safe fallback if browser storage is unavailable.
  }
  return normalize(seedReadme
    .slice(1)
    .filter((row) => row.length > 1)
    .map((row) => ({ title: row[0], body: row[1] })) as ReadmeItem[]);
}

function Icon({
  name,
  size = 18,
}: {
  name: "home" | "phone" | "pipeline" | "book" | "plus" | "search" | "edit" | "close" | "star" | "map" | "chevron" | "menu" | "pound";
  size?: number;
}) {
  const paths: Record<string, ReactNode> = {
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92Z" />,
    pipeline: <><path d="M4 6h6M14 6h6M4 12h10M18 12h2M4 18h3M11 18h9" /><circle cx="12" cy="6" r="2" /><circle cx="16" cy="12" r="2" /><circle cx="9" cy="18" r="2" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    star: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2l-5-4.9 6.9-1Z" />,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" /><path d="M9 3v15M15 6v15" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    pound: <><path d="M8 21h10M6 12h9M8 21c3-3 3-7 2-11-.6-2.7.8-6 4.5-6 2.1 0 3.3 1 4.2 2.4" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function PolarisLogo({ size = 40 }: { size?: number }) {
  return (
    <svg className="polaris-logo" aria-hidden="true" width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="11" fill="#D5AA4F" />
      <path d="M20 4.5 23.2 16.8 20 20l-3.2-3.2L20 4.5Z" fill="#143F36" />
      <path d="m35.5 20-12.3 3.2L20 20l3.2-3.2L35.5 20ZM20 35.5l-3.2-12.3L20 20l3.2 3.2L20 35.5ZM4.5 20l12.3-3.2L20 20l-3.2 3.2L4.5 20Z" fill="#FFF9E9" />
      <path d="m20 15.4 4.6 4.6-4.6 4.6-4.6-4.6 4.6-4.6Z" fill="#3B2D21" />
    </svg>
  );
}

function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return <button className={`btn btn-${variant} ${className}`} {...props}>{children}</button>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, meta }: { label: string; value: string | number; meta: string }) {
  return <div className="stat-card"><span>{label}</span><strong>{value}</strong><small>{meta}</small></div>;
}

export default function App() {
  const initialHash = window.location.hash.replace("#/", "") as Page;
  const [page, setPage] = useState<Page>(["home", "call-list", "pipeline", "readme"].includes(initialHash) ? initialHash : "home");
  const [clients, setClients] = useState<Client[]>(loadClients);
  const [readme, setReadme] = useState<ReadmeItem[]>(loadReadme);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingGuide, setEditingGuide] = useState<{ index: number; item: ReadmeItem } | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => localStorage.setItem("isleworth-clients-v1", JSON.stringify(clients)), [clients]);
  useEffect(() => localStorage.setItem("isleworth-readme-v1", JSON.stringify(readme)), [readme]);
  useEffect(() => {
    document.title = "Polaris | Outreach CRM";
  }, []);
  useEffect(() => {
    window.location.hash = `/${page}`;
    window.scrollTo(0, 0);
  }, [page]);

  const navigate = (next: Page) => {
    setPage(next);
    setMobileNav(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const saveClient = (client: Client) => {
    setClients((current) => current.some((item) => item.id === client.id)
      ? current.map((item) => item.id === client.id ? client : item)
      : [client, ...current]);
    setEditingClient(null);
  };

  const removeClient = (id: string) => {
    setClients((current) => current.filter((client) => client.id !== id));
    setEditingClient(null);
  };

  const updateStage = (id: string, stage: Stage, state: StageState) => {
    setClients((current) => current.map((client) => {
      if (client.id !== id) return client;
      const stageIndex = stages.findIndex((item) => item.key === stage);
      const pipeline = { ...client.pipeline, [stage]: state };
      if (state !== "done") {
        stages.slice(stageIndex + 1).forEach((laterStage) => {
          pipeline[laterStage.key] = "not-done";
        });
      }
      return { ...client, pipeline };
    }));
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <button className="brand" onClick={() => navigate("home")} aria-label="Go to homepage">
          <PolarisLogo />
          <div><strong>Polaris</strong><span>Outreach CRM</span></div>
        </button>
        <nav aria-label="Primary navigation">
          <NavItem active={page === "home"} icon="home" label="Home" onClick={() => navigate("home")} />
          <NavItem active={page === "call-list"} icon="phone" label="Call list" onClick={() => navigate("call-list")} />
          <NavItem active={page === "pipeline"} icon="pipeline" label="Pipeline" onClick={() => navigate("pipeline")} />
          <NavItem active={page === "readme"} icon="book" label="Read me" onClick={() => navigate("readme")} />
        </nav>
        <div className="sidebar-note">
          <span className="status-dot" />
          <div><strong>Saved locally</strong><p>Your edits stay in this browser.</p></div>
        </div>
      </aside>

      {mobileNav && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}

      <main className="main">
        <header className="topbar">
          <Button variant="ghost" className="menu-button" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Icon name="menu" /></Button>
          <div className="topbar-context"><span>Polaris</span><Icon name="chevron" size={14} /><strong>Isleworth leads</strong></div>
          <div className="topbar-actions">
            <Button onClick={() => setEditingClient(emptyClient())}><Icon name="plus" /> Add client</Button>
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          </div>
        </header>

        <div className="content">
          {page === "home" && <Home clients={clients} onNavigate={navigate} />}
          {page === "call-list" && <CallList clients={clients} onEdit={setEditingClient} onAdd={() => setEditingClient(emptyClient())} />}
          {page === "pipeline" && <Pipeline clients={clients} onUpdate={updateStage} onEdit={setEditingClient} />}
          {page === "readme" && <ReadmePage clients={clients} items={readme} onEdit={(index) => setEditingGuide({ index, item: { ...readme[index] } })} />}
        </div>
      </main>

      {editingClient && <ClientModal client={editingClient} isExisting={clients.some((item) => item.id === editingClient.id)} onSave={saveClient} onDelete={removeClient} onClose={() => setEditingClient(null)} />}
      {editingGuide && <GuideModal value={editingGuide.item} onClose={() => setEditingGuide(null)} onSave={(item) => {
        setReadme((current) => current.map((entry, index) => index === editingGuide.index ? item : entry));
        setEditingGuide(null);
      }} />}
    </div>
  );
}

function NavItem({ active, icon, label, onClick }: { active: boolean; icon: "home" | "phone" | "pipeline" | "book"; label: string; onClick: () => void }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}><Icon name={icon} /><span>{label}</span></button>;
}

function Home({ clients, onNavigate }: { clients: Client[]; onNavigate: (page: Page) => void }) {
  const callsMade = clients.filter((client) => client.called.toLowerCase() === "yes" || client.pipeline.coldCall === "done").length;
  const callPercentage = Math.round((callsMade / Math.max(clients.length, 1)) * 100);
  const followUps = clients.filter((client) => client.followUpDate).length;
  const sold = clients.filter((client) => client.pipeline.sold === "done" || client.outcome.toLowerCase() === "sold").length;
  const revenue = clients.reduce((total, client) => total + (client.amountPaid ?? 0), 0);
  const recentProspects = clients.slice(0, 5);

  return (
    <>
      <section className="home-hero">
        <div>
          <div className="hero-brand"><PolarisLogo size={27} /><span>Polaris</span></div>
          <h1>Your local sales desk,<br /><em>all in one place.</em></h1>
          <p>Track every conversation from first research to final payment, and keep your next opportunity in clear view.</p>
          <div className="hero-actions"><Button onClick={() => onNavigate("call-list")}><Icon name="phone" /> Open call list</Button><Button variant="secondary" onClick={() => onNavigate("pipeline")}>View pipeline <Icon name="chevron" size={15} /></Button></div>
        </div>
        <div className="revenue-card">
          <span>Total money made</span>
          <strong>{formatMoney(revenue)}</strong>
          <p>From {sold} completed {sold === 1 ? "sale" : "sales"}</p>
          <div className="revenue-mark"><Icon name="pound" size={26} /></div>
        </div>
      </section>

      <div className="home-metrics">
        <article className="metric-card featured"><div className="metric-top"><span>Calls made</span><strong>{callPercentage}%</strong></div><div className="progress-track"><i style={{ width: `${callPercentage}%` }} /></div><p>{callsMade} of {clients.length} prospects contacted</p></article>
        <article className="metric-card"><span>Follow-ups due</span><strong>{followUps}</strong><p>Scheduled conversations</p></article>
        <article className="metric-card"><span>Total prospects</span><strong>{clients.length}</strong><p>Across the outreach list</p></article>
        <article className="metric-card"><span>Sales made</span><strong>{sold}</strong><p>{clients.length ? Math.round((sold / clients.length) * 100) : 0}% conversion overall</p></article>
      </div>

      <div className="home-grid">
        <section className="panel home-panel">
          <div className="section-heading"><div><span>Recently added</span><h2>Prospects to review</h2></div><Button variant="ghost" onClick={() => onNavigate("call-list")}>View all <Icon name="chevron" size={14} /></Button></div>
          <div className="prospect-list">{recentProspects.map((client) => <div className="prospect-row" key={client.id}><span className={`priority priority-${client.priority.toLowerCase()}`}>{client.priority}</span><div><strong>{client.business}</strong><span>{client.category}</span></div><p>{client.phone}</p></div>)}</div>
        </section>
        <aside className="next-step-card">
          <span>Keep momentum</span>
          <h2>Work the list in order.</h2>
          <p>Research each prospect before making the call. Later pipeline stages unlock as each step is completed.</p>
          <Button onClick={() => onNavigate("pipeline")}>Continue pipeline <Icon name="chevron" size={15} /></Button>
        </aside>
      </div>
    </>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);
}

function CallList({ clients, onEdit, onAdd }: { clients: Client[]; onEdit: (client: Client) => void; onAdd: () => void }) {
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("All");
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...Array.from(new Set(clients.map((client) => client.category))).sort()], [clients]);
  const filtered = useMemo(() => clients.filter((client) => {
    const haystack = `${client.business} ${client.category} ${client.address} ${client.phone}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (priority === "All" || client.priority === priority) && (category === "All" || client.category === category);
  }), [clients, query, priority, category]);
  const called = clients.filter((client) => client.called.toLowerCase() === "yes").length;
  const followUps = clients.filter((client) => client.followUpDate).length;
  const revenue = clients.reduce((total, client) => total + (client.amountPaid ?? 0), 0);

  return (
    <>
      <PageHeader eyebrow="Prospect database" title="Call list" description="Research, qualify and follow up with independent businesses across Isleworth." action={<Button onClick={onAdd}><Icon name="plus" /> Add client</Button>} />
      <div className="stats-grid">
        <StatCard label="Total prospects" value={clients.length} meta="Across all priorities" />
        <StatCard label="Calls made" value={called} meta={`${clients.length - called} still to contact`} />
        <StatCard label="Follow-ups due" value={followUps} meta="Scheduled conversations" />
        <StatCard label="Revenue" value={formatMoney(revenue)} meta="Total amount paid" />
      </div>
      <section className="panel">
        <div className="toolbar">
          <div className="search-box"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by business, category or postcode…" /></div>
          <select aria-label="Filter by priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option>All</option><option>A</option><option>B</option><option>C</option></select>
          <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          <div className="result-count">{filtered.length} results</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Priority</th><th>Business</th><th>Contact</th><th>Rating</th><th>Called</th><th>Outcome</th><th>Amount paid</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id} onClick={() => onEdit(client)}>
                  <td><span className={`priority priority-${client.priority.toLowerCase()}`}>{client.priority}</span></td>
                  <td><div className="business-cell"><strong>{client.business}</strong><span>{client.category} · {client.address}</span></div></td>
                  <td><a href={`tel:${client.phone.replace(/\s/g, "")}`} onClick={(event) => event.stopPropagation()}>{client.phone}</a></td>
                  <td>{client.rating ? <span className="rating"><Icon name="star" size={14} /> {client.rating} <small>({client.reviews})</small></span> : <span className="muted">—</span>}</td>
                  <td><CellStatus value={client.called} /></td>
                  <td><span className="outcome">{client.outcome || "Not set"}</span></td>
                  <td><span className={client.amountPaid ? "money-value" : "muted"}>{client.amountPaid ? formatMoney(client.amountPaid) : "—"}</span></td>
                  <td><Button variant="ghost" aria-label={`Edit ${client.business}`}><Icon name="edit" size={16} /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="empty-state"><Icon name="search" size={26} /><strong>No clients found</strong><p>Try changing your search or filters.</p></div>}
        </div>
      </section>
    </>
  );
}

function CellStatus({ value }: { value: string }) {
  if (!value) return <span className="muted">Not set</span>;
  const tone = /yes|checked|done|no site/i.test(value) ? "positive" : /wrong|no$/i.test(value) ? "negative" : "neutral";
  return <span className={`cell-status ${tone}`}><span />{value}</span>;
}

function Pipeline({ clients, onUpdate, onEdit }: { clients: Client[]; onUpdate: (id: string, stage: Stage, state: StageState) => void; onEdit: (client: Client) => void }) {
  const [query, setQuery] = useState("");
  const filtered = clients.filter((client) => `${client.business} ${client.category}`.toLowerCase().includes(query.toLowerCase()));
  const sold = clients.filter((client) => client.pipeline.sold === "done").length;
  const active = clients.filter((client) => Object.values(client.pipeline).some((state) => state === "pending")).length;
  const rejected = clients.filter((client) => Object.values(client.pipeline).some((state) => state === "rejected")).length;
  return (
    <>
      <PageHeader eyebrow="Sales workflow" title="Client pipeline" description="Move every prospect through the six stages, from first research to a completed sale." />
      <div className="stats-grid three">
        <StatCard label="Active conversations" value={active} meta="At least one pending stage" />
        <StatCard label="Clients sold" value={sold} meta={`${Math.round((sold / Math.max(clients.length, 1)) * 100)}% of all prospects`} />
        <StatCard label="Rejected" value={rejected} meta="Needs review or closure" />
      </div>
      <section className="panel">
        <div className="toolbar pipeline-toolbar">
          <div className="search-box"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a client…" /></div>
          <div className="legend">{states.map((state) => <span key={state.key} className={`legend-${state.key}`}><i />{state.label}</span>)}</div>
        </div>
        <div className="table-wrap pipeline-table">
          <table>
            <thead><tr><th className="sticky-col">Client</th>{stages.map((stage, index) => <th key={stage.key}><span className="stage-number">{index + 1}</span>{stage.label}</th>)}</tr></thead>
            <tbody>{filtered.map((client) => <tr key={client.id}>
              <td className="sticky-col"><button className="client-link" onClick={() => onEdit(client)}><strong>{client.business}</strong><span>{client.category}</span></button></td>
              {stages.map((stage, index) => {
                const locked = index > 0 && client.pipeline[stages[index - 1].key] !== "done";
                return <td key={stage.key}><select disabled={locked} title={locked ? `Complete ${stages[index - 1].label} first` : undefined} className={`stage-select state-${client.pipeline[stage.key]} ${locked ? "stage-locked" : ""}`} aria-label={`${client.business}: ${stage.label}${locked ? " (locked)" : ""}`} value={client.pipeline[stage.key]} onChange={(event) => onUpdate(client.id, stage.key, event.target.value as StageState)}>{states.map((state) => <option key={state.key} value={state.key}>{state.label}</option>)}</select></td>;
              })}
            </tr>)}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function ReadmePage({ clients, items, onEdit }: { clients: Client[]; items: ReadmeItem[]; onEdit: (index: number) => void }) {
  const categories = new Set(clients.map((client) => client.category)).size;
  return (
    <>
      <PageHeader eyebrow="Workspace guide" title="How to use this list" description="Your editable playbook for researching, calling and converting local prospects." />
      <div className="readme-layout">
        <div className="guide-content">
          <div className="readme-hero">
            <div className="hero-icon"><Icon name="book" size={24} /></div>
            <div><span>Polaris workspace guide</span><h2>Turn local conversations into lasting clients.</h2><p>Start with priority A, verify each business online, then keep every call and follow-up recorded in one place.</p></div>
          </div>
          <div className="guide-grid">
            {items.map((item, index) => (
              <article className="guide-card" key={`${item.title}-${index}`}>
                <div className="guide-card-head"><h3>{item.title}</h3><Button variant="ghost" aria-label={`Edit ${item.title}`} onClick={() => onEdit(index)}><Icon name="edit" size={16} /></Button></div>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
        <aside className="readme-summary">
          <span className="summary-label">List at a glance</span>
          <strong>{clients.length}</strong><p>local prospects</p>
          <dl><div><dt>Priority A</dt><dd>{clients.filter((c) => c.priority === "A").length}</dd></div><div><dt>Priority B</dt><dd>{clients.filter((c) => c.priority === "B").length}</dd></div><div><dt>Priority C</dt><dd>{clients.filter((c) => c.priority === "C").length}</dd></div><div><dt>Categories</dt><dd>{categories}</dd></div></dl>
          <div className="summary-tip"><Icon name="map" /><p><strong>Local focus</strong>Businesses are centred around Isleworth and nearby West London.</p></div>
        </aside>
      </div>
    </>
  );
}

function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={`field ${wide ? "field-wide" : ""}`}><span>{label}</span>{children}</label>;
}

function ClientModal({ client, isExisting, onSave, onDelete, onClose }: { client: Client; isExisting: boolean; onSave: (client: Client) => void; onDelete: (id: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Client>({ ...client, pipeline: { ...client.pipeline } });
  const set = (key: keyof Client, value: string | number | null) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (draft.business.trim()) onSave(draft);
  };
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="client-modal-title">
        <div className="modal-head"><div><span>{isExisting ? "Client record" : "New prospect"}</span><h2 id="client-modal-title">{isExisting ? draft.business : "Add a client"}</h2></div><Button variant="ghost" aria-label="Close" onClick={onClose}><Icon name="close" /></Button></div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="Business name" wide><input required value={draft.business} onChange={(e) => set("business", e.target.value)} /></Field>
            <Field label="Priority"><select value={draft.priority} onChange={(e) => set("priority", e.target.value)}><option>A</option><option>B</option><option>C</option></select></Field>
            <Field label="Category"><input value={draft.category} onChange={(e) => set("category", e.target.value)} /></Field>
            <Field label="Phone"><input value={draft.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Address"><input value={draft.address} onChange={(e) => set("address", e.target.value)} /></Field>
            <Field label="Google rating"><input type="number" min="0" max="5" step="0.1" value={draft.rating ?? ""} onChange={(e) => set("rating", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Review count"><input type="number" min="0" value={draft.reviews ?? ""} onChange={(e) => set("reviews", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Called?"><select value={draft.called} onChange={(e) => set("called", e.target.value)}><option value="">Not set</option><option>Yes</option><option>No</option><option>Wrong number</option><option>No answer</option></select></Field>
            <Field label="Outcome"><select value={draft.outcome} onChange={(e) => set("outcome", e.target.value)}><option value="">Not set</option><option>Interested</option><option>Send mockup</option><option>Call back</option><option>Not interested</option><option>Wrong number</option><option>Sold</option></select></Field>
            <Field label="Follow-up date"><input type="date" value={draft.followUpDate} onChange={(e) => set("followUpDate", e.target.value)} /></Field>
            <Field label="Why they’re on the list" wide><textarea rows={3} value={draft.reason} onChange={(e) => set("reason", e.target.value)} /></Field>
            <Field label="Notes" wide><textarea rows={3} value={draft.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
            <Field label="Amount paid (£)" wide><input type="number" min="0" step="0.01" value={draft.amountPaid ?? ""} onChange={(e) => set("amountPaid", e.target.value ? Number(e.target.value) : null)} placeholder="0.00" /></Field>
          </div>
          <div className="modal-actions">{isExisting ? <Button type="button" variant="danger" onClick={() => onDelete(draft.id)}>Delete client</Button> : <span />}<div><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">{isExisting ? "Save changes" : "Add client"}</Button></div></div>
        </form>
      </div>
    </div>
  );
}

function GuideModal({ value, onSave, onClose }: { value: ReadmeItem; onSave: (item: ReadmeItem) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(value);
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal modal-small" role="dialog" aria-modal="true"><div className="modal-head"><div><span>Edit guide</span><h2>Update this section</h2></div><Button variant="ghost" aria-label="Close" onClick={onClose}><Icon name="close" /></Button></div><form onSubmit={(event) => { event.preventDefault(); onSave(draft); }}><div className="form-grid"><Field label="Heading" wide><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></Field><Field label="Guidance" wide><textarea rows={7} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} /></Field></div><div className="modal-actions"><span /><div><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Save section</Button></div></div></form></div></div>;
}

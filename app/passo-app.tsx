"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  FileText,
  HelpCircle,
  Home,
  MapPin,
  Menu,
  Minus,
  MoreHorizontal,
  Plus,
  QrCode,
  ScanLine,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Ticket,
  Tickets,
  TrendingUp,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { adminSupabase, supabase } from "./supabase";

type EventItem = {
  slug: string;
  name: string;
  date: string;
  shortDate: string;
  category: string;
  venue: string;
  city: string;
  price: string;
  image: string;
  sold: string;
  revenue: string;
  status: string;
};

const events: EventItem[] = [
  {
    slug: "concierto-bajo-las-estrellas",
    name: "Concierto bajo las estrellas",
    date: "Sábado, 18 de octubre · 20:30",
    shortDate: "18 OCT",
    category: "Música",
    venue: "Movistar Arena",
    city: "Santiago",
    price: "$15.000",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=85",
    sold: "428 / 500",
    revenue: "$8.420.000",
    status: "Activo",
  },
  {
    slug: "festival-primavera",
    name: "Festival Primavera",
    date: "Sábado, 25 de octubre · 12:00",
    shortDate: "25 OCT",
    category: "Experiencias",
    venue: "Parque Bicentenario",
    city: "Vitacura",
    price: "$22.000",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=85",
    sold: "712 / 1.000",
    revenue: "$7.100.000",
    status: "Activo",
  },
  {
    slug: "experiencia-nocturna",
    name: "Experiencia Nocturna",
    date: "Viernes, 07 de noviembre · 21:00",
    shortDate: "07 NOV",
    category: "Experiencias",
    venue: "Centro Cultural",
    city: "Providencia",
    price: "$18.000",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=85",
    sold: "182 / 350",
    revenue: "$3.276.000",
    status: "Activo",
  },
  {
    slug: "final-cup",
    name: "Final Cup 2026",
    date: "Domingo, 16 de noviembre · 18:30",
    shortDate: "16 NOV",
    category: "Deportes",
    venue: "Estadio Nacional",
    city: "Ñuñoa",
    price: "$12.000",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=85",
    sold: "3.240 / 5.000",
    revenue: "$38.880.000",
    status: "Activo",
  },
  {
    slug: "summer-sessions",
    name: "Summer Sessions",
    date: "Sábado, 06 de diciembre · 17:00",
    shortDate: "06 DIC",
    category: "Música",
    venue: "Club Hípico",
    city: "Santiago",
    price: "$25.000",
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=85",
    sold: "95 / 800",
    revenue: "$2.375.000",
    status: "Borrador",
  },
  {
    slug: "noche-de-jazz",
    name: "Noche de Jazz",
    date: "Jueves, 11 de diciembre · 20:00",
    shortDate: "11 DIC",
    category: "Cultura",
    venue: "Teatro Municipal",
    city: "Santiago",
    price: "$20.000",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=85",
    sold: "240 / 240",
    revenue: "$4.800.000",
    status: "Agotado",
  },
];

const ADMIN_EMAILS = new Set(["creativovisualchile@gmail.com"]);

const money = (n: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
const go = (path: string) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function Button({
  children,
  variant = "primary",
  onClick,
  disabled = false,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  variant?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
}
function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <button
      className={`logo ${inverse ? "logo-inverse" : ""}`}
      onClick={() => go("/")}
      aria-label="Ir al inicio"
    >
      <img
        src={inverse ? "/uxora-logo-white.png" : "/uxora-logo.svg"}
        alt="UXORA TICKETING DEMO"
      />
    </button>
  );
}

function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  const logout = async () => {
    await supabase.auth.signOut();
    go("/");
  };
  return (
    <header className="public-header">
      <div className="header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Navegación principal">
          <button onClick={() => go("/eventos")}>Eventos</button>
          <button onClick={() => go("/eventos")}>Descubre</button>
          <button onClick={() => go("/mis-entradas")}>Mis entradas</button>
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <button className="user-pill" onClick={() => go("/mis-entradas")}>
                <span className="avatar">
                  {(user.user_metadata?.full_name || user.email || "U")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <span>{user.user_metadata?.full_name || user.email}</span>
              </button>
              <Button variant="ghost" onClick={logout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => go("/auth/login")}>
                Iniciar sesión
              </Button>
              <Button onClick={() => go("/auth/registro")}>Crear cuenta</Button>
            </>
          )}
        </div>
        <button
          className="menu-btn"
          aria-label="Abrir menú"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="mobile-nav">
          <button onClick={() => go("/eventos")}>Eventos</button>
          <button onClick={() => go("/mis-entradas")}>Mis entradas</button>
          {user ? (
            <>
              <button onClick={() => go("/mis-entradas")}>{user.email}</button>
              <Button variant="outline" onClick={logout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <button onClick={() => go("/auth/login")}>Iniciar sesión</button>
              <Button onClick={() => go("/auth/registro")}>Crear cuenta</Button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

function GoogleMark() {
  return (
    <span className="google-mark" aria-hidden="true">
      G
    </span>
  );
}
function AuthPage({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = register
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${location.origin}/mis-entradas`,
          },
        })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error.message });
      return;
    }
    if (register && !result.data.session) {
      setMessage({
        type: "success",
        text: "Cuenta creada. Revisa tu correo para confirmar el registro.",
      });
      return;
    }
    go("/mis-entradas");
  };
  const google = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/mis-entradas` },
    });
    if (error) {
      setBusy(false);
      setMessage({ type: "error", text: error.message });
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo inverse />
        <div>
          <span className="eyebrow">TU PRÓXIMA EXPERIENCIA</span>
          <h2>Momentos que vale la pena vivir.</h2>
        </div>
      </div>
      <main className="auth-panel">
        <button
          className="auth-close"
          onClick={() => go("/")}
          aria-label="Cerrar"
        >
          <X />
        </button>
        <div className="auth-box">
          <span className="eyebrow">CUENTA UXORA TICKETING DEMO</span>
          <h1>{register ? "Crea tu cuenta" : "Qué bueno verte"}</h1>
          <p>
            {register
              ? "Guarda tus entradas y descubre nuevas experiencias."
              : "Ingresa para ver tus entradas y continuar."}
          </p>
          <Button
            variant="outline"
            className="google-btn full"
            onClick={google}
            disabled={busy}
          >
            <GoogleMark /> Continuar con Google
          </Button>
          <div className="auth-divider">
            <span>o continúa con email</span>
          </div>
          <form onSubmit={submit}>
            {register && (
              <label className="field">
                <span>Nombre</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="name"
                />
              </label>
            )}
            <label className="field">
              <span>Email</span>
              <input
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </label>
            <label className="field">
              <span>Contraseña</span>
              <input
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete={register ? "new-password" : "current-password"}
              />
            </label>
            {message && (
              <div role="status" className={`auth-message ${message.type}`}>
                {message.type === "error" ? <XCircle /> : <CheckCircle2 />}
                {message.text}
              </div>
            )}
            <Button type="submit" className="full" disabled={busy}>
              {busy
                ? "Procesando..."
                : register
                  ? "Crear cuenta"
                  : "Iniciar sesión"}
              <ArrowRight />
            </Button>
          </form>
          <p className="auth-switch">
            {register ? "¿Ya tienes una cuenta?" : "¿Aún no tienes cuenta?"}{" "}
            <button
              onClick={() => go(register ? "/auth/login" : "/auth/registro")}
            >
              {register ? "Inicia sesión" : "Créala aquí"}
            </button>
          </p>
          {!register && (
            <button
              className="forgot"
              onClick={async () => {
                if (!email) {
                  setMessage({
                    type: "error",
                    text: "Escribe tu email para recuperar la contraseña.",
                  });
                  return;
                }
                const { error } = await supabase.auth.resetPasswordForEmail(
                  email,
                  { redirectTo: `${location.origin}/auth/login` },
                );
                setMessage(
                  error
                    ? { type: "error", text: error.message }
                    : {
                        type: "success",
                        text: "Te enviamos un enlace para restablecer tu contraseña.",
                      },
                );
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const {
      data,
      result,
      error: authError,
    } = Object.assign(
      { result: null },
      await adminSupabase.auth.signInWithPassword({ email, password }),
    );
    setBusy(false);
    if (authError) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    if (!ADMIN_EMAILS.has(data.user?.email?.toLowerCase() ?? "")) {
      await adminSupabase.auth.signOut();
      setError("Esta cuenta no tiene permisos de administrador.");
      return;
    }
    go("/admin");
  };
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo inverse />
        <div>
          <span className="eyebrow">GESTIÓN UXORA TICKETING DEMO</span>
          <h2>Administra eventos, ventas y accesos.</h2>
        </div>
      </div>
      <main className="auth-panel">
        <button
          className="auth-close"
          onClick={() => go("/")}
          aria-label="Cerrar"
        >
          <X />
        </button>
        <div className="auth-box">
          <span className="eyebrow">ACCESO ADMINISTRATIVO</span>
          <h1>Panel de gestión</h1>
          <p>Ingresa con una cuenta administradora autorizada.</p>
          <form onSubmit={submit}>
            <label className="field">
              <span>Email</span>
              <input
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="username"
              />
            </label>
            <label className="field">
              <span>Contraseña</span>
              <input
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
              />
            </label>
            {error && (
              <div role="alert" className="auth-message error">
                <XCircle />
                {error}
              </div>
            )}
            <Button type="submit" className="full" disabled={busy}>
              {busy ? "Comprobando..." : "Entrar al panel"}
              <ArrowRight />
            </Button>
          </form>
          <button className="forgot" onClick={() => go("/")}>
            Volver al sitio
          </button>
        </div>
      </main>
    </div>
  );
}

function Protected({
  user,
  loading,
  children,
  admin = false,
}: {
  user: SupabaseUser | null;
  loading: boolean;
  children: React.ReactNode;
  admin?: boolean;
}) {
  if (loading)
    return (
      <div className="auth-loading">
        <div className="spinner" />
        <p>Comprobando tu sesión...</p>
      </div>
    );
  if (!user)
    return (
      <div className="auth-required">
        <Logo />
        <ShieldCheck />
        <h1>
          {admin ? "Acceso administrativo" : "Inicia sesión para continuar"}
        </h1>
        <p>
          {admin
            ? "El dashboard está protegido. Ingresa con una cuenta autorizada."
            : "Tus entradas estarán disponibles de forma segura en tu cuenta."}
        </p>
        <Button onClick={() => go(admin ? "/admin/login" : "/auth/login")}>
          Iniciar sesión <ArrowRight />
        </Button>
        <Button variant="ghost" onClick={() => go("/")}>
          Volver al inicio
        </Button>
      </div>
    );
  if (admin && !ADMIN_EMAILS.has(user.email?.toLowerCase() ?? ""))
    return (
      <div className="auth-required">
        <Logo />
        <ShieldCheck />
        <h1>Acceso denegado</h1>
        <p>Tu cuenta no tiene permisos para entrar al panel administrativo.</p>
        <Button
          onClick={async () => {
            await adminSupabase.auth.signOut();
            go("/admin/login");
          }}
        >
          Usar otra cuenta
        </Button>
        <Button variant="ghost" onClick={() => go("/")}>
          Volver al inicio
        </Button>
      </div>
    );
  return <>{children}</>;
}
function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <Logo inverse />
          <p>Experiencias que se quedan contigo.</p>
        </div>
        <div className="footer-links">
          <button onClick={() => go("/eventos")}>Eventos</button>
          <button>Ayuda</button>
          <button>Términos</button>
          <button>Privacidad</button>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 UXORA TICKETING DEMO <span>Instagram · LinkedIn · X</span>
      </div>
    </footer>
  );
}
function EventCard({
  event,
  featured = false,
}: {
  event: EventItem;
  featured?: boolean;
}) {
  return (
    <article
      className={`event-card ${featured ? "featured-card" : ""}`}
      onClick={() => go(`/eventos/${event.slug}`)}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && go(`/eventos/${event.slug}`)}
    >
      <div className="event-image">
        <img src={event.image} alt="" />
        <div className="date-tile">
          {event.shortDate.split(" ").map((x, i) => (
            <span key={x} className={i === 0 ? "day" : "month"}>
              {x}
            </span>
          ))}
        </div>
        <Badge>{event.category}</Badge>
      </div>
      <div className="event-card-body">
        <h3>{event.name}</h3>
        <p>
          <MapPin /> {event.venue}, {event.city}
        </p>
        <div className="event-card-foot">
          <span>
            Desde <strong>{event.price}</strong>
          </span>
          <span className="text-link">
            Ver evento <ArrowRight />
          </span>
        </div>
      </div>
    </article>
  );
}
function Stepper({ active = 1 }: { active?: number }) {
  return (
    <div className="stepper">
      {["Entradas", "Datos", "Pago", "Confirmación"].map((x, i) => (
        <div key={x} className={i + 1 <= active ? "step active" : "step"}>
          <span>{i + 1 < active ? <Check /> : i + 1}</span>
          <small>{x}</small>
        </div>
      ))}
    </div>
  );
}

function HomePage() {
  const [hero, setHero] = useState({
    title: "Vive más. Descubre más.",
    subtitle:
      "Encuentra eventos, experiencias y momentos que vale la pena vivir.",
    image: events[0].image,
  });
  useEffect(() => {
    supabase
      .from("site_settings")
      .select("hero_title,hero_subtitle,hero_image_url")
      .eq("id", "main")
      .maybeSingle()
      .then(({ data }) => {
        if (data)
          setHero({
            title: data.hero_title || hero.title,
            subtitle: data.hero_subtitle || hero.subtitle,
            image: data.hero_image_url || hero.image,
          });
      });
  }, []);
  return (
    <>
      <PublicHeader />
      <main>
        <section className="hero">
          <div className="hero-bg">
            <img src={hero.image} alt="Evento destacado" />
          </div>
          <div className="hero-overlay" />
          <div className="hero-content">
            <Badge tone="accent">
              <Sparkles /> Experiencias seleccionadas
            </Badge>
            <h1>{hero.title}</h1>
            <p>{hero.subtitle}</p>
            <Button variant="accent" onClick={() => go("/eventos")}>
              Explorar eventos <ArrowRight />
            </Button>
          </div>
          <button
            className="hero-feature"
            onClick={() => go(`/eventos/${events[0].slug}`)}
          >
            <span>Evento destacado</span>
            <strong>{events[0].name}</strong>
            <small>
              {events[0].shortDate} · {events[0].venue}
            </small>
          </button>
        </section>
        <section className="section">
          <div className="section-head">
            <div>
              <span className="eyebrow">Selección UXORA TICKETING DEMO</span>
              <h2>Eventos destacados</h2>
            </div>
            <button className="text-link" onClick={() => go("/eventos")}>
              Ver todos <ArrowRight />
            </button>
          </div>
          <div className="featured-grid">
            {events.slice(0, 3).map((e, i) => (
              <EventCard event={e} featured={i === 0} key={e.slug} />
            ))}
          </div>
        </section>
        <section className="section upcoming">
          <div className="section-head">
            <div>
              <span className="eyebrow">Agenda</span>
              <h2>Próximos eventos</h2>
            </div>
          </div>
          <div className="event-grid">
            {events.slice(2, 6).map((e) => (
              <EventCard event={e} key={e.slug} />
            ))}
          </div>
        </section>
        <section className="cta-section">
          <div>
            <span className="eyebrow">Haz un plan inolvidable</span>
            <h2>
              Tu próxima experiencia
              <br />
              comienza aquí.
            </h2>
          </div>
          <Button variant="accent" onClick={() => go("/eventos")}>
            Explorar eventos <ArrowRight />
          </Button>
        </section>
      </main>
      <Footer />
    </>
  );
}

function EventsPage() {
  const [filter, setFilter] = useState("Todos");
  const [query, setQuery] = useState("");
  const filtered = events.filter(
    (e) =>
      (filter === "Todos" || e.category === filter) &&
      e.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PublicHeader />
      <main className="listing-page">
        <div className="listing-hero">
          <span className="eyebrow">Tu agenda empieza aquí</span>
          <h1>Todos los eventos</h1>
          <p>Encuentra algo que quieras recordar.</p>
        </div>
        <div className="filters">
          <div className="filter-tabs">
            {["Todos", "Música", "Deportes", "Cultura", "Experiencias"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={filter === f ? "active" : ""}
                >
                  {f}
                </button>
              ),
            )}
          </div>
          <label className="search-box">
            <Search />
            <span className="sr-only">Buscar eventos</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar eventos"
            />
          </label>
        </div>
        {filtered.length ? (
          <div className="event-grid catalog-grid">
            {filtered.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No encontramos eventos"
            text="Prueba con otra búsqueda o categoría."
          />
        )}
      </main>
      <Footer />
    </>
  );
}

function EventDetail() {
  const slug = location.pathname.split("/").pop();
  const event = events.find((e) => e.slug === slug) || events[0];
  const [qty, setQty] = useState(1);
  const [ticket, setTicket] = useState("General");
  const prices: Record<string, number> = {
    General: 15000,
    VIP: 30000,
    Premium: 50000,
  };
  return (
    <>
      <PublicHeader />
      <main className="detail-page">
        <button className="back-link" onClick={() => go("/eventos")}>
          <ArrowLeft /> Todos los eventos
        </button>
        <section className="detail-hero">
          <img src={event.image} alt="" />
          <div className="detail-title">
            <Badge tone="accent">{event.category}</Badge>
            <h1>{event.name}</h1>
            <p>
              <CalendarDays /> {event.date}
            </p>
            <p>
              <MapPin /> {event.venue}, {event.city}
            </p>
          </div>
        </section>
        <div className="detail-layout">
          <div className="detail-main">
            <section>
              <span className="eyebrow">Sobre el evento</span>
              <h2>Una noche para recordar</h2>
              <p className="lead">
                Música en vivo, una puesta en escena inolvidable y una atmósfera
                única. Ven a compartir una experiencia diseñada para conectar,
                celebrar y disfrutar.
              </p>
              <div className="info-grid">
                <div>
                  <Clock3 />
                  <span>
                    <small>Fecha y hora</small>
                    {event.date}
                  </span>
                </div>
                <div>
                  <MapPin />
                  <span>
                    <small>Lugar</small>
                    {event.venue}
                    <br />
                    Av. Beauchef 1204, Santiago
                  </span>
                </div>
              </div>
            </section>
            <section className="tickets-section">
              <span className="eyebrow">Entradas</span>
              <h2>Elige tus entradas</h2>
              {Object.entries(prices).map(([name, price], i) => (
                <label
                  key={name}
                  className={`ticket-option ${ticket === name ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="ticket"
                    checked={ticket === name}
                    onChange={() => setTicket(name)}
                  />
                  <span className="radio-dot" />
                  <span className="ticket-info">
                    <strong>{name}</strong>
                    <small>
                      {i === 0
                        ? "Acceso general al evento"
                        : i === 1
                          ? "Acceso preferencial y barra exclusiva"
                          : "La experiencia completa, sin filas"}
                    </small>
                    <em>
                      {i === 2
                        ? "Quedan 12 entradas"
                        : `Quedan ${42 - i * 15} entradas`}
                    </em>
                  </span>
                  <strong>{money(price)}</strong>
                </label>
              ))}
            </section>
          </div>
          <aside className="purchase-card">
            <span className="eyebrow">Tu selección</span>
            <h3>{ticket}</h3>
            <div className="qty-row">
              <span>Cantidad</span>
              <div className="counter">
                <button
                  aria-label="Restar entrada"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  <Minus />
                </button>
                <strong>{qty}</strong>
                <button
                  aria-label="Sumar entrada"
                  onClick={() => setQty(Math.min(6, qty + 1))}
                >
                  <Plus />
                </button>
              </div>
            </div>
            <div className="summary-line">
              <span>Total</span>
              <strong>{money(prices[ticket] * qty)}</strong>
            </div>
            <Button className="full" onClick={() => go("/checkout")}>
              Comprar <ArrowRight />
            </Button>
            <p className="secure">
              <ShieldCheck /> Compra protegida y pago seguro
            </p>
          </aside>
        </div>
      </main>
      <div className="mobile-buy">
        <span>
          <small>
            {qty} entrada{qty > 1 ? "s" : ""}
          </small>
          <strong>{money(prices[ticket] * qty)}</strong>
        </span>
        <Button onClick={() => go("/checkout")}>Comprar</Button>
      </div>
      <Footer />
    </>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} placeholder={placeholder} />
    </label>
  );
}
function OrderSummary({ button = true }: { button?: boolean }) {
  return (
    <div className="order-summary">
      <span className="eyebrow">Resumen</span>
      <div className="mini-event">
        <img src={events[0].image} alt="" />
        <div>
          <strong>{events[0].name}</strong>
          <small>18 oct · Movistar Arena</small>
        </div>
      </div>
      <div className="summary-list">
        <p>
          <span>Entrada General × 2</span>
          <strong>$30.000</strong>
        </p>
        <p>
          <span>Cargo de servicio</span>
          <strong>$3.000</strong>
        </p>
        <p className="total">
          <span>Total</span>
          <strong>$33.000</strong>
        </p>
      </div>
      {button && (
        <Button className="full" onClick={() => go("/checkout/pago")}>
          Continuar al pago <ArrowRight />
        </Button>
      )}
    </div>
  );
}
function Checkout() {
  return (
    <>
      <PublicHeader />
      <main className="checkout-page">
        <Stepper active={2} />
        <div className="checkout-layout">
          <section className="form-card">
            <span className="eyebrow">Paso 2 de 4</span>
            <h1>Datos del comprador</h1>
            <p>Te enviaremos las entradas y confirmación a tu email.</p>
            <form
              className="form-grid"
              onSubmit={(e) => {
                e.preventDefault();
                go("/checkout/pago");
              }}
            >
              <Field label="Nombre" placeholder="Juan" />
              <Field label="Apellido" placeholder="Pérez" />
              <Field label="Email" type="email" placeholder="juan@correo.cl" />
              <Field
                label="Teléfono"
                type="tel"
                placeholder="+56 9 1234 5678"
              />
              <Button type="submit" className="mobile-submit">
                Continuar al pago
              </Button>
            </form>
          </section>
          <OrderSummary />
        </div>
      </main>
    </>
  );
}
function Payment() {
  const [state, setState] = useState("approved");
  return (
    <>
      <PublicHeader />
      <main className="checkout-page">
        <Stepper active={3} />
        <div className="checkout-layout">
          <section className="form-card">
            <span className="eyebrow">Pago de demostración</span>
            <h1>Pago seguro</h1>
            <p>
              Elige un resultado para simular la respuesta de la pasarela de
              pago.
            </p>
            <div className="demo-notice">
              <ShieldCheck />
              <div>
                <strong>Entorno de demostración</strong>
                <p>No se realizará ningún cobro real.</p>
              </div>
            </div>
            <div className="payment-options">
              <label className={state === "approved" ? "selected" : ""}>
                <input
                  type="radio"
                  checked={state === "approved"}
                  onChange={() => setState("approved")}
                />
                <CheckCircle2 />
                <span>
                  <strong>Pago aprobado</strong>
                  <small>Continúa al comprobante y tus entradas.</small>
                </span>
              </label>
              <label
                className={state === "rejected" ? "selected rejected" : ""}
              >
                <input
                  type="radio"
                  checked={state === "rejected"}
                  onChange={() => setState("rejected")}
                />
                <XCircle />
                <span>
                  <strong>Pago rechazado</strong>
                  <small>Simula un error para volver a intentar.</small>
                </span>
              </label>
            </div>
            <Button
              className="full"
              variant={state === "rejected" ? "destructive" : "primary"}
              onClick={() =>
                state === "approved"
                  ? go("/compra/exito")
                  : alert("Pago rechazado. Prueba otra vez.")
              }
            >
              {state === "approved" ? "Confirmar pago demo" : "Simular rechazo"}{" "}
              <ArrowRight />
            </Button>
          </section>
          <OrderSummary button={false} />
        </div>
      </main>
    </>
  );
}
function Success() {
  return (
    <>
      <PublicHeader />
      <main className="success-page">
        <Stepper active={4} />
        <div className="success-card">
          <div className="success-icon">
            <Check />
          </div>
          <span className="eyebrow">Orden #ORD-10291</span>
          <h1>Compra realizada</h1>
          <p>
            Tu compra fue confirmada. Enviamos las entradas a{" "}
            <strong>juan@correo.cl</strong>.
          </p>
          <div className="receipt">
            <p>
              <span>Evento</span>
              <strong>Concierto bajo las estrellas</strong>
            </p>
            <p>
              <span>Fecha</span>
              <strong>18 octubre 2026</strong>
            </p>
            <p>
              <span>Entradas</span>
              <strong>2 × General</strong>
            </p>
            <p>
              <span>Total</span>
              <strong>$33.000</strong>
            </p>
          </div>
          <div className="button-row">
            <Button onClick={() => go("/mis-entradas")}>
              Ver mis entradas <Tickets />
            </Button>
            <Button variant="outline" onClick={() => go("/eventos")}>
              Volver a eventos
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}

function MyTickets() {
  return (
    <>
      <PublicHeader />
      <main className="listing-page">
        <div className="listing-hero compact">
          <span className="eyebrow">Tu cuenta</span>
          <h1>Mis entradas</h1>
          <p>Todo listo para tus próximas experiencias.</p>
        </div>
        <div className="my-tickets">
          {events.slice(0, 3).map((e, i) => (
            <article className="my-ticket" key={e.slug}>
              <img src={e.image} alt="" />
              <div className="my-ticket-body">
                <Badge tone={i === 2 ? "used" : "valid"}>
                  {i === 2 ? "Utilizada" : "Entrada válida"}
                </Badge>
                <h3>{e.name}</h3>
                <p>
                  <CalendarDays /> {e.date}
                </p>
                <p>
                  <MapPin /> {e.venue}
                </p>
                <div>
                  <span>
                    <small>Tipo</small>
                    {i === 0 ? "General" : "VIP"}
                  </span>
                  <span>
                    <small>Titular</small>Juan Pérez
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => go(`/ticket/TKT-8F72A9${i}`)}
                >
                  Ver ticket <ArrowRight />
                </Button>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
function QrPattern() {
  return (
    <div className="qr" aria-label="Código QR de demostración">
      {Array.from({ length: 81 }, (_, i) => (
        <i
          key={i}
          className={
            [
              0, 1, 2, 9, 11, 18, 19, 20, 6, 7, 8, 15, 17, 24, 25, 26, 54, 55,
              56, 63, 65, 72, 73, 74,
            ].includes(i) || (i * 7) % 13 < 5
              ? "on"
              : ""
          }
        />
      ))}
    </div>
  );
}
function DigitalTicket() {
  return (
    <div className="ticket-page">
      <div className="ticket-topbar">
        <Logo />
        <button onClick={() => go("/mis-entradas")}>
          <X />
        </button>
      </div>
      <main className="digital-ticket">
        <div className="ticket-photo">
          <img src={events[0].image} alt="" />
          <Badge tone="valid">
            <CheckCircle2 /> Entrada válida
          </Badge>
        </div>
        <div className="ticket-content">
          <span className="eyebrow">UXORA TICKETING DEMO PRESENTA</span>
          <h1>Concierto bajo las estrellas</h1>
          <div className="ticket-meta">
            <span>
              <small>Fecha</small>18 OCT 2026 · 20:30
            </span>
            <span>
              <small>Lugar</small>Movistar Arena
            </span>
            <span>
              <small>Entrada</small>VIP
            </span>
            <span>
              <small>Titular</small>Juan Pérez
            </span>
          </div>
          <div className="tear" />
          <QrPattern />
          <strong className="ticket-code">TKT-8F72A91</strong>
          <p className="qr-help">
            Presenta este código en el acceso. No compartas tu entrada.
          </p>
        </div>
      </main>
      <Button variant="outline" className="download">
        <Download /> Descargar entrada
      </Button>
    </div>
  );
}

const adminNav = [
  { label: "Dashboard", path: "/admin", icon: Home },
  { label: "Eventos", path: "/admin/events", icon: CalendarDays },
  { label: "Órdenes", path: "/admin/orders", icon: ShoppingBag },
  { label: "Tickets", path: "/admin/tickets", icon: Ticket },
  { label: "Check-in", path: "/admin/check-in", icon: ScanLine },
  { label: "Usuarios", path: "/admin/users", icon: Users },
  { label: "Configuración", path: "/admin/settings", icon: Settings },
];
function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  useEffect(() => {
    adminSupabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);
  const displayName =
    user?.user_metadata?.full_name || user?.email || "Administrador";
  const initials = displayName
    .split(/\s+/)
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const logout = async () => {
    await adminSupabase.auth.signOut();
    go("/admin/login");
  };
  return (
    <div className="admin-shell">
      <aside className={open ? "admin-side open" : "admin-side"}>
        <div className="admin-brand">
          <Logo inverse />
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        <nav>
          {adminNav.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              className={location.pathname === path ? "active" : ""}
              onClick={() => {
                go(path);
                setOpen(false);
              }}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <button>
            <HelpCircle /> Ayuda
          </button>
          <button onClick={logout} aria-label="Cerrar sesión">
            <span className="avatar">{initials}</span>
            <span>
              {displayName}
              <small>Cerrar sesión</small>
            </span>
            <X />
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-mobile-head">
          <button onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <Logo />
          <button
            className="avatar"
            onClick={logout}
            aria-label="Cerrar sesión"
          >
            {initials}
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="admin-page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>Datos en tiempo real</small>
    </div>
  );
}
function SalesChart() {
  const bars = [36, 54, 42, 68, 58, 82, 76, 91, 64, 88, 72, 96];
  return (
    <div className="chart-card">
      <div className="card-head">
        <div>
          <h3>Ventas</h3>
          <p>Últimos 30 días</p>
        </div>
        <button>
          Mensual <ChevronDown />
        </button>
      </div>
      <div className="bar-chart">
        {bars.map((h, i) => (
          <div key={i}>
            <span style={{ height: `${h}%` }} />
            <small>{i % 2 === 0 ? `${i + 1} oct` : ""}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
function EventTable({ type = "events" }: { type?: string }) {
  const orders = [
    {
      a: "#ORD-10291",
      b: "Juan Pérez",
      c: "Concierto bajo las estrellas",
      d: "2",
      e: "$30.000",
      f: "Pagada",
      g: "18/08/2026",
    },
    {
      a: "#ORD-10290",
      b: "María Soto",
      c: "Festival Primavera",
      d: "4",
      e: "$88.000",
      f: "Pagada",
      g: "18/08/2026",
    },
    {
      a: "#ORD-10289",
      b: "Diego López",
      c: "Final Cup 2026",
      d: "1",
      e: "$12.000",
      f: "Pendiente",
      g: "17/08/2026",
    },
  ];
  const tickets = [
    {
      a: "TKT-8F72A91",
      b: "Concierto bajo las estrellas",
      c: "Juan Pérez",
      d: "VIP",
      e: "Válida",
      f: "—",
      g: "18/10/2026",
    },
    {
      a: "TKT-92BX120",
      b: "Festival Primavera",
      c: "María Soto",
      d: "General",
      e: "Utilizada",
      f: "12:42",
      g: "25/10/2026",
    },
    {
      a: "TKT-71LA440",
      b: "Final Cup 2026",
      c: "Diego López",
      d: "General",
      e: "Cancelada",
      f: "—",
      g: "16/11/2026",
    },
  ];
  let heads = [
    "Evento",
    "Fecha",
    "Tickets vendidos",
    "Ingresos",
    "Estado",
    "Acciones",
  ];
  let rows: Array<Record<string, string>> = events
    .slice(0, 4)
    .map((e) => ({
      a: e.name,
      b: e.shortDate,
      c: e.sold,
      d: e.revenue,
      e: e.status,
      f: "•••",
    }));
  if (type === "orders") {
    heads = [
      "Orden",
      "Cliente",
      "Evento",
      "Entradas",
      "Total",
      "Estado",
      "Fecha",
    ];
    rows = orders;
  } else if (type === "tickets") {
    heads = [
      "Código",
      "Evento",
      "Titular",
      "Tipo",
      "Estado",
      "Check-in",
      "Fecha",
    ];
    rows = tickets;
  }
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {heads.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {Object.values(r).map((v, j) => (
                <td key={j} data-label={heads[j]}>
                  {j === 0 && type === "events" ? (
                    <strong>{v}</strong>
                  ) : j === (type === "events" ? 4 : 5) ? (
                    <Badge tone={String(v).toLowerCase()}>{v}</Badge>
                  ) : (
                    v
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function AdminDashboard() {
  const [name, setName] = useState("Administrador");
  const [stats, setStats] = useState({
    tickets: 0,
    revenue: 0,
    checkins: 0,
    events: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = async () => {
      const { data: userData } = await adminSupabase.auth.getUser();
      setName(
        userData.user?.user_metadata?.full_name ||
          userData.user?.email?.split("@")[0] ||
          "Administrador",
      );
      const [ticketsResult, ordersResult, checkinsResult, eventsResult] =
        await Promise.all([
          adminSupabase
            .from("tickets")
            .select("id", { count: "exact", head: true })
            .in("status", ["valid", "used"]),
          adminSupabase.from("orders").select("total").eq("status", "paid"),
          adminSupabase
            .from("checkins")
            .select("id", { count: "exact", head: true })
            .eq("result", "accepted"),
          adminSupabase
            .from("events")
            .select("id", { count: "exact", head: true })
            .eq("status", "published"),
        ]);
      const firstError =
        ticketsResult.error ||
        ordersResult.error ||
        checkinsResult.error ||
        eventsResult.error;
      if (firstError) {
        setError(firstError.message);
        setLoading(false);
        return;
      }
      setStats({
        tickets: ticketsResult.count ?? 0,
        revenue: (ordersResult.data ?? []).reduce(
          (sum, row) => sum + (row.total ?? 0),
          0,
        ),
        checkins: checkinsResult.count ?? 0,
        events: eventsResult.count ?? 0,
      });
      setLoading(false);
    };
    load();
  }, []);
  return (
    <AdminShell>
      <main className="admin-page">
        <AdminHeader
          title={`Buenos días, ${name}`}
          subtitle="Este es el resumen real de tu plataforma."
          action={
            <div className="date-filter">
              <CalendarDays /> Datos en vivo <ChevronDown />
            </div>
          }
        />
        <div className="stats-grid">
          <StatCard
            label="Entradas vendidas"
            value={loading ? "…" : String(stats.tickets)}
            icon={Tickets}
          />
          <StatCard
            label="Ingresos"
            value={loading ? "…" : money(stats.revenue)}
            icon={CircleDollarSign}
          />
          <StatCard
            label="Check-ins"
            value={loading ? "…" : String(stats.checkins)}
            icon={ScanLine}
          />
          <StatCard
            label="Eventos activos"
            value={loading ? "…" : String(stats.events)}
            icon={CalendarDays}
          />
        </div>
        {error ? (
          <div className="empty-state">
            <XCircle />
            <h3>No pudimos cargar los datos</h3>
            <p>{error}</p>
          </div>
        ) : !loading && stats.events === 0 ? (
          <div className="empty-state">
            <CalendarDays />
            <h3>Base de datos activa</h3>
            <p>
              Aún no hay eventos reales. Crea el primero desde la sección
              Eventos.
            </p>
            <Button onClick={() => go("/admin/events/new")}>
              Crear primer evento <ArrowRight />
            </Button>
          </div>
        ) : null}
      </main>
    </AdminShell>
  );
}
function AdminList({ type }: { type: "events" | "orders" | "tickets" }) {
  const meta = {
    events: ["Eventos", "Gestiona y monitorea tus eventos."],
    orders: ["Órdenes", "Revisa todas las compras de tu plataforma."],
    tickets: ["Tickets", "Administra las entradas emitidas y sus estados."],
  }[type];
  return (
    <AdminShell>
      <main className="admin-page">
        <AdminHeader
          title={meta[0]}
          subtitle={meta[1]}
          action={
            type === "events" ? (
              <Button onClick={() => go("/admin/events/new")}>
                <Plus /> Crear evento
              </Button>
            ) : undefined
          }
        />
        <div className="table-toolbar">
          <label className="search-box">
            <Search />
            <input
              placeholder={`Buscar ${type}...`}
              aria-label={`Buscar ${type}`}
            />
          </label>
          <div className="filter-actions">
            <button>
              Todos los estados <ChevronDown />
            </button>
            <button>
              Más recientes <ChevronDown />
            </button>
          </div>
        </div>
        <EventTable type={type} />
        <div className="pagination">
          <span>Mostrando 1–4 de 24</span>
          <div>
            <button>
              <ChevronLeft />
            </button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>
              <ChevronRight />
            </button>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}

function AdminEvents() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState("");
  const load = async () => {
    const { data, error } = await adminSupabase
      .from("events")
      .select("id,name,starts_at,venue,city,status,image_url")
      .order("starts_at");
    if (error) setError(error.message);
    else setRows(data ?? []);
  };
  useEffect(() => {
    load();
  }, []);
  const remove = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar ${name}? Esta acción no se puede deshacer.`))
      return;
    const { error } = await adminSupabase.from("events").delete().eq("id", id);
    if (error) setError(error.message);
    else load();
  };
  return (
    <AdminShell>
      <main className="admin-page">
        <AdminHeader
          title="Eventos"
          subtitle="Eventos reales almacenados en Supabase."
          action={
            <Button onClick={() => go("/admin/events/new")}>
              <Plus /> Crear evento
            </Button>
          }
        />
        {error && (
          <div className="auth-message error">
            <XCircle />
            {error}
          </div>
        )}
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Evento</th>
                <th>Fecha</th>
                <th>Lugar</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                  </td>
                  <td>{new Date(row.starts_at).toLocaleString("es-CL")}</td>
                  <td>
                    {row.venue}, {row.city}
                  </td>
                  <td>
                    <Badge tone={row.status}>{row.status}</Badge>
                  </td>
                  <td>
                    <Button
                      variant="destructive"
                      onClick={() => remove(row.id, row.name)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </AdminShell>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [roleName, setRoleName] = useState("");
  const [message, setMessage] = useState("");
  const load = async () => {
    const [u, r] = await Promise.all([
      adminSupabase
        .from("profiles")
        .select("id,email,full_name,role,created_at")
        .order("created_at", { ascending: false }),
      adminSupabase.from("roles").select("*").order("name"),
    ]);
    setUsers(u.data ?? []);
    setRoles(r.data ?? []);
    setMessage(u.error?.message || r.error?.message || "");
  };
  useEffect(() => {
    load();
  }, []);
  const changeRole = async (id: string, role: string) => {
    const { error } = await adminSupabase
      .from("profiles")
      .update({ role })
      .eq("id", id);
    setMessage(error?.message || "Rol actualizado.");
    load();
  };
  const createRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    const { error } = await adminSupabase
      .from("roles")
      .insert({
        name: roleName.trim(),
        description: "Rol personalizado",
        permissions: [],
      });
    setMessage(error?.message || "Rol creado.");
    setRoleName("");
    load();
  };
  return (
    <AdminShell>
      <main className="admin-page">
        <AdminHeader
          title="Usuarios y roles"
          subtitle="Administra usuarios registrados y sus permisos."
        />
        <section className="admin-form-section">
          <h3>Crear rol personalizado</h3>
          <form className="form-grid" onSubmit={createRole}>
            <label className="field">
              <span>Nombre del rol</span>
              <input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Ej: Productor"
              />
            </label>
            <Button type="submit">Crear rol</Button>
          </form>
          {roles.length > 0 && (
            <p>Roles personalizados: {roles.map((r) => r.name).join(", ")}</p>
          )}
        </section>
        {message && <div className="auth-message success">{message}</div>}
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol principal</th>
                <th>Registro</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.full_name || "Sin nombre"}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      disabled={user.role === "super_admin"}
                    >
                      <option value="customer">Cliente</option>
                      <option value="admin">Administrador</option>
                      <option value="super_admin">Super administrador</option>
                    </select>
                  </td>
                  <td>
                    {new Date(user.created_at).toLocaleDateString("es-CL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </AdminShell>
  );
}

async function uploadEventImage(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await adminSupabase.storage
    .from("event-images")
    .upload(path, file, { upsert: false });
  if (error) throw error;
  return adminSupabase.storage.from("event-images").getPublicUrl(path).data
    .publicUrl;
}

function AdminSettings() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    adminSupabase
      .from("site_settings")
      .select("*")
      .eq("id", "main")
      .single()
      .then(({ data, error }) => {
        if (error) setMessage(error.message);
        if (data) {
          setTitle(data.hero_title || "");
          setSubtitle(data.hero_subtitle || "");
          setImage(data.hero_image_url || "");
        }
      });
  }, []);
  const fileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setMessage("Subiendo imagen...");
      setImage(await uploadEventImage(file));
      setMessage("Imagen lista para guardar.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo subir");
    }
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await adminSupabase
      .from("site_settings")
      .upsert({
        id: "main",
        hero_title: title,
        hero_subtitle: subtitle,
        hero_image_url: image,
        updated_at: new Date().toISOString(),
      });
    setMessage(error?.message || "Banner actualizado.");
  };
  return (
    <AdminShell>
      <main className="admin-page form-admin">
        <AdminHeader
          title="Banner principal"
          subtitle="Controla el hero de la página pública."
        />
        <form onSubmit={save}>
          <section className="admin-form-section">
            <div className="form-grid">
              <label className="field">
                <span>Título</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Subtítulo</span>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </label>
              <label className="upload full-span">
                <FileText />
                <strong>Imagen del banner</strong>
                <small>JPG, PNG o WebP, máximo 10 MB</small>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={fileChange}
                />
              </label>
              {image && <img src={image} alt="Vista previa del banner" />}
            </div>
            <Button type="submit">Guardar banner</Button>
            {message && <p>{message}</p>}
          </section>
        </form>
      </main>
    </AdminShell>
  );
}

function NewEvent() {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    address: "",
    city: "Santiago",
    category: "Experiencias",
    image_url: "",
  });
  const [message, setMessage] = useState("");
  const set = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const fileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setMessage("Subiendo imagen...");
      set("image_url", await uploadEventImage(file));
      setMessage("Imagen cargada.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo subir");
    }
  };
  const save = async (status: "draft" | "published") => {
    if (!form.name || !form.slug || !form.date || !form.time || !form.venue) {
      setMessage("Completa nombre, slug, fecha, hora y lugar.");
      return;
    }
    const { error } = await adminSupabase
      .from("events")
      .insert({
        name: form.name,
        slug: form.slug,
        description: form.description,
        starts_at: new Date(`${form.date}T${form.time}`).toISOString(),
        venue: form.venue,
        address: form.address,
        city: form.city,
        category: form.category,
        image_url: form.image_url || null,
        status,
      });
    if (error) setMessage(error.message);
    else go("/admin/events");
  };
  return (
    <AdminShell>
      <main className="admin-page form-admin">
        <button className="back-link" onClick={() => go("/admin/events")}>
          <ArrowLeft /> Volver a eventos
        </button>
        <AdminHeader
          title="Crear evento"
          subtitle="Guarda el evento directamente en Supabase."
          action={
            <>
              <Button variant="outline" onClick={() => save("draft")}>
                Guardar borrador
              </Button>
              <Button onClick={() => save("published")}>Publicar evento</Button>
            </>
          }
        />
        <section className="admin-form-section">
          <h3>Información general</h3>
          <div className="form-grid">
            <label className="field">
              <span>Nombre</span>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Slug</span>
              <input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
              />
            </label>
            <label className="field full-span">
              <span>Descripción</span>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </label>
            <label className="upload full-span">
              <FileText />
              <strong>Imagen del evento</strong>
              <small>JPG, PNG o WebP, máximo 10 MB</small>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={fileChange}
              />
            </label>
            {form.image_url && <img src={form.image_url} alt="Vista previa" />}
          </div>
        </section>
        <section className="admin-form-section">
          <h3>Fecha y ubicación</h3>
          <div className="form-grid">
            <label className="field">
              <span>Fecha</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Hora</span>
              <input
                type="time"
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Lugar</span>
              <input
                value={form.venue}
                onChange={(e) => set("venue", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Dirección</span>
              <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Ciudad</span>
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </label>
          </div>
          {message && <p>{message}</p>}
        </section>
      </main>
    </AdminShell>
  );
}
function CheckIn() {
  const [status, setStatus] = useState<"idle" | "valid" | "used" | "invalid">(
    "idle",
  );
  return (
    <AdminShell>
      <main className="checkin-page">
        <div className="checkin-head">
          <div>
            <span className="eyebrow">UXORA TICKETING DEMO ACCESS</span>
            <h1>Control de acceso</h1>
            <p>Escanea el código QR de la entrada.</p>
          </div>
          <label>
            <span>Evento</span>
            <select>
              <option>Concierto bajo las estrellas</option>
            </select>
          </label>
        </div>
        {status === "idle" ? (
          <div className="scanner-card">
            <div className="scanner">
              <span className="corner c1" />
              <span className="corner c2" />
              <span className="corner c3" />
              <span className="corner c4" />
              <QrCode />
              <i />
            </div>
            <strong>Ubica el código dentro del marco</strong>
            <p>El escaneo comenzará automáticamente.</p>
            <Button onClick={() => setStatus("valid")}>
              <ScanLine /> Simular escaneo
            </Button>
            <button className="manual">Ingresar código manualmente</button>
          </div>
        ) : (
          <div className={`scan-result ${status}`}>
            <div className="result-status">
              {status === "valid" ? (
                <CheckCircle2 />
              ) : status === "used" ? (
                <Clock3 />
              ) : (
                <XCircle />
              )}
              <span>
                <small>ESTADO</small>
                {status === "valid"
                  ? "Entrada válida"
                  : status === "used"
                    ? "Entrada ya utilizada"
                    : "Entrada no válida"}
              </span>
            </div>
            <div className="result-person">
              <span className="avatar big">JP</span>
              <div>
                <small>Titular</small>
                <h2>{status === "invalid" ? "—" : "Juan Pérez"}</h2>
              </div>
            </div>
            <div className="result-info">
              <p>
                <span>Evento</span>
                <strong>Concierto bajo las estrellas</strong>
              </p>
              <p>
                <span>Tipo</span>
                <strong>VIP</strong>
              </p>
              <p>
                <span>Código</span>
                <strong>TKT-8F72A91</strong>
              </p>
            </div>
            {status === "valid" && (
              <Button className="full" onClick={() => setStatus("used")}>
                <Check /> Confirmar ingreso
              </Button>
            )}
            <Button
              variant="outline"
              className="full"
              onClick={() => setStatus("idle")}
            >
              Escanear otra entrada
            </Button>
          </div>
        )}
        <div className="state-demo">
          <span>Probar estado:</span>
          <button onClick={() => setStatus("valid")}>Válida</button>
          <button onClick={() => setStatus("used")}>Utilizada</button>
          <button onClick={() => setStatus("invalid")}>No válida</button>
        </div>
      </main>
    </AdminShell>
  );
}
function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <Search />
      <h3>{title}</h3>
      <p>{text}</p>
      <Button variant="outline" onClick={() => location.reload()}>
        Limpiar filtros
      </Button>
    </div>
  );
}

export function PassoApp() {
  const [path, setPath] = useState("/");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [adminUser, setAdminUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminAuthLoading, setAdminAuthLoading] = useState(true);
  useEffect(() => {
    const fn = () => setPath(location.pathname);
    fn();
    window.addEventListener("popstate", fn);
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    adminSupabase.auth.getUser().then(({ data }) => {
      setAdminUser(data.user);
      setAdminAuthLoading(false);
    });
    const { data: adminAuthData } = adminSupabase.auth.onAuthStateChange(
      (_event, session) => {
        setAdminUser(session?.user ?? null);
        setAdminAuthLoading(false);
      },
    );
    return () => {
      window.removeEventListener("popstate", fn);
      data.subscription.unsubscribe();
      adminAuthData.subscription.unsubscribe();
    };
  }, []);
  if (path === "/") return <HomePage />;
  if (path === "/eventos") return <EventsPage />;
  if (path.startsWith("/eventos/")) return <EventDetail />;
  if (path === "/auth/login") return <AuthPage mode="login" />;
  if (path === "/auth/registro") return <AuthPage mode="register" />;
  if (path === "/admin/login") return <AdminLogin />;
  if (path === "/checkout") return <Checkout />;
  if (path === "/checkout/pago") return <Payment />;
  if (path === "/compra/exito") return <Success />;
  if (path === "/mis-entradas")
    return (
      <Protected user={user} loading={authLoading}>
        <MyTickets />
      </Protected>
    );
  if (path.startsWith("/ticket/"))
    return (
      <Protected user={user} loading={authLoading}>
        <DigitalTicket />
      </Protected>
    );
  if (path.startsWith("/admin")) {
    const page: React.ReactNode =
      path === "/admin" ? (
        <AdminDashboard />
      ) : path === "/admin/events" ? (
        <AdminEvents />
      ) : path === "/admin/events/new" ? (
        <NewEvent />
      ) : path === "/admin/orders" ? (
        <AdminList type="orders" />
      ) : path === "/admin/tickets" ? (
        <AdminList type="tickets" />
      ) : path === "/admin/check-in" ? (
        <CheckIn />
      ) : path === "/admin/users" ? (
        <AdminUsers />
      ) : path === "/admin/settings" ? (
        <AdminSettings />
      ) : (
        <AdminDashboard />
      );
    return (
      <Protected user={adminUser} loading={adminAuthLoading} admin>
        {page}
      </Protected>
    );
  }
  return <HomePage />;
}

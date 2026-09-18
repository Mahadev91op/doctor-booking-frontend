import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Stethoscope,
  UserPlus,
  Users,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../components/ui/button";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/doctors", label: "Doctors", icon: Stethoscope },
    { to: "/admin/add-doctor", label: "Add Doctor", icon: UserPlus },
    { to: "/admin/patients", label: "Patients", icon: Users },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">SehatRaj Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white hover:bg-slate-800 rounded-xl"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (Permanent on Desktop, Drawer on Mobile) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-slate-900 text-white p-6 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 shadow-xl ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
                  SehatRaj
                </h1>
                <p className="text-xs text-slate-400 font-medium">Administration</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                    active
                      ? "bg-primary text-white shadow-md shadow-primary/20 font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User / Logout */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <Link
            to="/"
            className="flex items-center justify-center w-full py-2.5 px-4 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            ← Back to Public Website
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full bg-rose-600/90 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-rose-600/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

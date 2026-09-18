import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../common/Logo";
import Container from "../common/Container";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  LogOut,
  LayoutDashboard,
  Calendar,
  Clock,
  IndianRupee,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";

const DoctorNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-border z-50 shadow-xs">
      <Container>
        <nav className="flex items-center justify-between h-16 sm:h-20">
          <Logo />

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex gap-8 font-medium text-sm text-muted-foreground">
            <Link
              to="/doctor/dashboard"
              className={`transition-colors hover:text-primary ${
                isActive("/doctor/dashboard") ? "text-primary font-semibold" : ""
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/doctor/appointments"
              className={`transition-colors hover:text-primary ${
                isActive("/doctor/appointments") ? "text-primary font-semibold" : ""
              }`}
            >
              Appointments
            </Link>
            <Link
              to="/doctor/availability"
              className={`transition-colors hover:text-primary ${
                isActive("/doctor/availability") ? "text-primary font-semibold" : ""
              }`}
            >
              Availability
            </Link>
            <Link
              to="/doctor/earnings"
              className={`transition-colors hover:text-primary ${
                isActive("/doctor/earnings") ? "text-primary font-semibold" : ""
              }`}
            >
              Earnings
            </Link>
            <Link
              to="/doctor/analytics"
              className={`transition-colors hover:text-primary ${
                isActive("/doctor/analytics") ? "text-primary font-semibold" : ""
              }`}
            >
              Analytics
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20">
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-primary/20">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "Dr"}`}
                      alt={user?.name || "Doctor"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user?.name?.charAt(0) || "D"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-foreground">Dr. {user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email || user?.mobile}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary w-max">
                      Doctor Portal
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/doctor/dashboard" className="cursor-pointer flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 text-foreground hover:bg-muted rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </nav>
      </Container>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200 shadow-xl">
          <div className="flex flex-col space-y-1 font-medium text-base">
            <Link
              to="/doctor/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive("/doctor/dashboard")
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/doctor/appointments"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive("/doctor/appointments")
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Appointments</span>
            </Link>

            <Link
              to="/doctor/availability"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive("/doctor/availability")
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Availability & Slots</span>
            </Link>

            <Link
              to="/doctor/earnings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive("/doctor/earnings")
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <IndianRupee className="w-5 h-5" />
              <span>Earnings</span>
            </Link>

            <Link
              to="/doctor/analytics"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive("/doctor/analytics")
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-border">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10 h-11 rounded-xl"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default DoctorNavbar;

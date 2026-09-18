import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Container from "./Container";
import Logo from "./Logo";
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
import { useAuth } from "../../context/AuthContext";
import {
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Home,
  Stethoscope,
  Calendar,
  LayoutDashboard,
  ShieldAlert,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
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
    <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-border z-50 transition-all duration-300 shadow-xs">
      <Container>
        <nav className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-8 font-medium text-sm items-center text-muted-foreground">
            <Link
              to="/"
              className={`transition-colors hover:text-primary ${
                isActive("/") ? "text-primary font-semibold" : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/doctors"
              className={`transition-colors hover:text-primary ${
                isActive("/doctors") ? "text-primary font-semibold" : ""
              }`}
            >
              Doctors
            </Link>

            {user?.role === "patient" && (
              <Link
                to="/my-appointments"
                className={`transition-colors hover:text-primary ${
                  isActive("/my-appointments") ? "text-primary font-semibold" : ""
                }`}
              >
                My Appointments
              </Link>
            )}

            {user?.role === "doctor" && (
              <Link
                to="/doctor/dashboard"
                className={`transition-colors hover:text-primary ${
                  location.pathname.startsWith("/doctor") ? "text-primary font-semibold" : ""
                }`}
              >
                Doctor Dashboard
              </Link>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin/dashboard"
                className={`transition-colors hover:text-primary ${
                  location.pathname.startsWith("/admin") ? "text-primary font-semibold" : ""
                }`}
              >
                Admin Panel
              </Link>
            )}

            <Link
              to="/services"
              className={`transition-colors hover:text-primary ${
                isActive("/services") ? "text-primary font-semibold" : ""
              }`}
            >
              Services
            </Link>
            <Link
              to="/about"
              className={`transition-colors hover:text-primary ${
                isActive("/about") ? "text-primary font-semibold" : ""
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`transition-colors hover:text-primary ${
                isActive("/contact") ? "text-primary font-semibold" : ""
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Action buttons & Mobile hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
                  >
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-primary/20 shadow-xs">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email || user.mobile}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary w-max">
                        {user.role}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      to={
                        user.role === "admin"
                          ? "/admin/dashboard"
                          : user.role === "doctor"
                          ? "/doctor/dashboard"
                          : "/my-appointments"
                      }
                      className="cursor-pointer flex items-center"
                    >
                      {user.role === "admin" ? (
                        <ShieldAlert className="mr-2 h-4 w-4 text-primary" />
                      ) : user.role === "doctor" ? (
                        <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                      ) : (
                        <Calendar className="mr-2 h-4 w-4 text-primary" />
                      )}
                      <span>
                        {user.role === "admin"
                          ? "Admin Dashboard"
                          : user.role === "doctor"
                          ? "Doctor Dashboard"
                          : "My Appointments"}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" className="font-medium text-sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="rounded-full px-5 shadow-sm hover:shadow-md transition-shadow font-medium text-sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
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

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200 shadow-xl">
          <div className="flex flex-col space-y-1 font-medium text-base">
            <Link
              to="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive("/")
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>

            <Link
              to="/doctors"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive("/doctors")
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              <span>Find Doctors</span>
            </Link>

            {user?.role === "patient" && (
              <Link
                to="/my-appointments"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive("/my-appointments")
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>My Appointments</span>
              </Link>
            )}

            {user?.role === "doctor" && (
              <Link
                to="/doctor/dashboard"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  location.pathname.startsWith("/doctor")
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Doctor Dashboard</span>
              </Link>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  location.pathname.startsWith("/admin")
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Admin Panel</span>
              </Link>
            )}

            <Link
              to="/services"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive("/services")
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>Services</span>
            </Link>

            <Link
              to="/about"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive("/about")
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>About Us</span>
            </Link>

            <Link
              to="/contact"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive("/contact")
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>Contact Support</span>
            </Link>
          </div>

          {/* Mobile Auth Actions */}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {user ? (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10 h-11 rounded-xl"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out ({user.name})</span>
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" className="w-full">
                  <Button variant="outline" className="w-full h-11 rounded-xl">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button className="w-full h-11 rounded-xl">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

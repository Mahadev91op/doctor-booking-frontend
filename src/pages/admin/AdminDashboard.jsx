import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getDashboard } from "../../services/adminService";
import {
  Stethoscope,
  Users,
  Calendar,
  UserCheck,
  Clock,
  IndianRupee,
  Loader2,
  TrendingUp,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const result = await getDashboard();
        setStats(result.statistics);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
        <p className="text-muted-foreground font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Doctors",
      value: stats.totalDoctors,
      icon: Stethoscope,
      bg: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      bg: "bg-purple-50 text-purple-600",
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: Calendar,
      bg: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Active Doctors",
      value: stats.activeDoctors,
      icon: UserCheck,
      bg: "bg-teal-50 text-teal-600",
      valueColor: "text-emerald-600",
    },
    {
      title: "Pending Doctors",
      value: stats.pendingDoctors,
      icon: Clock,
      bg: "bg-amber-50 text-amber-600",
      valueColor: "text-amber-600",
    },
    {
      title: "Total Platform Revenue",
      value: `₹${stats.totalRevenue || 0}`,
      icon: IndianRupee,
      bg: "bg-indigo-50 text-indigo-600",
      valueColor: "text-primary",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          System Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time metrics and platform activity across Rajouri
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-border shadow-xs hover:shadow-md transition-shadow p-5 sm:p-6 flex items-center justify-between"
            >
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p
                  className={`text-2xl sm:text-3xl font-bold mt-1.5 ${
                    card.valueColor || "text-foreground"
                  }`}
                >
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;

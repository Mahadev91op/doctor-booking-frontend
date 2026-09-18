import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getDoctors, suspendDoctor } from "../../services/adminService";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { UserPlus, Loader2, Stethoscope } from "lucide-react";

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const result = await getDoctors();
      setDoctors(result.doctors || []);
    } catch (error) {
      toast.error("Unable to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (doctorId) => {
    try {
      const result = await suspendDoctor(doctorId);
      toast.success(result.message);
      loadDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Doctor Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review registered practitioners, subscriptions, and credentials
          </p>
        </div>

        <Link to="/admin/add-doctor">
          <Button className="w-full sm:w-auto rounded-xl shadow-xs font-semibold">
            <UserPlus className="w-4 h-4 mr-2" />
            <span>Add New Doctor</span>
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading doctors...</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="p-4 pl-6">Doctor</th>
                  <th className="p-4">Specialization</th>
                  <th className="p-4">Clinic</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60">
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-muted-foreground">
                      <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No doctors registered yet.
                    </td>
                  </tr>
                ) : (
                  doctors.map((doctor) => {
                    const isActive = doctor.subscriptionStatus === "active" || doctor.subscriptionStatus === "trial";
                    return (
                      <tr key={doctor._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 pl-6 font-semibold text-foreground">
                          {doctor.name}
                        </td>
                        <td className="p-4 text-muted-foreground">{doctor.specialization}</td>
                        <td className="p-4 text-muted-foreground truncate max-w-xs">
                          {doctor.clinicName}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                              doctor.subscriptionStatus === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : doctor.subscriptionStatus === "trial"
                                ? "bg-blue-100 text-blue-800"
                                : doctor.subscriptionStatus === "suspended"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {doctor.subscriptionStatus}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <Button
                            size="sm"
                            variant={doctor.subscriptionStatus === "suspended" ? "default" : "destructive"}
                            onClick={() => handleSuspend(doctor._id)}
                            className="rounded-xl text-xs h-8 px-3"
                          >
                            {doctor.subscriptionStatus === "suspended" ? "Activate" : "Suspend"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDoctors;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getDoctors,
  suspendDoctor,
  updateDoctorPayout,
} from "../../services/adminService";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  UserPlus,
  Loader2,
  Stethoscope,
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPayoutDoctor, setEditingPayoutDoctor] = useState(null);
  const [payoutInput, setPayoutInput] = useState("");
  const [savingPayout, setSavingPayout] = useState(false);

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

  const handleSavePayout = async (e) => {
    e.preventDefault();
    if (!editingPayoutDoctor) return;
    try {
      setSavingPayout(true);
      await updateDoctorPayout(editingPayoutDoctor._id, payoutInput.trim());
      toast.success("Doctor payout account updated successfully");
      setEditingPayoutDoctor(null);
      loadDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update payout account");
    } finally {
      setSavingPayout(false);
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
            Manage doctor profiles, Razorpay Route payout accounts, and 30-day trials
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
                  <th className="p-4">Payout Account (Route)</th>
                  <th className="p-4">Subscription & Trial</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60">
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-muted-foreground">
                      <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No doctors registered yet.
                    </td>
                  </tr>
                ) : (
                  doctors.map((doctor) => {
                    const isTrial = doctor.subscriptionStatus === "trial";
                    const isLinked = !!doctor.payoutAccountId;

                    return (
                      <tr key={doctor._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 pl-6 font-semibold text-foreground">
                          {doctor.name}
                        </td>
                        <td className="p-4 text-muted-foreground">{doctor.specialization}</td>
                        <td className="p-4 text-muted-foreground truncate max-w-[160px]">
                          {doctor.clinicName}
                        </td>

                        {/* Payout Account ID & Status */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {isLinked ? (
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {doctor.payoutAccountId}
                              </span>
                            ) : (
                              <span className="text-xs text-amber-600 font-medium italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Unlinked
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPayoutDoctor(doctor);
                                setPayoutInput(doctor.payoutAccountId || "");
                              }}
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              Edit
                            </button>
                          </div>
                        </td>

                        {/* 30-Day Trial & Subscription */}
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider w-max ${
                                isTrial
                                  ? "bg-blue-100 text-blue-800"
                                  : doctor.subscriptionStatus === "active"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : doctor.subscriptionStatus === "past_due"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {isTrial ? "30-Day Free Trial" : doctor.subscriptionStatus}
                            </span>
                            {(doctor.trialEndDate || doctor.subscriptionExpiryDate) && (
                              <span className="text-[11px] text-muted-foreground">
                                Exp:{" "}
                                {new Date(
                                  doctor.trialEndDate || doctor.subscriptionExpiryDate
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action Buttons */}
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

      {/* Edit Payout Modal */}
      {editingPayoutDoctor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Update Doctor Payout Account</h3>
              </div>
              <button
                onClick={() => setEditingPayoutDoctor(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayout} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Doctor: <strong>{editingPayoutDoctor.name}</strong> ({editingPayoutDoctor.specialization})
                </p>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Razorpay Linked Account ID / Payout ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. acc_1234567890abcdef"
                  value={payoutInput}
                  onChange={(e) => setPayoutInput(e.target.value)}
                  className="w-full border border-border rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Patient appointment fees will be automatically transferred to this linked account via Razorpay Route.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingPayoutDoctor(null)}
                  className="rounded-xl text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingPayout}
                  className="rounded-xl text-sm font-semibold"
                >
                  {savingPayout ? "Saving..." : "Save Payout ID"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;

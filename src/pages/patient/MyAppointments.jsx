import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  getMyAppointments,
  cancelAppointment,
} from "../../services/patientService";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  XCircle,
  Loader2,
  Stethoscope,
} from "lucide-react";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const result = await getMyAppointments();
        const confirmedList = (result.appointments || []).filter(
          (apt) =>
            apt.paymentStatus === "paid" &&
            apt.status !== "pending_payment" &&
            apt.status !== "failed"
        );
        setAppointments(confirmedList);
      } catch (error) {
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }
    try {
      await cancelAppointment(appointmentId);
      toast.success("Appointment Cancelled");

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === appointmentId
            ? {
                ...appointment,
                status: "cancelled_by_patient",
              }
            : appointment
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancellation Failed");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
      case "checked":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            {status === "checked" ? "Completed" : "Confirmed"}
          </Badge>
        );
      case "cancelled_by_patient":
      case "cancelled_by_doctor":
        return (
          <Badge className="bg-rose-100 text-rose-800 border-rose-200">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            {status || "Pending"}
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            My Appointments
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track and manage your scheduled doctor consultations
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground">Loading your appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-border shadow-xs">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              No appointments scheduled yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Find top specialists in Rajouri and book your first medical consultation in seconds.
            </p>
            <Link to="/doctors">
              <Button className="rounded-full px-6 shadow-sm">
                Find Doctors
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {appointments.map((appointment) => {
              const doctor = appointment.doctorId || {};
              const isCancelled =
                appointment.status === "cancelled_by_patient" ||
                appointment.status === "cancelled_by_doctor";

              return (
                <div
                  key={appointment._id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-border shadow-xs hover:shadow-md transition-shadow p-5 sm:p-7"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                        {doctor.name ? doctor.name.charAt(0) : "D"}
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">
                          {doctor.name || "Doctor"}
                        </h2>
                        <p className="text-xs sm:text-sm text-primary font-medium">
                          {doctor.specialization || "General Medicine"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {getStatusBadge(appointment.status)}
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
                        {appointment.appointmentType || "normal"}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 py-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <span>
                        <strong>Date:</strong>{" "}
                        {appointment.appointmentDate
                          ? new Date(appointment.appointmentDate).toLocaleDateString()
                          : appointment.slotDate
                          ? new Date(appointment.slotDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <span>
                        <strong>Time / Token:</strong>{" "}
                        {appointment.tokenNumber
                          ? `Token #${appointment.tokenNumber}`
                          : appointment.slotTime || "Scheduled"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">
                        <strong>Clinic:</strong> {doctor.clinicName || "Clinic"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Fee:{" "}
                      <span className="text-foreground font-bold text-base">
                        ₹{appointment.amountPaid || doctor.consultationFee || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {!isCancelled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(appointment._id)}
                          className="flex-1 sm:flex-initial text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl text-xs sm:text-sm h-9"
                        >
                          <XCircle className="w-4 h-4 mr-1.5" />
                          Cancel
                        </Button>
                      )}
                      <Link
                        to={`/ticket/${appointment._id}`}
                        className="flex-1 sm:flex-initial"
                      >
                        <Button
                          size="sm"
                          className="w-full sm:w-auto rounded-xl text-xs sm:text-sm h-9"
                        >
                          <Ticket className="w-4 h-4 mr-1.5" />
                          View Ticket
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyAppointments;

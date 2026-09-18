import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getAppointmentTicket,
  downloadTicket as downloadTicketAPI,
} from "../../services/ticketService";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Download,
  Printer,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  Loader2,
  ArrowLeft,
} from "lucide-react";

const AppointmentTicket = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const result = await getAppointmentTicket(id);
        setAppointment(result.appointment);
      } catch (error) {
        toast.error("Unable to load ticket");
      }
    };

    fetchTicket();
  }, [id]);

  const downloadTicket = async () => {
    try {
      setDownloading(true);
      const pdfBlob = await downloadTicketAPI(appointment._id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Ticket-${appointment.bookingReference || appointment._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Ticket downloaded successfully!");
    } catch (error) {
      toast.error("Unable to download ticket");
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  if (!appointment) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground text-lg">Loading Appointment Ticket...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const doctor = appointment.doctorId || {};
  const patient = appointment.patientId || {};

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="mb-4">
          <Link
            to="/my-appointments"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Appointments</span>
          </Link>
        </div>

        <div id="ticket" className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-border overflow-hidden">
          {/* Ticket Header Banner */}
          <div className="bg-primary text-primary-foreground p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-white/20 text-white mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmed Booking</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">SehatRaj</h1>
              <p className="text-xs sm:text-sm text-primary-foreground/80 mt-1 capitalize font-medium">
                {appointment.appointmentType === "premium"
                  ? "⭐ Premium Consultation Ticket"
                  : appointment.appointmentType === "home"
                  ? "🏠 Home Visit Ticket"
                  : "🩺 Medical Consultation Ticket"}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-8 md:p-10 space-y-6">
            {/* Reference Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-slate-50 rounded-xl border border-border/80">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Booking Reference</p>
                <p className="text-base sm:text-lg font-mono font-bold text-foreground">{appointment.bookingReference}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 capitalize text-xs">
                  {appointment.status || "Confirmed"}
                </Badge>
              </div>
            </div>

            {/* Doctor & Patient Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
              <div className="p-4 rounded-xl border border-border/60 bg-white space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Doctor Details</p>
                <h3 className="text-base font-bold text-foreground">{doctor.name || "Doctor"}</h3>
                <p className="text-xs text-primary font-medium">{doctor.specialization || "Specialist"}</p>
                <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{doctor.clinicName}, {doctor.clinicAddress}</span>
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-white space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Patient Details</p>
                <h3 className="text-base font-bold text-foreground">{patient.name || "Patient"}</h3>
                <p className="text-xs text-muted-foreground">{patient.mobile || patient.email || ""}</p>
                <p className="text-xs text-muted-foreground pt-1">
                  <strong>Fee Paid:</strong> ₹{appointment.amountPaid || doctor.consultationFee || 0} ({appointment.paymentStatus || "paid"})
                </p>
              </div>
            </div>

            {/* Timing & Token */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-around gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Appointment Date</p>
                <p className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                  {appointment.appointmentDate
                    ? new Date(appointment.appointmentDate).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })
                    : appointment.slotDate
                    ? new Date(appointment.slotDate).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })
                    : "Scheduled"}
                </p>
              </div>
              <div className="h-8 w-px bg-primary/20 hidden sm:block" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Queue / Time</p>
                <p className="text-base sm:text-lg font-bold text-primary mt-0.5">
                  {appointment.tokenNumber ? `Token #${appointment.tokenNumber}` : appointment.slotTime || "Standard Queue"}
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="border-t border-border/80 pt-5 space-y-2.5">
              <h4 className="text-sm font-bold text-foreground">Patient Instructions</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
                <li>Please arrive at least <strong>15 minutes before</strong> your scheduled time.</li>
                <li>Present this digital ticket or printed copy at clinic reception.</li>
                <li>Carry previous prescriptions and medical reports if available.</li>
              </ul>
            </div>

            {/* Support Footer inside ticket */}
            <div className="border-t border-border/80 pt-4 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Need Assistance?</p>
              <p>Helpline: +91-9149852051 | Email: support@sehatraj.com</p>
              <p className="text-[11px] pt-1">
                Powered by <strong>SehatRaj Healthcare Platform</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
          <Button
            onClick={downloadTicket}
            disabled={downloading}
            className="w-full sm:w-auto rounded-xl px-7 h-12 text-sm font-semibold shadow-sm"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            <span>Download PDF</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.print()}
            className="w-full sm:w-auto rounded-xl px-7 h-12 text-sm font-semibold border-border shadow-xs hover:bg-muted"
          >
            <Printer className="w-4 h-4 mr-2" />
            <span>Print Ticket</span>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AppointmentTicket;

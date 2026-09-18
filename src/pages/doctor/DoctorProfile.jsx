import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDoctorById, getPremiumSlots } from "../../services/doctorService";
import {
  bookNormalAppointment,
  bookPremiumAppointment,
  bookHomeVisitAppointment,
} from "../../services/appointmentService";
import { createOrder, verifyPayment } from "../../services/paymentService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  getHomeVisitSlots,
} from "../../services/doctorService";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  console.log("Doctor ID:", id);

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Premium Booking Modal
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const [premiumDate, setPremiumDate] = useState("");

  const [premiumTime, setPremiumTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showHomeModal, setShowHomeModal] = useState(false);

  const [visitDate, setVisitDate] = useState("");



  const [homeAddress, setHomeAddress] = useState("");

  const [homeLandmark, setHomeLandmark] = useState("");

  const [homeCity, setHomeCity] = useState("");
  const [homeVisitSlots, setHomeVisitSlots] = useState([]);

  const [selectedHomeSlot, setSelectedHomeSlot] = useState("");

  const [homePincode, setHomePincode] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [homeSlotsLoading, setHomeSlotsLoading] = useState(false);

  // Helper to open Razorpay Test Mode or Cloud Order cleanly
  const initiateRazorpayCheckout = ({ order, description, themeColor, onPaymentSuccess }) => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK is not loaded. Please refresh the page and try again.");
      return;
    }

    const isRealRazorpayOrder = order.id && !order.id.startsWith("order_dev_");

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_T2inS5kXnDHlfO",
      amount: order.amount,
      currency: order.currency || "INR",
      name: "SehatRaj Healthcare",
      description: description || "Doctor Appointment",
      ...(isRealRazorpayOrder ? { order_id: order.id } : {}),
      handler: async function (response) {
        try {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id || order.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature || "mock_signature_test",
          });

          toast.success("Appointment Booked Successfully!");
          if (onPaymentSuccess) onPaymentSuccess();
          navigate("/my-appointments");
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Payment Verification Failed",
          );
        }
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.mobile || "",
      },
      theme: {
        color: themeColor || "#2563eb",
      },
      modal: {
        ondismiss: function () {
          toast("Payment window closed", { icon: "ℹ️" });
        },
      },
    };

    try {
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", function (resp) {
        console.error("Payment failed event:", resp);
        toast.error(resp?.error?.description || "Payment was not completed");
      });
      rzpInstance.open();
    } catch (err) {
      console.error("Razorpay initialization error:", err);
      toast.error("Failed to open Razorpay payment window: " + err.message);
    }
  };

  const handleBookNormal = async () => {
    if (!user) {
      toast.error("Please login first to book an appointment");
      navigate(`/login?redirect=/doctor/${doctor._id}`);
      return;
    }

    try {
      setBookingLoading(true);
      // 1. Create Appointment
      const booking = await bookNormalAppointment(doctor._id);

      // 2. Create Razorpay Order
      const orderResponse = await createOrder(booking.appointment._id);

      initiateRazorpayCheckout({
        order: orderResponse.order,
        description: `Normal Consultation with ${doctor.name}`,
        themeColor: "#2563eb",
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Booking Failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const openPremiumModal = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    setPremiumDate(dateStr);
    setPremiumTime("");
    setShowPremiumModal(true);
    fetchPremiumSlots(dateStr);
  };

  const fetchPremiumSlots = async (date) => {
    if (!date || !doctor) return;
    try {
      setSlotsLoading(true);
      const result = await getPremiumSlots(doctor._id, date);
      setAvailableSlots(result.availableSlots || []);
    } catch (error) {
      console.error("Error loading premium slots:", error);
      setAvailableSlots([]);
      toast.error(error.response?.data?.message || "Unable to load slots");
    } finally {
      setSlotsLoading(false);
    }
  };

  const handlePremiumBooking = async () => {
    if (!user) {
      toast.error("Please login first to book an appointment");
      navigate(`/login?redirect=/doctor/${doctor._id}`);
      return;
    }

    if (!premiumDate || !premiumTime) {
      toast.error("Please select a date and an available slot");
      return;
    }

    try {
      setBookingLoading(true);
      // 1. Create Premium Appointment
      const booking = await bookPremiumAppointment(
        doctor._id,
        premiumDate,
        premiumTime,
      );

      // 2. Create Razorpay Order
      const orderResponse = await createOrder(booking.appointment._id);

      initiateRazorpayCheckout({
        order: orderResponse.order,
        description: `Premium Consultation with ${doctor.name} (${premiumTime})`,
        themeColor: "#7c3aed",
        onPaymentSuccess: () => setShowPremiumModal(false),
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Booking Failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const openHomeModal = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    setVisitDate(dateStr);
    setSelectedHomeSlot("");
    setShowHomeModal(true);
    fetchHomeVisitSlots(dateStr);
  };

  const fetchHomeVisitSlots = async (date) => {
    if (!date || !doctor) return;
    try {
      setHomeSlotsLoading(true);
      const result = await getHomeVisitSlots(doctor._id, date);
      setHomeVisitSlots(result.availableSlots || []);
    } catch (error) {
      console.error(error);
      setHomeVisitSlots([]);
      toast.error(error.response?.data?.message || "Unable to load slots");
    } finally {
      setHomeSlotsLoading(false);
    }
  };

  const handleHomeVisitBooking = async () => {
    if (!user) {
      toast.error("Please login first to book a home visit");
      navigate(`/login?redirect=/doctor/${doctor._id}`);
      return;
    }

    if (
      !visitDate ||
      !selectedHomeSlot ||
      !homeAddress ||
      !homeCity ||
      !homePincode
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setBookingLoading(true);
      // 1. Create Home Visit Appointment
      const booking = await bookHomeVisitAppointment(
        doctor._id,
        visitDate,
        selectedHomeSlot,
        homeAddress,
        homeLandmark,
        homeCity,
        homePincode,
      );

      // 2. Create Razorpay Order
      const orderResponse = await createOrder(booking.appointment._id);

      initiateRazorpayCheckout({
        order: orderResponse.order,
        description: `Home Visit by ${doctor.name}`,
        themeColor: "#16a34a",
        onPaymentSuccess: () => setShowHomeModal(false),
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Booking Failed");
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const result = await getDoctorById(id);
        console.log("Doctor API Result:", result);
        setDoctor(result.doctor);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-2xl">Loading doctor...</div>;
  }

  if (!doctor) {
    return (
      <div className="text-center py-20 text-red-600 text-2xl">
        Doctor not found
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-border p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl sm:text-5xl font-bold shadow-xs shrink-0">
              {doctor.name.charAt(0)}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">{doctor.name}</h1>
              <p className="text-primary font-semibold text-base sm:text-lg mt-1">
                {doctor.specialization}
              </p>
              <p className="text-muted-foreground text-sm mt-1">{doctor.qualification}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-10 pt-6 border-t border-border/60">
            <div className="space-y-2 text-sm text-muted-foreground">
              <h2 className="font-bold text-base sm:text-lg text-foreground mb-3">Doctor Information</h2>
              <p><strong className="text-foreground">Experience:</strong> {doctor.experience} Years</p>
              <p><strong className="text-foreground">Clinic:</strong> {doctor.clinicName}</p>
              <p><strong className="text-foreground">Address:</strong> {doctor.clinicAddress}</p>
              <p><strong className="text-foreground">Working Days:</strong> {doctor.workingDays.join(", ")}</p>
              <p><strong className="text-foreground">Clinic Time:</strong> {doctor.clinicStartTime} - {doctor.clinicEndTime}</p>
              <p><strong className="text-foreground">Lunch:</strong> {doctor.lunchStart} - {doctor.lunchEnd}</p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <h2 className="font-bold text-base sm:text-lg text-foreground mb-3">Consultation Fees</h2>
              <p><strong className="text-foreground">Normal Consultation:</strong> ₹{doctor.consultationFee}</p>
              {doctor.premiumBookingEnabled && (
                <p><strong className="text-foreground">Premium Consultation:</strong> ₹{doctor.premiumFee}</p>
              )}
              {doctor.homeVisitAvailable && (
                <p><strong className="text-foreground">Home Visit:</strong> ₹{doctor.homeVisitFee}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 pt-6 border-t border-border/60">
            <button
              onClick={handleBookNormal}
              disabled={bookingLoading}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {bookingLoading ? "Processing..." : `Book Normal (₹${doctor.consultationFee})`}
            </button>

            {doctor.premiumBookingEnabled && (
              <button
                onClick={openPremiumModal}
                disabled={bookingLoading}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                Book Premium (₹{doctor.premiumFee})
              </button>
            )}

            {doctor.homeVisitAvailable && (
              <button
                onClick={openHomeModal}
                disabled={bookingLoading}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                Book Home Visit (₹{doctor.homeVisitFee})
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Premium Booking Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">⚡ Premium Consultation</h2>

            <label className="block text-sm font-semibold mb-2 text-foreground">Select Appointment Date</label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={premiumDate}
              onChange={(e) => {
                const newDate = e.target.value;
                setPremiumDate(newDate);
                setPremiumTime("");
                fetchPremiumSlots(newDate);
              }}
              className="w-full border border-border rounded-xl p-3 mb-5 text-sm bg-background"
            />

            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-foreground">
                Available Premium Slots
              </label>
              {slotsLoading && (
                <span className="text-xs text-purple-600 font-medium animate-pulse">
                  Checking slots...
                </span>
              )}
            </div>

            <div className="border border-border/80 rounded-xl p-3 max-h-56 overflow-y-auto bg-slate-50/50">
              {slotsLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
                  Loading available slots for {premiumDate}...
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setPremiumTime(slot)}
                      className={`border rounded-xl py-2 px-1 text-xs font-semibold transition ${
                        premiumTime === slot
                          ? "bg-purple-600 text-white border-purple-600 shadow-sm ring-2 ring-purple-300"
                          : "bg-white hover:bg-purple-50 border-border text-foreground hover:border-purple-300"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs sm:text-sm text-muted-foreground">
                  {premiumDate
                    ? `No slots available on ${premiumDate}. Please choose another working date.`
                    : "Please pick a date above to view available slots."}
                </div>
              )}
            </div>

            {premiumTime && (
              <div className="mt-3 p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 font-medium flex items-center justify-between">
                <span>Selected Time Slot:</span>
                <span className="font-bold text-sm bg-purple-600 text-white px-2.5 py-0.5 rounded-lg">
                  {premiumTime}
                </span>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPremiumModal(false)}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!premiumTime || bookingLoading}
                onClick={handlePremiumBooking}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? "Processing..." : `Pay ₹${doctor.premiumFee} & Confirm`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Home Visit Modal */}
      {showHomeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">🏠 Book Home Visit</h2>

            <label className="block text-sm font-semibold mb-1.5 text-foreground">Select Visit Date</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => {
                setVisitDate(e.target.value);
                fetchHomeVisitSlots(e.target.value);
              }}
              className="w-full border border-border rounded-xl p-3 mb-4 text-sm"
            />

            <div className="mb-5">
              <label className="text-sm font-semibold block mb-2 text-foreground">
                Available Time Slots
              </label>

              <div className="grid grid-cols-2 gap-2">
                {homeVisitSlots.length > 0 ? (
                  homeVisitSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedHomeSlot(slot)}
                      className={`border rounded-xl py-2 text-xs sm:text-sm font-medium transition ${
                        selectedHomeSlot === slot
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white hover:bg-emerald-50 border-border"
                      }`}
                    >
                      {slot}
                    </button>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs sm:text-sm col-span-2">
                    Select a date to view available slots.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                placeholder="Full Address"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                className="w-full border border-border rounded-xl p-3 text-sm min-h-[70px]"
              />
              <input
                type="text"
                placeholder="Landmark (e.g. Near City Hospital)"
                value={homeLandmark}
                onChange={(e) => setHomeLandmark(e.target.value)}
                className="w-full border border-border rounded-xl p-3 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={homeCity}
                  onChange={(e) => setHomeCity(e.target.value)}
                  className="w-full border border-border rounded-xl p-3 text-sm"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={homePincode}
                  onChange={(e) => setHomePincode(e.target.value)}
                  className="w-full border border-border rounded-xl p-3 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button
                onClick={() => setShowHomeModal(false)}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleHomeVisitBooking}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-xs"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};


export default DoctorProfile;

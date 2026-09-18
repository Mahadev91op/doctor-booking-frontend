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
  const handleBookNormal = async () => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      // 1. Create Appointment
      const booking = await bookNormalAppointment(doctor._id);

      // 2. Create Razorpay Order
      const orderResponse = await createOrder(booking.appointment._id);

      const { order } = orderResponse;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: order.amount,

        currency: order.currency,

        name: "Nexora Health",

        description: "Doctor Appointment",

        order_id: order.id,

        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,

              razorpay_payment_id: response.razorpay_payment_id,

              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Appointment Booked Successfully!");

            navigate("/my-appointments");
          } catch (error) {
            toast.error(
              error.response?.data?.message || "Payment Verification Failed",
            );
          }
        },

        prefill: {
          name: user.name,

          email: user.email,

          contact: user.mobile,
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function () {
        toast.error("Payment Failed");
      });

      razorpay.open();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Booking Failed");
    }
  };
const handlePremiumBooking = async () => {
  if (!premiumDate || !premiumTime) {
    toast.error("Please select date and slot");
    return;
  }

  try {
    // 1. Create Premium Appointment
    const booking = await bookPremiumAppointment(
      doctor._id,
      premiumDate,
      premiumTime,
    );

    // 2. Create Razorpay Order
    const orderResponse = await createOrder(booking.appointment._id);

    const { order } = orderResponse;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,

      amount: order.amount,

      currency: order.currency,

      name: "SehatRaj",

      description: "Premium Doctor Appointment",

      order_id: order.id,

      handler: async function (response) {
        try {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          toast.success("Premium Appointment Booked Successfully!");

          setShowPremiumModal(false);

          navigate("/my-appointments");
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Payment Verification Failed",
          );
        }
      },

      prefill: {
        name: user.name,
        email: user.email,
        contact: user.mobile,
      },

      theme: {
        color: "#7c3aed",
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function () {
      toast.error("Payment Failed");
    });

    razorpay.open();
  } catch (error) {
    console.error(error);

    toast.error(error.response?.data?.message || "Booking Failed");
  }
};

const fetchHomeVisitSlots = async (date) => {
  try {
    const result = await getHomeVisitSlots(doctor._id, date);

    setHomeVisitSlots(result.availableSlots);
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Unable to load slots");
  }
};

const handleHomeVisitBooking = async () => {
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

    const { order } = orderResponse;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,

      amount: order.amount,

      currency: order.currency,

      name: "SehatRaj",

      description: "Home Visit Appointment",

      order_id: order.id,

      handler: async function (response) {
        try {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          toast.success("Home Visit Booked Successfully!");

          setShowHomeModal(false);

          navigate("/my-appointments");
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Payment Verification Failed",
          );
        }
      },

      prefill: {
        name: user.name,
        email: user.email,
        contact: user.mobile,
      },

      theme: {
        color: "#16a34a",
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function () {
      toast.error("Payment Failed");
    });

    razorpay.open();
  } catch (error) {
    console.error(error);

    toast.error(error.response?.data?.message || "Booking Failed");
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

useEffect(() => {
  const loadSlots = async () => {
    if (!premiumDate || !doctor) return;

    try {
      const result = await getPremiumSlots(doctor._id, premiumDate);

      setAvailableSlots(result.availableSlots);
    } catch (error) {
      console.error(error);
    }
  };

  loadSlots();
}, [premiumDate, doctor]);
useEffect(() => {
  const loadHomeSlots = async () => {
    if (!visitDate || !doctor) return;

    try {
      const result = await getHomeVisitSlots(doctor._id, visitDate);

      setHomeVisitSlots(result.availableSlots);
    } catch (error) {
      console.error(error);
    }
  };

  loadHomeSlots();
}, [visitDate, doctor]);

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
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3.5 rounded-xl transition-all shadow-sm"
            >
              Book Normal (₹{doctor.consultationFee})
            </button>

            {doctor.premiumBookingEnabled && (
              <button
                onClick={() => setShowPremiumModal(true)}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-sm"
              >
                Book Premium (₹{doctor.premiumFee})
              </button>
            )}

            {doctor.homeVisitAvailable && (
              <button
                onClick={() => setShowHomeModal(true)}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-sm"
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
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">Premium Appointment</h2>

            <label className="block text-sm font-semibold mb-2 text-foreground">Select Date</label>
            <input
              type="date"
              value={premiumDate}
              onChange={(e) => setPremiumDate(e.target.value)}
              className="w-full border border-border rounded-xl p-3 mb-5 text-sm"
            />

            <label className="block text-sm font-semibold mb-2 text-foreground">
              Available Premium Slots
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {availableSlots.length > 0 ? (
                availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setPremiumTime(slot)}
                    className={`border rounded-xl py-2 text-xs sm:text-sm font-medium transition ${
                      premiumTime === slot
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "hover:bg-purple-50 border-border"
                    }`}
                  >
                    {slot}
                  </button>
                ))
              ) : (
                <p className="text-muted-foreground text-xs sm:text-sm col-span-full">
                  Select a date to view available slots.
                </p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowPremiumModal(false)}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handlePremiumBooking}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-xs"
              >
                Continue
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

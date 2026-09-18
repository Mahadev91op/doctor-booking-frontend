import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DoctorLayout from "../../layouts/DoctorLayout";
import {
  getSubscriptionStatus,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  simulateSubscriptionPayment,
} from "../../services/subscriptionService";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Calendar,
  CreditCard,
  Building2,
  HelpCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

const Subscription = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await getSubscriptionStatus();
      setData(res);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRazorpayPay = async (planKey) => {
    try {
      setActionLoading(true);
      const orderRes = await createSubscriptionOrder(planKey);
      const { order } = orderRes;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "SehatRaj",
        description: `Doctor SaaS Subscription (${planKey.toUpperCase()})`,
        handler: async function (response) {
          try {
            await verifySubscriptionPayment({
              razorpay_order_id: response.razorpay_order_id || order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Subscription Activated Successfully! Practice is now active.");
            fetchStatus();
          } catch (error) {
            toast.error(error.response?.data?.message || "Subscription Verification Failed");
          }
        },
        theme: {
          color: "#2563EB",
        },
      };

      if (order?.id && !order.id.startsWith("order_dev_")) {
        options.order_id = order.id;
      }

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", function () {
        toast.error("Razorpay Test: Use UPI (success@razorpay) or Test Card 4111 1111 1111 1111");
      });
      rzpInstance.open();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Unable to start subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulatePay = async (planKey) => {
    try {
      setActionLoading(true);
      await simulateSubscriptionPayment(planKey);
      toast.success(`Demo Mode: ${planKey.toUpperCase()} Subscription Activated!`);
      fetchStatus();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Demo activation failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex flex-col items-center justify-center py-28 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Loading Subscription Details...</p>
        </div>
      </DoctorLayout>
    );
  }

  const doctor = data?.doctor || {};
  const isTrial = doctor.subscriptionStatus === "trial";
  const isActive = doctor.subscriptionStatus === "active";
  const isExpired = doctor.subscriptionStatus === "expired" || doctor.subscriptionStatus === "past_due";
  const history = data?.history || [];

  const planTiers = [
    {
      key: "monthly",
      name: "Monthly SaaS",
      price: 499,
      duration: "30 Days",
      popular: true,
      description: "Standard practice billing cycle, recurring monthly.",
    },
    {
      key: "quarterly",
      name: "Quarterly Pro",
      price: 1299,
      duration: "90 Days",
      popular: false,
      savings: "Save ₹198",
      description: "3 Months coverage with uninterrupted practice listing.",
    },
    {
      key: "yearly",
      name: "Annual Elite",
      price: 4499,
      duration: "365 Days",
      popular: false,
      savings: "Save ₹1,489",
      description: "Full year of premium doctor listing and VIP support.",
    },
  ];

  return (
    <DoctorLayout>
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              SaaS Subscription & Billing
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage your doctor portal membership and platform subscription fees.
            </p>
          </div>
          <button
            onClick={fetchStatus}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Status
          </button>
        </div>

        {/* Current Subscription Status Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-border p-6 sm:p-8 mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/80">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : isTrial
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isActive ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : isTrial ? (
                  <Clock className="w-8 h-8" />
                ) : (
                  <AlertTriangle className="w-8 h-8" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground capitalize">
                    {isTrial ? "30-Day Free Trial" : `${doctor.subscriptionPlan} Plan`}
                  </h2>
                  <span
                    className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      isActive
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : isTrial
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    {doctor.subscriptionStatus}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Practice ID: Dr. {doctor.name}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 min-w-[200px] text-right">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Remaining Validity
              </p>
              <p className="text-3xl font-extrabold text-foreground mt-0.5">
                {doctor.remainingDays} <span className="text-sm font-normal text-muted-foreground">Days</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Expires:{" "}
                {doctor.subscriptionExpiryDate
                  ? new Date(doctor.subscriptionExpiryDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Architecture Banner */}
          <div className="mt-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
            <Building2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-blue-950">
                Payment Architecture: Doctor $\rightarrow$ Platform Account (Direct B2B)
              </p>
              <p className="text-blue-800 mt-0.5">
                SaaS subscription payments are billed directly to the platform (100% platform credit, zero transfers).
                Patient appointment payments (Task 3) continue to route automatically to your personal linked Razorpay account.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing & Renewal Cards */}
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Available Subscription Plans
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {planTiers.map((tier) => (
            <div
              key={tier.key}
              className={`bg-white rounded-3xl shadow-sm p-6 sm:p-7 border-2 flex flex-col justify-between transition-all ${
                tier.popular
                  ? "border-blue-600 shadow-md ring-2 ring-blue-600/10 relative"
                  : "border-border hover:border-slate-300"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                  Most Popular
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-foreground">{tier.name}</h3>
                  {tier.savings && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {tier.savings}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground min-h-[36px]">
                  {tier.description}
                </p>

                <div className="mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-foreground">
                    ₹{tier.price}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1.5">
                    / {tier.duration}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 border-t border-border/80 pt-4 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Active Doctor Directory Listing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Unlimited Normal & Premium Consultations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Home Visit Scheduling & Direct Payouts</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleRazorpayPay(tier.key)}
                  disabled={actionLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  {actionLoading ? "Processing..." : `Pay ₹${tier.price} via Razorpay`}
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulatePay(tier.key)}
                  disabled={actionLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  ⚡ 1-Click Instant Demo Activate
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Billing History */}
        <div className="bg-white rounded-3xl shadow-sm border border-border p-6 sm:p-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Recent Subscription Transactions
          </h2>

          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No paid subscription transactions recorded yet. Current status running under trial/active tier.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Payment ID</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Valid Until</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {history.map((sub) => (
                    <tr key={sub._id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold capitalize text-foreground">
                        {sub.plan}
                      </td>
                      <td className="p-3 text-foreground font-mono">₹{sub.amount}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground truncate max-w-[140px]">
                        {sub.orderId || "N/A"}
                      </td>
                      <td className="p-3 font-mono text-xs text-muted-foreground truncate max-w-[140px]">
                        {sub.paymentId || "N/A"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                            sub.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : sub.paymentStatus === "failed"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {sub.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {sub.expiryDate
                          ? new Date(sub.expiryDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default Subscription;

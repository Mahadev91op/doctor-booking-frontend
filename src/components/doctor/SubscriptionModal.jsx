import { useState } from "react";
import { CheckCircle2, Zap, ShieldCheck, HelpCircle } from "lucide-react";

const SubscriptionModal = ({ open, onClose, onContinue, onSimulatePay, loading }) => {
  const [plan, setPlan] = useState("monthly");

  if (!open) return null;

  const planDetails = {
    monthly: { name: "Monthly", price: 499, duration: "30 Days", badge: null },
    quarterly: { name: "Quarterly", price: 1299, duration: "90 Days", badge: "Popular ⭐" },
    yearly: { name: "Yearly", price: 4499, duration: "365 Days", badge: "Best Value 💎" },
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-lg border border-border max-h-[95vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Doctor SaaS Billing (Direct to Platform)
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Choose Subscription Plan
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Keep your practice profile active and continue receiving patient bookings.
          </p>
        </div>

        <div className="space-y-3">
          {Object.entries(planDetails).map(([key, details]) => {
            const isSelected = plan === key;
            return (
              <label
                key={key}
                onClick={() => setPlan(key)}
                className={`relative border-2 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-border hover:border-blue-200 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="subscription_plan"
                    checked={isSelected}
                    onChange={() => setPlan(key)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-base">
                        {details.name}
                      </span>
                      {details.badge && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {details.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Validity: {details.duration}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-extrabold text-foreground">
                    ₹{details.price}
                  </span>
                  <p className="text-[11px] text-muted-foreground">all-inclusive</p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Feature List */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Accept unlimited Normal, Premium & Home Visit appointments</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Instant Razorpay Route payout directly to your linked bank account</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Real-time earnings, daily token counters & patient analytics</span>
          </div>
        </div>

        {/* Test Mode Guidance */}
        <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Testing Note:</strong> In Razorpay popup, use UPI (<strong>test@upi</strong> / <strong>success@razorpay</strong>) or domestic card (<strong>4111 1111 1111 1111</strong>). Or use the 1-Click Instant Demo button below!
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-border rounded-xl py-3 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={() => onContinue(plan)}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? "Processing..." : `Pay ₹${planDetails[plan].price} via Razorpay`}
            </button>
          </div>

          {/* 1-Click Demo Bypass Helper */}
          {onSimulatePay && (
            <button
              type="button"
              onClick={() => onSimulatePay(plan)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              ⚡ 1-Click Instant Demo Activate (Bypass Gateway)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;


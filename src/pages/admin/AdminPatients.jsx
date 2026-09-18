import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getPatients } from "../../services/adminService";
import { Users, Loader2 } from "lucide-react";

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const result = await getPatients();
      setPatients(result.patients || []);
    } catch (error) {
      toast.error("Unable to load patients");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Patient Directory
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registered patient accounts and contact information
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading patient records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="p-4 pl-6">Patient Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 pr-6">Mobile Number</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-12 text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No patients registered yet.
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-foreground">{patient.name}</td>
                      <td className="p-4 text-muted-foreground">{patient.email}</td>
                      <td className="p-4 pr-6 text-muted-foreground font-mono">{patient.mobile}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPatients;

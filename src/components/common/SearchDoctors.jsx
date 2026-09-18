import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { searchDoctors, getDoctors } from "../../services/doctorService";
import DoctorCard from "./DoctorCard";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const SearchDoctors = () => {
  const [specialization, setSpecialization] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const result = await getDoctors();
      setDoctors(result.doctors);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const result = await searchDoctors(specialization);
      setDoctors(result.doctors);
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center mb-10 sm:mb-16 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-2 sm:mb-4">
            Search & Book Doctors
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl">
            Browse our network of top-rated specialists or search directly for the care you need.
          </p>

          <div className="mt-6 sm:mt-10 w-full max-w-2xl flex flex-col sm:flex-row items-center shadow-lg rounded-2xl sm:rounded-full bg-white border border-border/70 p-2 gap-2 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
            <div className="relative w-full flex items-center">
              <Search className="absolute left-4 text-muted-foreground w-5 h-5 pointer-events-none" />
              <Input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full border-none shadow-none focus-visible:ring-0 text-sm sm:text-base pl-11 h-11 sm:h-12 bg-transparent"
                placeholder="Search by specialization (e.g. Cardiologist)"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              size="lg"
              className="w-full sm:w-auto rounded-xl sm:rounded-full h-11 sm:h-12 px-7 font-medium shadow-sm shrink-0"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
          </div>
        </div>

        {/* Doctor Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-10">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : doctors.length > 0 ? (
            doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-muted/30 rounded-3xl border border-border/50 px-4">
              <p className="text-base sm:text-lg text-muted-foreground font-medium">
                No doctors found matching your criteria.
              </p>
              <Button variant="link" onClick={() => { setSpecialization(""); loadDoctors(); }} className="mt-2 text-primary">
                Clear search and view all
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchDoctors;

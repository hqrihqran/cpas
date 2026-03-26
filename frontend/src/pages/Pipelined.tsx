import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  FileText, 
  GitBranch,
  Search,
  Info,
  CheckCircle2,
  AlertCircle,
  Download,
  Target,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { students, pipelinedCompanies, PipelinedCompany } from "@/data/mockData";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GapSkill {
  skill_name:          string;
  min_required:        number;
  student_proficiency: number;
  gap_score:           number;
  gap_severity:        "none" | "low" | "medium" | "high";
}

interface CompanyGap {
  company_id:   number;
  company_name: string;
  gap_skills:   GapSkill[];
}

interface SkillGapResponse {
  student_id: number;
  companies:  CompanyGap[];
}

// ─── Severity visual helpers ──────────────────────────────────────────────────

const severityStyles: Record<string, string> = {
  low:    "bg-[#FFF3CD] text-[#664D03] border border-[#FFECB5]",
  medium: "bg-[#FFF0CD] text-[#A46F00] border border-[#FFC107]/30",
  high:   "bg-[#FFE4E4] text-[#B91C1C] border border-[#FCA5A5]/40",
};

// ─── Component ────────────────────────────────────────────────────────────────

const Pipelined = () => {
  const { user } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<PipelinedCompany | null>(null);
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [searchQuery, setSearchQuery]         = useState("");

  // Skill-gap state
  const [skillGapData, setSkillGapData]       = useState<SkillGapResponse | null>(null);
  const [gapLoading, setGapLoading]           = useState(false);
  const [gapError, setGapError]               = useState<string | null>(null);

  // Get student profile (for CGPA eligibility, kept from mockData)
  const studentProfile = useMemo(() => {
    if (user?.student_id) {
      return students.find(s => s.id === String(user.student_id)) || students[0];
    }
    return students[0];
  }, [user]);

  // ── Fetch real skill-gap data ────────────────────────────────────────────────
  useEffect(() => {
    const studentId = user?.student_id ?? 1; // fallback to 1 for demo
    setGapLoading(true);
    setGapError(null);

    fetch(`/api/student/skill-gap/${studentId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json() as Promise<SkillGapResponse>;
      })
      .then(data => {
        setSkillGapData(data);
        setGapLoading(false);
      })
      .catch(err => {
        console.error("[Pipelined] skill-gap fetch error:", err);
        setGapError("Could not load focus areas.");
        setGapLoading(false);
      });
  }, [user?.student_id]);

  // ── Build lookup: company_name → gap_skills ──────────────────────────────────
  const gapByCompany = useMemo<Record<string, GapSkill[]>>(() => {
    if (!skillGapData) return {};
    const map: Record<string, GapSkill[]> = {};
    for (const cg of skillGapData.companies) {
      map[cg.company_name] = cg.gap_skills;
    }
    return map;
  }, [skillGapData]);

  const filteredCompanies = pipelinedCompanies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleViewExperience = (company: PipelinedCompany) => {
    setSelectedCompany(company);
    setTimeout(() => setIsModalOpen(true), 10);
  };

  return (
    <TooltipProvider>
      <div className="space-y-12 pb-20">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-[#1D1D1F] sm:text-6xl">
              Pipelined Companies
            </h1>
            <p className="text-xl text-[#86868B] font-medium max-w-2xl leading-relaxed">
              Targeted insights based on your <span className="text-[#1D1D1F] underline decoration-[#0071E3]/30">current proficiency</span> and background.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868B] group-focus-within:text-[#0071E3] transition-colors" />
            <input
              type="text"
              placeholder="Search companies or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-black/5 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#0071E3]/10 focus:border-[#0071E3]/20 shadow-sm transition-all"
            />
          </div>
        </motion.div>

        {/* Main Grid */}
        <AnimatePresence mode="wait">
          {filteredCompanies.length > 0 ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {filteredCompanies.map((company, index) => {
                const isEligible  = studentProfile.cgpa >= company.minGpa;
                const focusSkills = gapByCompany[company.name] ?? [];

                // Skill match percentage: use real gap data when available
                const totalRequired  = company.skills.length;
                const gapCount       = focusSkills.length;
                const skillMatch     = totalRequired > 0
                  ? Math.round(((totalRequired - gapCount) / totalRequired) * 100)
                  : 100;
                const totalMatch = Math.round((skillMatch * 0.7) + (isEligible ? 30 : 0));

                return (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <Card className="group relative overflow-hidden bg-white border-0 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[28px] h-full flex flex-col">
                      <div className="absolute inset-0 bg-[#F5F5F7] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" />
                      
                      <CardContent className="relative p-10 flex flex-col h-full z-10">
                        <div className="flex justify-between items-start mb-8">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] group-hover:bg-white flex items-center justify-center text-3xl font-bold text-[#1D1D1F] border border-black/5 shadow-sm transition-colors duration-500">
                              {company.logo}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-[#1D1D1F] mb-1">{company.name}</h3>
                              <div className="flex items-center gap-2 text-[#86868B] text-sm font-semibold">
                                <Calendar className="w-4 h-4" />
                                <span>Drive Date: {format(company.driveDate, "MMM dd, yyyy")}</span>
                              </div>
                            </div>
                          </div>

                          {/* Eligibility Visuals */}
                          <div className="flex flex-col items-end gap-2">
                            {isEligible ? (
                              <Badge className="bg-[#EBFBF0] text-[#1D8F41] border-0 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Eligible
                              </Badge>
                            ) : (
                              <Badge className="bg-[#FEF1F2] text-[#E11D48] border-0 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <Tooltip>
                                  <TooltipTrigger>Below GPA</TooltipTrigger>
                                  <TooltipContent>Min. GPA {company.minGpa} required.</TooltipContent>
                                </Tooltip>
                              </Badge>
                            )}
                            <Badge variant="outline" className="border-black/10 text-[#424245] px-3 py-1 rounded-full font-bold">
                              {totalMatch}% Match
                            </Badge>
                          </div>
                        </div>

                        <p className="text-[#424245] mb-8 font-medium leading-relaxed">
                          {company.description}
                        </p>

                        <div className="mt-auto space-y-6">
                          {/* Skill Stack */}
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-[#86868B] uppercase tracking-widest">Required Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {company.skills.map((skill) => (
                                <Badge 
                                  key={skill} 
                                  variant="secondary" 
                                  className="bg-[#F5F5F7]/80 text-[#424245] border-0 px-3 py-1 text-xs font-bold rounded-full"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* ── Focus Areas (real-time from API) ── */}
                          {gapLoading ? (
                            <div className="flex items-center gap-2 text-[#86868B] text-sm py-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading focus areas…
                            </div>
                          ) : gapError ? (
                            <p className="text-xs text-[#E11D48]">{gapError}</p>
                          ) : focusSkills.length > 0 ? (
                            <div className="bg-[#FFF8E1]/40 p-5 rounded-3xl border border-[#FFC107]/20 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[#A46F00] font-bold text-sm">
                                  <Target className="w-4 h-4" />
                                  Your Focus Areas
                                </div>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="w-4 h-4 text-[#A46F00]/60 hover:text-[#A46F00] transition-colors" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-[#1D1D1F] text-white border-0 py-2 px-3">
                                    Skills where your proficiency is below this company's requirement.
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {focusSkills.map((gs) => (
                                  <Tooltip key={gs.skill_name}>
                                    <TooltipTrigger asChild>
                                      <Badge 
                                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg cursor-default ${
                                          severityStyles[gs.gap_severity] ?? severityStyles.medium
                                        }`}
                                      >
                                        {gs.skill_name}
                                        <span className="ml-1 opacity-70">−{gs.gap_score}</span>
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-[#1D1D1F] text-white border-0 text-xs">
                                      You: {gs.student_proficiency}% · Required: {gs.min_required}% · Gap: {gs.gap_score} pts
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {/* Interview Experience with Year Label */}
                          <div className="flex items-center gap-4">
                            <Button 
                              onClick={() => handleViewExperience(company)}
                              className="flex-1 bg-[#1D1D1F] hover:bg-black text-white rounded-full py-6 text-base font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                            >
                              <FileText className="w-5 h-5" />
                              View Experience PDF
                            </Button>
                            <div className="flex flex-col items-center justify-center bg-[#F5F5F7] h-14 w-20 rounded-2xl border border-black/5 shadow-inner">
                              <span className="text-[10px] font-black text-[#86868B] uppercase">Edition</span>
                              <span className="text-sm font-black text-[#1D1D1F]">{company.experienceYear}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[32px] border border-black/5 shadow-sm"
            >
              <div className="w-32 h-32 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-8">
                <GitBranch className="w-14 h-14 text-[#D2D2D7]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1D1D1F] mb-3">No matching company drives yet.</h2>
              <p className="text-[#86868B] text-lg font-medium px-6">Coordinate with your mentor to expand your target list.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Experience PDF Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-4xl p-0 bg-white/70 backdrop-blur-[40px] border-white/40 overflow-hidden rounded-[36px] shadow-[0_32px_128px_rgba(0,0,0,0.15)] ring-1 ring-black/5 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col h-[85vh]">
              <div className="p-10 border-b border-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/30">
                <div>
                  <DialogTitle className="text-3xl font-bold text-[#1D1D1F] mb-1">
                    {selectedCompany?.name} Experience
                  </DialogTitle>
                  <DialogDescription className="text-[#86868B] font-semibold text-base">
                    Official {selectedCompany?.experienceYear} Recruitment Log.
                  </DialogDescription>
                </div>
                <Button className="rounded-full bg-[#0071E3] hover:bg-[#0077ED] h-12 px-8 font-bold shadow-md gap-2">
                  <Download className="w-5 h-5" />
                  Download PDF
                </Button>
              </div>
              
              <div className="flex-1 bg-[#F5F5F7]/40 p-10 overflow-y-auto">
                <div className="w-full min-h-full bg-white rounded-[24px] border border-black/5 shadow-inner p-12 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-[#F5F5F7] rounded-3xl flex items-center justify-center mb-8">
                    <FileText className="w-10 h-10 text-[#D2D2D7]" />
                  </div>
                  <h4 className="text-xl font-bold text-[#1D1D1F] mb-8">Secure Document Preview</h4>
                  
                  <div className="space-y-10 w-full max-w-2xl text-left">
                    <div className="flex gap-6 items-start">
                      <div className="w-10 h-10 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center flex-shrink-0 font-bold">1</div>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-[#86868B] uppercase tracking-widest">Phase I: Screening</p>
                        <p className="text-lg font-bold text-[#1D1D1F]">Online Technical Assessment</p>
                        <p className="text-[#424245] leading-relaxed">Focus on Data Structures, Algorithms, and Core CS Fundamentals.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Pipelined;

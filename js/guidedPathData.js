const leaf = (id, label, desc, color, roadmap) => ({
  id,
  label,
  icon: "◈",
  desc,
  color,
  leaf: true,
  roadmap
});

const branch = (question, subtitle, options) => ({
  question,
  subtitle,
  options
});

export const CAREER_TREE = {
  id: "root",
  question: "Where are you right now?",
  subtitle: "Your journey begins with a single step",
  options: [
    {
      id: "student",
      label: "Student",
      icon: "◈",
      desc: "Currently in school / college",
      color: "#4fc3f7",
      children: branch("What stage are you at?", "Choose your current academic level", [
        {
          id: "after10",
          label: "After 10th",
          icon: "◈",
          desc: "Completed Class 10",
          color: "#81d4fa",
          children: branch("Which stream are you considering?", "Pick the path that excites you", [
            {
              id: "science",
              label: "Science",
              icon: "⬡",
              desc: "Physics, Chemistry, Math/Bio",
              color: "#4fc3f7",
              children: branch("What's your primary domain?", "Narrow your focus", [
                {
                  id: "engineering",
                  label: "Engineering",
                  icon: "◈",
                  desc: "Build the future",
                  color: "#29b6f6",
                  children: branch("Which engineering field?", "Your specialization defines your edge", [
                    {
                      id: "cse",
                      label: "Computer Science",
                      icon: "◈",
                      desc: "Software & AI",
                      color: "#4fc3f7",
                      children: branch("Choose your specialization", "Go deep into your craft", [
                        leaf("frontend", "Frontend Dev", "UI/UX engineering", "#4fc3f7", {
                          skills: ["HTML/CSS", "JavaScript", "React", "Figma"],
                          time: "3-4 years",
                          difficulty: "Medium",
                          personality: "Creative & Logical",
                          salary: "₹8–30 LPA",
                          backup: ["UI Designer", "Full Stack Dev"]
                        }),
                        leaf("backend", "Backend Dev", "APIs & systems", "#29b6f6", {
                          skills: ["Node.js", "Databases", "System Design", "Cloud"],
                          time: "3-4 years",
                          difficulty: "Medium-High",
                          personality: "Analytical",
                          salary: "₹10–35 LPA",
                          backup: ["DevOps", "Cloud Architect"]
                        }),
                        leaf("ai", "AI / ML", "Machine intelligence", "#00b0ff", {
                          skills: ["Python", "TensorFlow", "Statistics", "MLOps"],
                          time: "4-5 years",
                          difficulty: "High",
                          personality: "Research-minded",
                          salary: "₹15–50 LPA",
                          backup: ["Data Scientist", "Research Analyst"]
                        }),
                        leaf("cyber", "Cybersecurity", "Defense & offense", "#0091ea", {
                          skills: ["Networking", "Ethical Hacking", "Cryptography", "Linux"],
                          time: "3-5 years",
                          difficulty: "High",
                          personality: "Problem Solver",
                          salary: "₹12–40 LPA",
                          backup: ["Network Engineer", "SOC Analyst"]
                        })
                      ])
                    },
                    leaf("mechanical", "Mechanical", "Machines & systems", "#81d4fa", {
                      skills: ["CAD/CAM", "Thermodynamics", "Manufacturing", "AutoCAD"],
                      time: "4 years",
                      difficulty: "Medium-High",
                      personality: "Hands-on",
                      salary: "₹5–20 LPA",
                      backup: ["Design Engineer", "Production Manager"]
                    }),
                    leaf("electrical", "Electrical", "Power & electronics", "#b3e5fc", {
                      skills: ["Circuit Design", "Power Systems", "VLSI", "Embedded"],
                      time: "4 years",
                      difficulty: "High",
                      personality: "Detail-oriented",
                      salary: "₹6–22 LPA",
                      backup: ["Electronics Engineer", "Power Systems Analyst"]
                    }),
                    leaf("civil", "Civil", "Infrastructure & design", "#e1f5fe", {
                      skills: ["Structural Analysis", "AutoCAD", "Project Management", "GIS"],
                      time: "4 years",
                      difficulty: "Medium",
                      personality: "Visionary",
                      salary: "₹4–18 LPA",
                      backup: ["Urban Planner", "Project Manager"]
                    })
                  ])
                },
                {
                  id: "medicine",
                  label: "Medicine",
                  icon: "◈",
                  desc: "Heal and serve",
                  color: "#80cbc4",
                  children: branch("Which medical path?", "Define your healing journey", [
                    leaf("mbbs", "MBBS / MD", "Doctor", "#80cbc4", {
                      skills: ["Biology", "Clinical Skills", "Diagnostics", "Research"],
                      time: "5.5–8 years",
                      difficulty: "Very High",
                      personality: "Empathetic & Resilient",
                      salary: "₹8–60 LPA",
                      backup: ["Medical Researcher", "Healthcare Consultant"]
                    }),
                    leaf("dental", "Dentistry", "Oral health specialist", "#a5d6a7", {
                      skills: ["Anatomy", "Dental Surgery", "Patient Care"],
                      time: "5 years",
                      difficulty: "High",
                      personality: "Precise & Caring",
                      salary: "₹6–25 LPA",
                      backup: ["Maxillofacial Surgeon", "Orthodontist"]
                    }),
                    leaf("pharmacy", "Pharmacy", "Drug science", "#c8e6c9", {
                      skills: ["Pharmacology", "Chemistry", "Clinical Trials", "Regulatory Affairs"],
                      time: "4 years",
                      difficulty: "Medium-High",
                      personality: "Scientific",
                      salary: "₹5–20 LPA",
                      backup: ["R&D Scientist", "Drug Regulatory Specialist"]
                    })
                  ])
                },
                {
                  id: "research",
                  label: "Pure Science",
                  icon: "◈",
                  desc: "Physics, Math, Bio research",
                  color: "#ce93d8",
                  leaf: true,
                  roadmap: {
                    skills: ["Research Methodology", "Advanced Math", "Lab Work", "Publications"],
                    time: "5–7 years",
                    difficulty: "Very High",
                    personality: "Curious & Persistent",
                    salary: "₹4–30 LPA (academia)",
                    backup: ["Data Analyst", "Science Communicator"]
                  }
                }
              ])
            },
            {
              id: "commerce",
              label: "Commerce",
              icon: "⬡",
              desc: "Business & Finance",
              color: "#ffcc80",
              children: branch("Choose your finance domain", "Where money meets strategy", [
                leaf("ca", "Chartered Accountancy", "CA / CPA", "#ffb74d", {
                  skills: ["Accounting", "Tax Law", "Audit", "Finance"],
                  time: "4-5 years",
                  difficulty: "Very High",
                  personality: "Detail-oriented & Disciplined",
                  salary: "₹7–40 LPA",
                  backup: ["Financial Analyst", "CFO"]
                }),
                leaf("investment", "Investment Banking", "Markets & Deals", "#ffa726", {
                  skills: ["Financial Modeling", "Valuation", "Excel", "Communication"],
                  time: "4-6 years",
                  difficulty: "High",
                  personality: "Ambitious & Analytical",
                  salary: "₹15–80 LPA",
                  backup: ["Equity Analyst", "MBA Finance"]
                }),
                leaf("marketing", "Marketing / Brand", "Build brands, drive growth", "#ffcc02", {
                  skills: ["Digital Marketing", "Data Analytics", "Branding", "Content"],
                  time: "3-4 years",
                  difficulty: "Medium",
                  personality: "Creative & Social",
                  salary: "₹5–25 LPA",
                  backup: ["Brand Consultant", "Growth Hacker"]
                })
              ])
            },
            {
              id: "arts",
              label: "Arts / Humanities",
              icon: "⬡",
              desc: "Culture, Law, Design",
              color: "#f48fb1",
              children: branch("What's your passion?", "Arts opens more doors than you think", [
                leaf("law", "Law / LLB", "Justice & advocacy", "#f48fb1", {
                  skills: ["Legal Research", "Argumentation", "Constitutional Law", "Drafting"],
                  time: "5 years",
                  difficulty: "High",
                  personality: "Articulate & Principled",
                  salary: "₹5–50 LPA",
                  backup: ["Corporate Counsel", "Policy Advisor"]
                }),
                leaf("design", "Design / Fine Arts", "Visual communication", "#f8bbd0", {
                  skills: ["Design Thinking", "Figma/Adobe", "Typography", "UX Research"],
                  time: "4 years",
                  difficulty: "Medium",
                  personality: "Creative & Observant",
                  salary: "₹4–30 LPA",
                  backup: ["UX Designer", "Brand Strategist"]
                }),
                leaf("journalism", "Journalism / Media", "Tell the world's stories", "#fce4ec", {
                  skills: ["Writing", "Video Production", "Research", "Social Media"],
                  time: "3-4 years",
                  difficulty: "Medium",
                  personality: "Curious & Bold",
                  salary: "₹3–20 LPA",
                  backup: ["Content Strategist", "PR Manager"]
                })
              ])
            }
          ])
        },

        {
          id: "after12",
          label: "After 12th",
          icon: "◈",
          desc: "Completed Class 12",
          color: "#4fc3f7",
          children: branch("Your stream from 12th?", "Your past shapes your options", [
            {
              id: "s12sci",
              label: "Science (PCM/PCB)",
              icon: "⬡",
              desc: "Technical path",
              color: "#4fc3f7",
              children: branch("What's your goal?", "Set the destination", [
                leaf("iit", "IIT / NIT Engineering", "JEE path", "#29b6f6", {
                  skills: ["JEE Prep", "Core Engineering", "Internships", "Placements"],
                  time: "4 years",
                  difficulty: "Very High",
                  personality: "Competitive & Driven",
                  salary: "₹12–60 LPA",
                  backup: ["Other colleges", "GATE + M.Tech"]
                }),
                leaf("neet", "NEET / AIIMS", "Medical school", "#80cbc4", {
                  skills: ["Biology", "NEET Prep", "MBBS curriculum"],
                  time: "5.5 years",
                  difficulty: "Very High",
                  personality: "Patient & Dedicated",
                  salary: "₹8–60 LPA",
                  backup: ["AYUSH", "Pharmacy"]
                }),
                leaf("bsc", "B.Sc + Research", "Pure science route", "#ce93d8", {
                  skills: ["Core Science", "Research Methods", "Publications", "GATE/NET"],
                  time: "5-7 years",
                  difficulty: "High",
                  personality: "Intellectual",
                  salary: "₹4–25 LPA",
                  backup: ["Teaching", "Science Writing"]
                })
              ])
            },
            leaf("s12com", "Commerce", "Business path", "#ffcc80", {
              skills: ["B.Com / BBA", "CA / MBA prep", "Finance basics"],
              time: "3-5 years",
              difficulty: "Medium",
              personality: "Entrepreneurial",
              salary: "₹5–40 LPA",
              backup: ["Management Consultant", "Entrepreneur"]
            }),
            leaf("s12arts", "Arts", "Humanities track", "#f48fb1", {
              skills: ["Critical Thinking", "Communication", "Research", "Domain expertise"],
              time: "3-5 years",
              difficulty: "Medium",
              personality: "Diverse & Open-minded",
              salary: "₹3–35 LPA",
              backup: ["Civil Services", "Academia"]
            })
          ])
        }
      ])
    },

    {
      id: "undergrad",
      label: "Undergraduate",
      icon: "◈",
      desc: "Currently in college",
      color: "#81d4fa",
      children: branch("What's your focus now?", "Make the most of your college years", [
        leaf("campus", "Campus Placements", "Get placed via college", "#4fc3f7", {
          skills: ["DSA", "Interview Prep", "Communication", "Domain skills"],
          time: "6-12 months",
          difficulty: "Medium-High",
          personality: "Goal-oriented",
          salary: "Varies by company",
          backup: ["Internships", "Higher studies"]
        }),
        leaf("startup_ug", "Start a Venture", "Build something of your own", "#29b6f6", {
          skills: ["Problem Identification", "Product Thinking", "Fundraising", "Team Building"],
          time: "2-5 years",
          difficulty: "Very High",
          personality: "Risk-taker & Visionary",
          salary: "0 to ∞",
          backup: ["Job + Side project", "Incubators"]
        }),
        leaf("masters", "Plan for Masters", "GRE / GMAT / UPSC", "#00b0ff", {
          skills: ["GRE/GMAT Prep", "Research", "SOP Writing", "Networking"],
          time: "2-3 years additional",
          difficulty: "High",
          personality: "Academic & Ambitious",
          salary: "₹15–60 LPA post-MS",
          backup: ["MBA", "Ph.D"]
        })
      ])
    },

    {
      id: "postgrad",
      label: "Postgraduate",
      icon: "◈",
      desc: "Masters or PhD level",
      color: "#b39ddb",
      children: branch("What's your postgrad goal?", "Leverage your advanced degree", [
        leaf("research_pg", "Academia & Research", "PhD / Professor path", "#9575cd", {
          skills: ["Research Publication", "Grant Writing", "Teaching", "Domain expertise"],
          time: "3-6 years",
          difficulty: "Very High",
          personality: "Intellectual & Patient",
          salary: "₹6–40 LPA (grows with seniority)",
          backup: ["Industry Research", "Think Tanks"]
        }),
        leaf("industry_pg", "Industry / Corporate", "Apply your expertise", "#7e57c2", {
          skills: ["Specialized domain skills", "Leadership", "Consulting", "Strategy"],
          time: "Immediate",
          difficulty: "Medium",
          personality: "Results-driven",
          salary: "₹12–60 LPA",
          backup: ["Consulting", "Entrepreneurship"]
        }),
        leaf("global", "Global Opportunities", "Work or study abroad", "#b39ddb", {
          skills: ["Language skills", "Visa process", "Networking abroad", "Cultural adaptability"],
          time: "1-3 years",
          difficulty: "High",
          personality: "Adventurous",
          salary: "$80K–$200K abroad",
          backup: ["Remote work", "Return to India"]
        })
      ])
    },

    {
      id: "dropout",
      label: "Dropout",
      icon: "◈",
      desc: "Left formal education",
      color: "#ef9a9a",
      children: branch("What's your next move?", "Many legends dropped out. What's your story?", [
        leaf("selflearn", "Self-Learning & Skills", "Build expertise independently", "#e57373", {
          skills: ["Online courses", "Portfolio building", "Freelancing", "Open source"],
          time: "1-2 years",
          difficulty: "Medium",
          personality: "Self-driven & Disciplined",
          salary: "₹3–25 LPA freelance",
          backup: ["Return to college", "Bootcamps"]
        }),
        leaf("startup_drop", "Build a Startup", "The classic dropout path", "#ef9a9a", {
          skills: ["Product thinking", "Sales", "Fundraising", "Resilience"],
          time: "2-5 years",
          difficulty: "Extreme",
          personality: "Visionary & Fearless",
          salary: "0 to ∞",
          backup: ["Join a startup", "Freelance"]
        }),
        leaf("trade", "Trade / Skilled Work", "Electrician, plumber, chef etc.", "#ffcdd2", {
          skills: ["Vocational training", "Apprenticeship", "Certification", "Business skills"],
          time: "1-3 years",
          difficulty: "Low-Medium",
          personality: "Practical & Hands-on",
          salary: "₹3–15 LPA",
          backup: ["Franchise", "Consulting"]
        })
      ])
    },

    {
      id: "working",
      label: "Working Professional",
      icon: "◈",
      desc: "Already in the workforce",
      color: "#a5d6a7",
      children: branch("What's your career goal?", "Evolve your professional journey", [
        {
          id: "upskill",
          label: "Upskill in Current Field",
          icon: "◈",
          desc: "Go deeper, earn more",
          color: "#81c784",
          children: branch("How do you want to upskill?", "Choose your growth vehicle", [
            leaf("certifications", "Certifications", "AWS, PMP, CFA, etc.", "#66bb6a", {
              skills: ["Relevant certs", "Online learning", "Practice exams"],
              time: "3-12 months",
              difficulty: "Medium",
              personality: "Structured learner",
              salary: "+20-40% salary bump",
              backup: ["MBA", "In-house training"]
            }),
            leaf("mba", "MBA / Executive MBA", "Leadership acceleration", "#a5d6a7", {
              skills: ["GMAT/CAT", "Leadership", "Strategy", "Finance"],
              time: "2 years",
              difficulty: "High",
              personality: "Ambitious",
              salary: "₹20–80 LPA post-MBA",
              backup: ["Executive programs", "Online MBA"]
            })
          ])
        },
        {
          id: "switch",
          label: "Switch Career",
          icon: "◈",
          desc: "Pivot to a new domain",
          color: "#4caf50",
          children: branch("Where do you want to switch?", "Your experience is your advantage", [
            leaf("tech_switch", "Switch to Tech", "Bootcamp or self-learn", "#43a047", {
              skills: ["Coding bootcamp", "Portfolio projects", "Networking", "DSA"],
              time: "6-18 months",
              difficulty: "Medium-High",
              personality: "Adaptable & Persistent",
              salary: "₹8–35 LPA",
              backup: ["Tech-adjacent roles", "Product Management"]
            }),
            leaf("pm", "Product Management", "Lead product teams", "#388e3c", {
              skills: ["Product thinking", "Data analysis", "Roadmapping", "Stakeholder management"],
              time: "6-12 months transition",
              difficulty: "Medium",
              personality: "Strategic & Empathetic",
              salary: "₹15–60 LPA",
              backup: ["Business Analyst", "Consulting"]
            }),
            leaf("consulting", "Consulting", "Advise companies", "#2e7d32", {
              skills: ["Case interviews", "Frameworks", "Communication", "Excel/PPT"],
              time: "3-6 months prep",
              difficulty: "High",
              personality: "Analytical & Persuasive",
              salary: "₹15–70 LPA",
              backup: ["Internal Strategy", "Freelance Consulting"]
            })
          ])
        },
        leaf("startup_pro", "Start Your Own Venture", "Leverage experience to build", "#c8e6c9", {
          skills: ["Domain expertise", "Business modeling", "Fundraising", "Leadership"],
          time: "2-5 years",
          difficulty: "Very High",
          personality: "Risk-tolerant & Visionary",
          salary: "0 to ∞",
          backup: ["Consulting", "Advisory roles"]
        })
      ])
    }
  ]
};
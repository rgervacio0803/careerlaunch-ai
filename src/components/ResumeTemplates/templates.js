import ModernResume from "./ModernResume";
import ProfessionalResume from "./ProfessionalResume";
import MinimalResume from "./MinimalResume";
import ExecutiveResume from "./ExecutiveResume";
import TechResume from "./TechResume";
import ExecutiveEliteResume from "./ExecutiveEliteResume";
import ExecutiveBlueResume from "./ExecutiveBlueResume";
import HealthcareProfessionalResume from "./HealthcareProfessionalResume";

// Every resume template, in gallery order. Used by the gallery, the preview
// and the PDF download, so all three always show the same design.
export const templateOptions = [
  {
    id: "executive-elite",
    name: "Executive Elite",
    description: "Leadership-focused premium layout",
    bestFor: "Management, healthcare, and senior professionals",
    component: ExecutiveEliteResume,
  },
  {
    id: "executive-blue",
    name: "Executive Blue",
    description: "Modern blue sidebar layout",
    bestFor: "Corporate leadership and senior professionals",
    component: ExecutiveBlueResume,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean blue-accent layout",
    bestFor: "General professional roles",
    component: ModernResume,
  },
  {
    id: "professional",
    name: "Professional",
    description: "Classic corporate style",
    bestFor: "Business and corporate roles",
    component: ProfessionalResume,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant",
    bestFor: "ATS-friendly applications",
    component: MinimalResume,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Leadership and executive style",
    bestFor: "Managers and directors",
    component: ExecutiveResume,
  },
  {
    id: "tech",
    name: "Tech",
    description: "Developer-focused skills layout",
    bestFor: "Software, IT, and engineering",
    component: TechResume,
  },
  {
    id: "healthcare-professional",
    name: "Healthcare Professional",
    description: "Clean clinical and medical layout",
    bestFor: "Healthcare, laboratory, nursing, and medical roles",
    component: HealthcareProfessionalResume,
  },
];

export function getTemplate(id) {
  return templateOptions.find((template) => template.id === id) || templateOptions[2];
}

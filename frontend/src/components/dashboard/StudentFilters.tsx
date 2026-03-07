import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";

interface StudentFiltersProps {
  skills: string[];
  selectedSkills: string[];
  onSkillChange: (skill: string) => void;
  cgpaRange: number[];
  onCgpaChange: (range: number[]) => void;
  hideArrears: boolean;
  onHideArrearsChange: (checked: boolean) => void;
  onClearFilters: () => void;
}

export function StudentFilters({
  skills,
  selectedSkills,
  onSkillChange,
  cgpaRange,
  onCgpaChange,
  hideArrears,
  onHideArrearsChange,
  onClearFilters,
}: StudentFiltersProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground"
            onClick={onClearFilters}
          >
            <FilterX className="mr-2 h-3.5 w-3.5" />
            Clear
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">CGPA Range: {cgpaRange[0]} - {cgpaRange[1]}</Label>
            <Slider
              defaultValue={[0, 10]}
              max={10}
              step={0.1}
              value={cgpaRange}
              onValueChange={onCgpaChange}
              className="mt-2"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="hide-arrears"
              checked={hideArrears}
              onCheckedChange={(checked) => onHideArrearsChange(checked as boolean)}
            />
            <Label
              htmlFor="hide-arrears"
              className="text-sm font-normal cursor-pointer leading-none"
            >
              Hide students with current arrears
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">Skills</Label>
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="space-y-2">
            {skills.map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={selectedSkills.includes(skill)}
                  onCheckedChange={() => onSkillChange(skill)}
                />
                <Label
                  htmlFor={`skill-${skill}`}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {skill}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

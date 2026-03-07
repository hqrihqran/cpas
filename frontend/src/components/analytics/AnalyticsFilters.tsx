import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FilterX } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useState } from "react";

interface AnalyticsFiltersProps {
    packageRange: number[];
    onPackageRangeChange: (range: number[]) => void;
    selectedSkill: string;
    onSkillChange: (skill: string) => void;
    availableSkills: string[];
    selectedYear: string;
    onYearChange: (year: string) => void;
    availableYears: string[];
    onReset: () => void;
}

export function AnalyticsFilters({
    packageRange,
    onPackageRangeChange,
    selectedSkill,
    onSkillChange,
    availableSkills,
    selectedYear,
    onYearChange,
    availableYears,
    onReset,
}: AnalyticsFiltersProps) {
    const [openSkill, setOpenSkill] = useState(false);

    return (
        <div className="flex flex-col md:flex-row gap-4 items-end bg-card p-4 rounded-lg border shadow-sm mb-6">

            {/* Package Range Slider */}
            <div className="w-full md:w-1/3 space-y-2">
                <div className="flex justify-between">
                    <Label className="text-xs font-medium">Package Range (LPA)</Label>
                    <span className="text-xs text-muted-foreground">{packageRange[0]} - {packageRange[1]} LPA</span>
                </div>
                <Slider
                    defaultValue={[0, 50]}
                    max={50}
                    step={1}
                    value={packageRange}
                    onValueChange={onPackageRangeChange}
                />
            </div>

            {/* Skill Selector (Combobox) */}
            <div className="w-full md:w-1/4 space-y-2">
                <Label className="text-xs font-medium">Filter by Skill</Label>
                <Popover open={openSkill} onOpenChange={setOpenSkill}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openSkill}
                            className="w-full justify-between"
                        >
                            {selectedSkill === "All"
                                ? "All Skills"
                                : selectedSkill}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandInput placeholder="Search skill..." />
                            <CommandList>
                                <CommandEmpty>No skill found.</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem
                                        value="All"
                                        onSelect={() => {
                                            onSkillChange("All");
                                            setOpenSkill(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedSkill === "All" ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        All Skills
                                    </CommandItem>
                                    {availableSkills.map((skill) => (
                                        <CommandItem
                                            key={skill}
                                            value={skill}
                                            onSelect={(currentValue) => {
                                                // Because Radix UI Command converts value to lowercase, we need to match it back
                                                // Ideally we pass the original casing. For now assuming simple string match or passing the original from map
                                                onSkillChange(skill);
                                                setOpenSkill(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedSkill === skill ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {skill}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Academic Year Selector */}
            <div className="w-full md:w-1/4 space-y-2">
                <Label className="text-xs font-medium">Academic Year</Label>
                <Select value={selectedYear} onValueChange={onYearChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Years</SelectItem>
                        {availableYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Reset Button */}
            <Button variant="ghost" onClick={onReset} className="w-full md:w-auto">
                <FilterX className="mr-2 h-4 w-4" /> Reset
            </Button>
        </div>
    );
}

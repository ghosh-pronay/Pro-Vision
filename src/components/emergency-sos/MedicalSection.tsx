import { motion } from "framer-motion"
import {
  Stethoscope,
  Droplets,
  AlertCircle,
  Pill,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react"
import { MedicalInfo, BLOOD_TYPES, fadeUp } from "./types"
import { useState } from "react"

interface MedicalSectionProps {
  lang: string
  medicalInfo: MedicalInfo
  onSetMedicalInfo: (info: MedicalInfo) => void
}

interface MedicalListProps {
  title: string
  icon: React.ReactNode
  items: string[]
  value: string
  onChange: (v: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  placeholder: string
}

function MedicalList({
  title,
  icon,
  items,
  value,
  onChange,
  onAdd,
  onRemove,
  placeholder,
}: MedicalListProps) {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
        {icon}
        {title}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 rounded-lg border bg-background text-sm"
        />
        <button
          onClick={onAdd}
          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/5 text-sm"
            >
              {item}
              <button
                onClick={() => onRemove(i)}
                className="cursor-pointer text-muted-foreground hover:text-red-500"
                aria-label="Remove item"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function MedicalSection({
  lang,
  medicalInfo,
  onSetMedicalInfo,
}: MedicalSectionProps) {
  const [newAllergy, setNewAllergy] = useState("")
  const [newMedication, setNewMedication] = useState("")
  const [newCondition, setNewCondition] = useState("")

  const addToList = (
    field: "allergies" | "medications" | "conditions",
    value: string,
    setter: (v: string) => void,
  ) => {
    if (!value.trim()) return
    onSetMedicalInfo({
      ...medicalInfo,
      [field]: [...medicalInfo[field], value.trim()],
    })
    setter("")
  }

  const removeFromList = (
    field: "allergies" | "medications" | "conditions",
    index: number,
  ) => {
    onSetMedicalInfo({
      ...medicalInfo,
      [field]: medicalInfo[field].filter((_, i) => i !== index),
    })
  }

  return (
    <motion.div variants={fadeUp} className="glass rounded-2xl p-5">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Stethoscope className="h-5 w-5 text-primary" />
        {lang === "bn" ? "চিকিৎসা তথ্য" : "Medical Info"}
      </h2>

      <div className="mb-4">
        <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
          <Droplets className="h-4 w-4 text-red-500" />
          {lang === "bn" ? "রক্তের গ্রুপ" : "Blood Type"}
        </label>
        <div className="flex flex-wrap gap-2">
          {BLOOD_TYPES.map((bt) => (
            <button
              key={bt}
              onClick={() =>
                onSetMedicalInfo({ ...medicalInfo, bloodType: bt })
              }
              className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors
                ${
                  medicalInfo.bloodType === bt
                    ? "bg-red-500 text-white"
                    : "bg-foreground/5 hover:bg-foreground/10 text-muted-foreground"
                }`}
            >
              {bt}
            </button>
          ))}
        </div>
      </div>

      <MedicalList
        title={lang === "bn" ? "অ্যালার্জি" : "Allergies"}
        icon={<AlertCircle className="h-4 w-4 text-orange-500" />}
        items={medicalInfo.allergies}
        value={newAllergy}
        onChange={setNewAllergy}
        onAdd={() => addToList("allergies", newAllergy, setNewAllergy)}
        onRemove={(i) => removeFromList("allergies", i)}
        placeholder={
          lang === "bn" ? "অ্যালার্জি যোগ করুন..." : "Add allergy..."
        }
      />

      <MedicalList
        title={lang === "bn" ? "ওষুধ" : "Medications"}
        icon={<Pill className="h-4 w-4 text-blue-500" />}
        items={medicalInfo.medications}
        value={newMedication}
        onChange={setNewMedication}
        onAdd={() => addToList("medications", newMedication, setNewMedication)}
        onRemove={(i) => removeFromList("medications", i)}
        placeholder={lang === "bn" ? "ওষুধ যোগ করুন..." : "Add medication..."}
      />

      <MedicalList
        title={lang === "bn" ? "অবস্থা" : "Conditions"}
        icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
        items={medicalInfo.conditions}
        value={newCondition}
        onChange={setNewCondition}
        onAdd={() => addToList("conditions", newCondition, setNewCondition)}
        onRemove={(i) => removeFromList("conditions", i)}
        placeholder={lang === "bn" ? "অবস্থা যোগ করুন..." : "Add condition..."}
      />
    </motion.div>
  )
}

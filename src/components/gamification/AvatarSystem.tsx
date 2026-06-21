import { useState } from "react";

import { Check, Palette } from "lucide-react";

interface AvatarConfig {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  outfit: string;
  accessory: string;
  background: string;
}

interface AvatarSystemProps {
  config: AvatarConfig;
  onChange: (config: AvatarConfig) => void;
  size?: "sm" | "md" | "lg" | "xl";
}

const SKIN_TONES = ["#FDDBB4", "#F1C27D", "#E0AC69", "#C68642", "#8D5524", "#5C3D2E"];

const HAIR_STYLES = ["short", "medium", "long", "curly", "buzz", "ponytail"];
const HAIR_COLORS = ["#090806", "#2C222B", "#71635A", "#B7A69E", "#D6C4C2", "#B55239", "#8D4A43", "#91553D", "#000000", "#E6BE8A"];

const OUTFITS = ["tshirt", "hoodie", "suit", "casual", "sporty", "traditional"];
const OUTFIT_COLORS = ["#1F2937", "#1E40AF", "#047857", "#B91C1C", "#7C3AED", "#D97706"];

const ACCESSORIES = ["none", "glasses", "headphones", "cap", "scarf"];
const BACKGROUNDS = ["#6366F1", "#EC4899", "#22C55E", "#F59E0B", "#06B6D4", "#8B5CF6", "#EF4444", "#14B8A6"];

function AvatarPreview({ config, size = "lg" }: { config: AvatarConfig; size?: string }) {
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-32 w-32",
    xl: "h-48 w-48",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center relative overflow-hidden`}
      style={{ backgroundColor: config.background }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Body/Outfit */}
        <ellipse cx="50" cy="85" rx="35" ry="20" fill={OUTFIT_COLORS[OUTFITS.indexOf(config.outfit) % OUTFIT_COLORS.length]} />

        {/* Neck */}
        <rect x="42" y="55" width="16" height="15" fill={config.skinTone} />

        {/* Head */}
        <circle cx="50" cy="40" r="25" fill={config.skinTone} />

        {/* Hair */}
        <ellipse cx="50" cy="28" rx="26" ry="18" fill={config.hairColor} />

        {/* Eyes */}
        <ellipse cx="40" cy="40" rx="3" ry="3.5" fill="#1F2937" />
        <ellipse cx="60" cy="40" rx="3" ry="3.5" fill="#1F2937" />

        {/* Smile */}
        <path d="M 42 50 Q 50 58 58 50" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Accessories */}
        {config.accessory === "glasses" && (
          <>
            <circle cx="40" cy="40" r="8" stroke="#1F2937" strokeWidth="2" fill="none" />
            <circle cx="60" cy="40" r="8" stroke="#1F2937" strokeWidth="2" fill="none" />
            <line x1="48" y1="40" x2="52" y2="40" stroke="#1F2937" strokeWidth="2" />
          </>
        )}
        {config.accessory === "headphones" && (
          <>
            <path d="M 22 35 Q 22 15 50 15 Q 78 15 78 35" stroke="#1F2937" strokeWidth="3" fill="none" />
            <rect x="18" y="30" width="8" height="12" rx="2" fill="#1F2937" />
            <rect x="74" y="30" width="8" height="12" rx="2" fill="#1F2937" />
          </>
        )}
        {config.accessory === "cap" && (
          <>
            <ellipse cx="50" cy="22" rx="28" ry="10" fill="#1F2937" />
            <rect x="22" y="18" width="56" height="8" fill="#1F2937" />
          </>
        )}
      </svg>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function AvatarSystem({ config, onChange, size = "lg" }: AvatarSystemProps) {
  const [activeTab, setActiveTab] = useState<"skin" | "hair" | "outfit" | "accessory" | "background">("skin");

  const tabs = [
    { id: "skin" as const, label: "Skin" },
    { id: "hair" as const, label: "Hair" },
    { id: "outfit" as const, label: "Outfit" },
    { id: "accessory" as const, label: "Extras" },
    { id: "background" as const, label: "BG" },
  ];

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Customize Avatar</h3>
      </div>

      <div className="flex justify-center mb-6">
        <AvatarPreview config={config} size="xl" />
      </div>

      <div className="flex justify-center gap-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[120px]">
        {activeTab === "skin" && (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {SKIN_TONES.map((tone) => (
              <button
                key={tone}
                onClick={() => onChange({ ...config, skinTone: tone })}
                className={`h-10 w-10 rounded-full border-2 transition-all ${
                  config.skinTone === tone ? "border-primary scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: tone }}
              >
                {config.skinTone === tone && <Check className="h-4 w-4 mx-auto text-white" />}
              </button>
            ))}
          </div>
        )}

        {activeTab === "hair" && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Style</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {HAIR_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => onChange({ ...config, hairStyle: style })}
                    className={`p-2 rounded-lg text-xs capitalize transition-colors ${
                      config.hairStyle === style
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Color</p>
              <div className="grid grid-cols-5 gap-2">
                {HAIR_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onChange({ ...config, hairColor: color })}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      config.hairColor === color ? "border-primary scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "outfit" && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Style</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {OUTFITS.map((outfit) => (
                  <button
                    key={outfit}
                    onClick={() => onChange({ ...config, outfit })}
                    className={`p-2 rounded-lg text-xs capitalize transition-colors ${
                      config.outfit === outfit
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {outfit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "accessory" && (
          <div className="grid grid-cols-5 gap-2">
            {ACCESSORIES.map((accessory) => (
              <button
                key={accessory}
                onClick={() => onChange({ ...config, accessory })}
                className={`p-3 rounded-lg text-xs capitalize transition-colors ${
                  config.accessory === accessory
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                {accessory}
              </button>
            ))}
          </div>
        )}

        {activeTab === "background" && (
          <div className="grid grid-cols-8 gap-2">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg}
                onClick={() => onChange({ ...config, background: bg })}
                className={`h-10 w-10 rounded-full border-2 transition-all ${
                  config.background === bg ? "border-white scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: bg }}
              >
                {config.background === bg && <Check className="h-4 w-4 mx-auto text-white" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { AvatarPreview, type AvatarConfig };

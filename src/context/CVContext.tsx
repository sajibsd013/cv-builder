"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import sampleCVProfile from "@/lib/sampleData";
import type {
  CVProfile,
  CVSettings,
  CustomSection,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  PersonalInfo,
  ProjectItem,
  SkillItem,
} from "@/types/cv";

const STORAGE_KEY = "cv_builder_profiles_v1";

interface StoredProfiles {
  profiles: CVProfile[];
  activeProfileId: string | null;
}

interface CVContextValue {
  profiles: CVProfile[];
  activeCV: CVProfile | null;
  activeProfileId: string | null;
  isLoaded: boolean;
  autoSaveStatus: "saved" | "saving";
  createProfile: (profile?: Partial<CVProfile>) => CVProfile;
  duplicateProfile: (profileId?: string) => CVProfile | null;
  deleteProfile: (profileId?: string) => void;
  switchProfile: (profileId: string) => void;
  updateActiveCV: (
    updates: Partial<CVProfile> | ((profile: CVProfile) => CVProfile),
  ) => void;
  exportAsJSON: () => void;
  importFromJSON: (file: File) => Promise<void>;
  loadSampleData: () => void;
}

const CVContext = createContext<CVContextValue | undefined>(undefined);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isPersonalInfo(value: unknown): value is PersonalInfo {
  if (!isRecord(value)) return false;
  return (
    isString(value.fullName) &&
    isString(value.jobTitle) &&
    isString(value.email) &&
    isString(value.phone) &&
    isString(value.location) &&
    isString(value.summary)
  );
}

function isExperienceItem(value: unknown): value is ExperienceItem {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.jobTitle) &&
    isString(value.company) &&
    isString(value.startDate) &&
    typeof value.isCurrent === "boolean" &&
    isStringArray(value.achievements) &&
    isStringArray(value.technologies)
  );
}

function isEducationItem(value: unknown): value is EducationItem {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.degree) &&
    isString(value.institution) &&
    isString(value.startDate)
  );
}

function isSkillItem(value: unknown): value is SkillItem {
  if (!isRecord(value)) return false;
  return isString(value.id) && isString(value.name);
}

function isProjectItem(value: unknown): value is ProjectItem {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.description) &&
    isStringArray(value.technologies) &&
    isStringArray(value.highlights)
  );
}

function isLanguageItem(value: unknown): value is LanguageItem {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.language) &&
    typeof value.proficiency === "string" &&
    ["A1", "A2", "B1", "B2", "C1", "C2"].includes(value.proficiency)
  );
}

function isCustomSection(value: unknown): value is CustomSection {
  if (!isRecord(value) || !isString(value.id) || !isString(value.title)) {
    return false;
  }
  return (
    Array.isArray(value.items) &&
    value.items.every((item) => {
      if (!isRecord(item)) return false;
      return isString(item.id) && isString(item.title) && isString(item.content);
    })
  );
}

function isCVSettings(value: unknown): value is CVSettings {
  if (!isRecord(value) || !isString(value.template)) return false;
  return (
    ["europass", "modern", "ats"].includes(value.template) &&
    isString(value.accentColor) &&
    isString(value.fontFamily) &&
    ["inter", "jakarta", "merriweather", "roboto"].includes(value.fontFamily) &&
    typeof value.fontSize === "number" &&
    Array.isArray(value.sectionOrder) &&
    value.sectionOrder.every(isString)
  );
}

function isCVProfile(value: unknown): value is CVProfile {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.name) &&
    isPersonalInfo(value.personalInfo) &&
    Array.isArray(value.experience) &&
    value.experience.every(isExperienceItem) &&
    Array.isArray(value.education) &&
    value.education.every(isEducationItem) &&
    Array.isArray(value.skills) &&
    value.skills.every(isSkillItem) &&
    Array.isArray(value.projects) &&
    value.projects.every(isProjectItem) &&
    Array.isArray(value.languages) &&
    value.languages.every(isLanguageItem) &&
    Array.isArray(value.customSections) &&
    value.customSections.every(isCustomSection) &&
    isCVSettings(value.settings) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

function isStoredProfiles(value: unknown): value is StoredProfiles {
  if (!isRecord(value) || !Array.isArray(value.profiles)) return false;
  return (
    value.profiles.every(isCVProfile) &&
    (value.activeProfileId === null || isString(value.activeProfileId))
  );
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `cv-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function cloneProfile(profile: CVProfile): CVProfile {
  return structuredClone(profile);
}

function normalizeProfile(profile: CVProfile): CVProfile {
  const photoShape = profile.personalInfo.photoShape as string;
  return {
    ...profile,
    personalInfo: {
      ...profile.personalInfo,
      photoShape: photoShape === "square" || photoShape === "rounded" ? "square" : "circle",
    },
  };
}

function createProfileFrom(
  profile: Partial<CVProfile> = {},
  base: CVProfile = sampleCVProfile,
): CVProfile {
  const now = new Date().toISOString();
  return {
    ...cloneProfile(base),
    ...profile,
    id: profile.id ?? createId(),
    name: profile.name ?? "Creativise CV Builder CV",
    personalInfo: {
      ...cloneProfile(base).personalInfo,
      ...profile.personalInfo,
    },
    settings: {
      ...cloneProfile(base).settings,
      ...profile.settings,
    },
    experience: profile.experience ?? [],
    education: profile.education ?? [],
    skills: profile.skills ?? [],
    projects: profile.projects ?? [],
    languages: profile.languages ?? [],
    customSections: profile.customSections ?? [],
    createdAt: profile.createdAt ?? now,
    updatedAt: now,
  };
}

export function CVProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<CVProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving">(
    "saved",
  );

  useEffect(() => {
    let loadedData: StoredProfiles | null = null;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (!isStoredProfiles(parsed)) {
          throw new Error("Stored CV data does not match the expected schema.");
        }
        loadedData = parsed;
      }
    } catch (error) {
      console.error("Unable to load CV profiles from localStorage.", error);
    } finally {
      window.setTimeout(() => {
        if (loadedData) {
          setProfiles(loadedData.profiles.map(normalizeProfile));
          setActiveProfileId(loadedData.activeProfileId);
        } else {
          // First-time visit: seed a sample CV so users land on a ready-to-edit
          // profile instead of an empty editor. It is persisted to localStorage
          // automatically by the save effect below.
          const sample = cloneProfile(sampleCVProfile);
          setProfiles([sample]);
          setActiveProfileId(sample.id);
        }
        setIsLoaded(true);
      }, 0);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      const stored: StoredProfiles = { profiles, activeProfileId };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      window.setTimeout(() => setAutoSaveStatus("saved"), 0);
    } catch (error) {
      console.error("Unable to save CV profiles to localStorage.", error);
    }
  }, [activeProfileId, isLoaded, profiles]);

  const activeCV =
    profiles.find((profile) => profile.id === activeProfileId) ?? null;

  const createProfile = useCallback((profile: Partial<CVProfile> = {}) => {
    const newProfile = createProfileFrom(profile);
    setAutoSaveStatus("saving");
    setProfiles((current) => [...current, newProfile]);
    setActiveProfileId(newProfile.id);
    return newProfile;
  }, []);

  const duplicateProfile = useCallback(
    (profileId = activeProfileId) => {
      const source = profiles.find((profile) => profile.id === profileId);
      if (!source) return null;

      const duplicate = createProfileFrom(
        {
          ...cloneProfile(source),
          id: createId(),
          name: `${source.name} Copy`,
        },
        source,
      );
      setAutoSaveStatus("saving");
      setProfiles((current) => [...current, duplicate]);
      setActiveProfileId(duplicate.id);
      return duplicate;
    },
    [activeProfileId, profiles],
  );

  const deleteProfile = useCallback(
    (profileId = activeProfileId) => {
      if (!profileId) return;
      setAutoSaveStatus("saving");
      setProfiles((current) => {
        const remaining = current.filter((profile) => profile.id !== profileId);
        if (profileId === activeProfileId) {
          setActiveProfileId(remaining[0]?.id ?? null);
        }
        return remaining;
      });
    },
    [activeProfileId],
  );

  const switchProfile = useCallback((profileId: string) => {
    setActiveProfileId((current) => (current === profileId ? current : profileId));
  }, []);

  const updateActiveCV = useCallback(
    (updates: Partial<CVProfile> | ((profile: CVProfile) => CVProfile)) => {
      if (!activeProfileId) return;
      setAutoSaveStatus("saving");
      setProfiles((current) =>
        current.map((profile) => {
          if (profile.id !== activeProfileId) return profile;
          const next =
            typeof updates === "function" ? updates(profile) : { ...profile, ...updates };
          return { ...next, id: profile.id, updatedAt: new Date().toISOString() };
        }),
      );
    },
    [activeProfileId],
  );

  const exportAsJSON = useCallback(() => {
    if (!activeCV) return;
    const blob = new Blob([JSON.stringify(activeCV, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeCV.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "cv"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [activeCV]);

  const importFromJSON = useCallback(async (file: File) => {
    const parsed: unknown = JSON.parse(await file.text());
    if (!isCVProfile(parsed)) {
      throw new Error("The selected file is not a valid CV profile.");
    }
    const imported = createProfileFrom(
      { ...parsed, id: createId(), name: `${parsed.name} Imported` },
      parsed,
    );
    setAutoSaveStatus("saving");
    setProfiles((current) => [...current, imported]);
    setActiveProfileId(imported.id);
  }, []);

  const loadSampleData = useCallback(() => {
    const sample = cloneProfile(sampleCVProfile);
    if (!activeProfileId) {
      setAutoSaveStatus("saving");
      setProfiles([sample]);
      setActiveProfileId(sample.id);
      return;
    }
    updateActiveCV(sample);
  }, [activeProfileId, updateActiveCV]);

  const value = useMemo<CVContextValue>(
    () => ({
      profiles,
      activeCV,
      activeProfileId,
      isLoaded,
      autoSaveStatus,
      createProfile,
      duplicateProfile,
      deleteProfile,
      switchProfile,
      updateActiveCV,
      exportAsJSON,
      importFromJSON,
      loadSampleData,
    }),
    [
      activeCV,
      activeProfileId,
      autoSaveStatus,
      createProfile,
      deleteProfile,
      duplicateProfile,
      exportAsJSON,
      importFromJSON,
      isLoaded,
      loadSampleData,
      profiles,
      switchProfile,
      updateActiveCV,
    ],
  );

  return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
}

export function useCV(): CVContextValue {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error("useCV must be used within a CVProvider.");
  }
  return context;
}

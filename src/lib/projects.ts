const STORAGE_KEY = "deployguard-projects";

export function loadProjects<T>(fallback: T[]): T[] {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const savedProjects = localStorage.getItem(STORAGE_KEY);

    if (!savedProjects) {
      return fallback;
    }

    return JSON.parse(savedProjects) as T[];
  } catch (error) {
    console.error("Failed to load projects:", error);
    return fallback;
  }
}

export function saveProjects<T>(projects: T[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(projects)
    );
  } catch (error) {
    console.error("Failed to save projects:", error);
  }
}
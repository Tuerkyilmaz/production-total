import type { ProjectItem } from '~/data/projects'

export async function usePublicProjects () {
  return useFetch<ProjectItem[]>('/api/projects', {
    key: 'projekte-oeffentlich',
    getCachedData (key, nuxtApp) {
      if (nuxtApp.isHydrating && nuxtApp.payload.data[key] !== undefined) {
        return nuxtApp.payload.data[key] as ProjectItem[]
      }
      return undefined
    }
  })
}

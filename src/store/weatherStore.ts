import { create } from 'zustand'
import type {
  DataTemplate, HistoryTask, WeatherQueryResult, ProfessionalQueryResult,
  WarningRule, WarningPushRecord,
} from '../types/weather'
import {
  MOCK_TEMPLATES, MOCK_HISTORY_TASKS, MOCK_WARNING_RULES, MOCK_PUSH_RECORDS,
} from '../data/mockData'

interface WeatherState {
  simpleQueryResult: WeatherQueryResult | null
  simpleQueryLoading: boolean
  professionalQueryResult: ProfessionalQueryResult | null
  professionalQueryLoading: boolean
  templates: DataTemplate[]
  historyTasks: HistoryTask[]
  warningRules: WarningRule[]
  pushRecords: WarningPushRecord[]
  userToken: string
  setSimpleQueryResult: (result: WeatherQueryResult | null) => void
  setSimpleQueryLoading: (loading: boolean) => void
  setProfessionalQueryResult: (result: ProfessionalQueryResult | null) => void
  setProfessionalQueryLoading: (loading: boolean) => void
  addTemplate: (template: DataTemplate) => void
  updateTemplate: (id: string, updates: Partial<DataTemplate>) => void
  deleteTemplate: (id: string) => void
  addHistoryTask: (task: HistoryTask) => void
  updateHistoryTask: (id: string, updates: Partial<HistoryTask>) => void
  updateWarningRule: (id: string, updates: Partial<WarningRule>) => void
  addWarningRule: (rule: WarningRule) => void
  deleteWarningRule: (id: string) => void
  setUserToken: (token: string) => void
}

export const useWeatherStore = create<WeatherState>((set) => ({
  simpleQueryResult: null,
  simpleQueryLoading: false,
  professionalQueryResult: null,
  professionalQueryLoading: false,
  templates: MOCK_TEMPLATES,
  historyTasks: MOCK_HISTORY_TASKS,
  warningRules: MOCK_WARNING_RULES,
  pushRecords: MOCK_PUSH_RECORDS,
  userToken: 'sk_xxxxxxxxxxxxxxxxxxxxxxxxxx',

  setSimpleQueryResult: (result) => set({ simpleQueryResult: result }),
  setSimpleQueryLoading: (loading) => set({ simpleQueryLoading: loading }),
  setProfessionalQueryResult: (result) => set({ professionalQueryResult: result }),
  setProfessionalQueryLoading: (loading) => set({ professionalQueryLoading: loading }),

  addTemplate: (template) => set((state) => ({ templates: [template, ...state.templates] })),
  updateTemplate: (id, updates) => set((state) => ({
    templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),
  deleteTemplate: (id) => set((state) => ({ templates: state.templates.filter((t) => t.id !== id) })),

  addHistoryTask: (task) => set((state) => ({ historyTasks: [task, ...state.historyTasks] })),
  updateHistoryTask: (id, updates) => set((state) => ({
    historyTasks: state.historyTasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),

  updateWarningRule: (id, updates) => set((state) => ({
    warningRules: state.warningRules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
  })),
  addWarningRule: (rule) => set((state) => ({ warningRules: [rule, ...state.warningRules] })),
  deleteWarningRule: (id) => set((state) => ({ warningRules: state.warningRules.filter((r) => r.id !== id) })),

  setUserToken: (token) => set({ userToken: token }),
}))

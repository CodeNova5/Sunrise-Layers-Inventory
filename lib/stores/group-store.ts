import axios from "axios";
import Group, { GroupModification } from "@/lib/@types/group";
import { createStore } from "zustand/vanilla";
import { toError } from "../errors";

export async function getGroup(id: string): Promise<Group> {
  try {
    const response = await axios.get(`/api/groups/${id}`);
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchGroups(): Promise<Group[]> {
  try {
    const response = await axios.get("/api/groups");
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateGroup(group: GroupModification): Promise<Group> {
  try {
    const response = await axios.put(`/api/groups/${group.id}`, group);
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
}

export interface GroupState {
  groups: Group[];
  status: "idle" | "loading" | "error";
  error: string | null;
}

export interface GroupActions {
  setGroups: (groups: Group[]) => void;
  getGroup: (id: string) => Promise<Group>;
  updateGroup: (group: GroupModification) => Promise<Group>;
}

export type GroupStore = GroupState & GroupActions;

export const initialGroupState: GroupState = {
  groups: [],
  status: "idle",
  error: null,
};

export const createGroupStore = (state: GroupState = initialGroupState) =>
  createStore<GroupStore>((set) => ({
    ...state,
    setGroups: (groups) => set({ groups }),
    getGroup: async (id: string) => {
      set({ status: "loading" });
      try {
        const group = await getGroup(id);
        set({ status: "idle" });
        return group;
      } catch (error) {
        const e = toError(error);
        set({ status: "error", error: e.message });
        throw error;
      }
    },
    updateGroup: async (group: GroupModification) => {
      set({ status: "loading" });
      try {
        const updatedGroup = await updateGroup(group);
        set({ status: "idle" });
        return updatedGroup;
      } catch (error) {
        const e = toError(error);
        set({ status: "error", error: e.message });
        throw error;
      }
    },
  }));

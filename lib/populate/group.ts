import Group from "../common/models/group";
import { groups as groupsData } from "../../data";

export default async function populateGroups() {
    const groups = [];
    for (let i = 0; i < groupsData.length; i++) {
        const data = groupsData[i];
        const group = new Group({
            name: data.name,
            description: data.description,
            permissions: data.permissions,
            members_ids: [],
        });
        await group.save();
        groups.push(group);
    }
    return groups;
}
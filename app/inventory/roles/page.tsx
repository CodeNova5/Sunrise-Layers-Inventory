"use client";
import React, { useState, useEffect } from "react";
import { MoveLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import GroupDisplay from "./components/group";
import Group from "@/lib/@types/group";
import { toast } from "react-toastify";
import { initialScopes, populateScopes } from "./utils";
import { useGroupStore } from "@/lib/providers/group-store-provider";

interface ScopeItem {
  action: string;
  label: string;
  description: string;
  checked: boolean;
}

interface UpdateResponse {
  message: string;
}

interface Scopes {
  [category: string]: {
    allChecked: boolean;
    items: ScopeItem[];
  };
}


const Roles = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [scopes, setScopes] = useState<Scopes>(initialScopes);
  const [originalName, setOriginalName] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [loading, setL] = useState(false);
  const {groups} = useGroupStore(state => state);


  useEffect(() => {
    if (selectedGroup) {
      setOriginalName(selectedGroup.name);
      setOriginalDescription(selectedGroup.description);
      const populatedScopes = populateScopes(selectedGroup.permissions);
      setScopes(populatedScopes);
      setName(selectedGroup.name);
      setDescription(selectedGroup.description);
    }
  }, [selectedGroup]);

  const handleScopeChange = (category: string, index: number | null = null) => {
    setScopes((prev) => {
      const newScopes = { ...prev };
      if (index === null) {
        // Toggle all items in the category
        const newAllChecked = !newScopes[category].allChecked;
        newScopes[category] = {
          allChecked: newAllChecked,
          items: newScopes[category].items.map((item) => ({
            ...item,
            checked: newAllChecked,
          })),
        };
      } else {
        // Toggle individual item
        newScopes[category] = {
          ...newScopes[category],
          items: newScopes[category].items.map((item, idx) =>
            idx === index ? { ...item, checked: !item.checked } : item
          ),
        };
        // Update allChecked based on individual items
        newScopes[category].allChecked = newScopes[category].items.every(
          (item) => item.checked
        );
      }
      return newScopes;
    });
  };

  const renderCheckboxes = () => {
    return (
      <div className="w-full">
        <h3 className="text-lg text-pri-6 font-semibold font-rambla mb-2">
          Scopes
        </h3>
        <div className="rounded-md border border-neu-3 bg-white p-4 flex flex-col gap-4">
          <p className="mb-4">
            These scopes define the authorization level of an employee and the
            data they&apos;re allowed to access. Each scope chosen will allow
            them to perform specific operations on the system.
          </p>
          {Object.entries(scopes).map(([category, { allChecked, items }]) => (
            <div key={category} className="pl-4 border-t border-neu-3 py-2">
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={() => handleScopeChange(category)}
                  className="mr-2"
                />
                <span className="font-semibold capitalize shrink-0">
                  {category}
                </span>
              </label>
              <div className="ml-4 grid grid-cols-1 gap-2">
                {items.map((scope, index) => (
                  <label key={index} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={scope.checked}
                      onChange={() => handleScopeChange(category, index)}
                      disabled={allChecked}
                      className="mr-2"
                    />
                    <span className="font-medium w-24 md:w-32 shrink-0">{scope.label}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      {scope.description}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      ({scope.action})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const updateGroup = async (groupId: string, groupData: Partial<Group>) => {
    try {
      const response = await axios.post(
        `/api/groups/${groupId}/update`,
        groupData
      );
      if (response.status !== 200) {
        throw response;
      }
      let data = response.data;
      return data;
    } catch (err) {
      return err;
    }
  };

  const reset = () => {
    setOriginalName(name);
    setOriginalDescription(description);
  };

  const handleSave = () => {
    if (!selectedGroup) return;
    const changes: Partial<Group> = {};
    let hasChanges = false;

    if (name !== originalName) {
      changes.name = name;
      hasChanges = true;
    }

    if (description !== originalDescription) {
      changes.description = description;
      hasChanges = true;
    }
    const newPermissions = Object.entries(scopes).reduce(
      (acc, [category, { allChecked, items }]) => {
        if (allChecked) {
          acc[category] = true;
        } else {
          const selectedActions = items
            .filter((item) => item.checked)
            .map((item) => item.action);
          if (selectedActions.length > 0) {
            acc[category] = selectedActions;
          }
        }
        return acc;
      },
      {} as Record<string, boolean | string[]>
    );

    if (
      JSON.stringify(newPermissions) !==
      JSON.stringify(selectedGroup.permissions)
    ) {
      changes.permissions = newPermissions;
      setSelectedGroup(
        (prevGroup) =>
          ({
            ...prevGroup,
            permissions: newPermissions,
          } as Group)
      );
      hasChanges = true;
    }

    if (!hasChanges) {
      toast.info("No changes detected");
      return;
    }
    setL(true);
    const promise = new Promise<UpdateResponse>((resolve, reject) => {
      updateGroup(selectedGroup.id, changes)
        .then((data) => {
          resolve(data);
          reset();
        })
        .catch((err) => {
          reject(err.response.data);
        })
        .finally(() => {
          reset();
          setL(false);
        });
    });

    toast.promise<UpdateResponse, UpdateResponse>(promise, {
      pending: "Updating...",
      success: {
        render: ({ data }) => data.message,
      },
      error: {
        render: ({ data }) => data.message || "An error occurred",
      },
    });
  };

  return (
    <div className="absolute h-[calc(100vh-60px)] top-[60px] w-full overflow-auto scrollbar-thin">
      {!selectedGroup ? (
        <div className="md:p-[30px] p-3">
          <ul className="grid grid-cols-1 md:grid-cols-2 items-start justify-start gap-5">
            {groups &&
              groups.map((g, i) => {
                return (
                  <GroupDisplay
                    key={i}
                    group={g}
                    setSelectedGroup={setSelectedGroup}
                    setScopes={setScopes}
                    setName={setName}
                    setDescription={setDescription}
                  />
                );
              })}
          </ul>
        </div>
      ) : (
        <div className="md:p-[30px] p-3 max-w-[700px]">
          <MoveLeft
            className="cursor-pointer transition-transform active:scale-90 text-pri-6"
            size={24}
            strokeWidth={2}
            onClick={() => {
              setSelectedGroup(null);
              setName("");
              setDescription("");
            }}
          />

          <div className="w-full flex flex-col items-start justify-start gap-4">
            <div className="w-full">
              <h3 className="text-lg text-pri-6 font-semibold font-rambla">
                Name
              </h3>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin"
                className="w-full border border-neu-3 rounded-md p-2 focus:outline-none focus:border-pri-6"
              />
            </div>
            <div className="w-full">
              <h3 className="text-lg text-pri-6 font-semibold font-rambla">
                Description
              </h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Admin description"
                rows={7}
                className="w-full border border-neu-3 rounded-md resize-none p-3 h-[150px] focus:outline-none focus:border-pri-6"
              ></textarea>
            </div>
            {renderCheckboxes()}
            <Button disabled={loading} onClick={handleSave} className="mt-4">
              Save
            </Button>
            {/* <div>
              <h3 className="text-lg text-pri-6 font-semibold font-rambla">
                Delete Role
              </h3>
              <div className="flex flex-row justify-between items-center gap-3">
                <span>
                  This will delete{" "}
                  <span className="text-red-500 font-semibold capitalize text-[18px]">
                    {selectedGroup?.name}
                  </span>{" "}
                  from the system. Any one with this group will lose all
                  permissions associated with it. This action is{" "}
                  <span className="text-red-500 font-semibold">permanent</span>
                </span>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete this role</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete this role and deactivate all permissions
                        associated with it
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-row flex-wrap justify-evenly items-center gap-4">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction asChild className="bg-red-500">
                        <Button variant="destructive">Delete</Button>
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;

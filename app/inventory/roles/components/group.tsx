import * as React from "react";
import { Button } from "@/components/ui/button";
import Group from "@/lib/@types/group";
import { populateScopes, Scopes } from "../utils";

type GroupProps = {
  group: Group;
  setSelectedGroup: (group: Group) => void;
  setScopes: (scopes: Scopes) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
};


export default function GroupDisplay({
  group: g,
  setSelectedGroup,
  setScopes,
  setName,
  setDescription,
}: GroupProps) {
  return (
    <li className="w-full h-full bg-white flex flex-col gap-3 rounded-md shadow-md p-4 items-start justify-between">
      <div className="flex items-baseline gap-4">
        <h3 className="text-lg text-pri-6 font-semibold font-quicksand capitalize">
          {g.name}
        </h3>
        <Button
          variant="outline"
          className="text-sm py-2 px-2"
          onClick={() => {
            console.log("Selected Group:", g);
            setSelectedGroup(g);
            setScopes(populateScopes(g.permissions));
            setName(g.name);
            setDescription(g.description);
          }}
        >
          Manage
        </Button>
      </div>

      <p className="font-lato text-xl">{g.description}</p>
      <ul className="flex flex-row flex-wrap gap-2">
        {Object.keys(g.permissions).map((val, idx) => {
          return (
            <li
              key={idx}
              className="bg-acc-6 text-black w-auto p-1 px-2 text-sm rounded-md"
            >
              {val}
            </li>
          );
        })}
      </ul>
    </li>
  );
}
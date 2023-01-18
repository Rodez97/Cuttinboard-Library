import { RoleAccessLevels } from "./utils";

type locationData = {
  id: string;
  name: string;
  role: RoleAccessLevels;
  organizationId: string;
};

declare global {
  /* eslint-disable no-var */
  var locationData: locationData;
}

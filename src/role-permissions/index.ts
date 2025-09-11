import { CustomResource } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Role } from "./../role";
import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface RolePermissionsProps extends Auth0Props {
	/**
	 * Rhe role to add permissions to.
	 */
	readonly role: Role;
	/**
	 * array of resource_server_identifier, permission_name pairs.
	 */
	readonly permissions: Array<PermissionProps>;
}

export interface PermissionProps {
	/**
	 * Resource server (API) identifier that this permission is for.
	 */
	readonly resourceServerIdentifier: string;
	/**
	 * Name of this permission.
	 */
	readonly permissionName: string;
}

/**
 * @category Constructs
 */
export class RolePermissions extends CustomResource {
	constructor(scope: Construct, id: string, props: RolePermissionsProps) {
		super(scope, id, {
			resourceType: "Custom::Auth0Client",
			serviceToken: Provider.getOrCreate(scope, props.apiSecret),
			properties: {
				secretName: props.apiSecret.secretName,
				roleId: props.role.roleId,
				permissions: props.permissions || [],
			},
		});
	}
}

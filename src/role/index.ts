import { CustomResource, Names } from "aws-cdk-lib";
import { Provider } from "./provider";
import { Auth0Props } from "../auth0-props";
import { Construct } from "constructs";

interface RoleBaseProps extends Auth0Props {
	readonly roleId?: string;
	readonly name?: string;
	readonly description?: string;
}

class RoleBase extends CustomResource {
	public readonly roleId = this.getAttString("roleId");

	constructor(scope: Construct, id: string, props: RoleBaseProps) {
		super(scope, id, {
			resourceType: "Custom::Auth0Client",
			serviceToken: Provider.getOrCreate(scope, props.apiSecret),
			properties: {
				secretName: props.apiSecret.secretName,
				roleId: props.roleId,
				name:
					props.name ||
					`${Names.uniqueResourceName(scope, {
						maxLength: 127 - id.length,
						allowedSpecialCharacters: "-",
						separator: "-",
					})}-${id}`,
				description: props.description,
			},
		});
	}
}

export interface RoleProps extends Auth0Props {
	/**
	 * Name of the role.
	 */
	readonly name?: string;
	/**
	 * Description of the role
	 */
	readonly description?: string;
}

export interface RoleFromIdProps extends RoleProps {
	/**
	 * Id of the role.
	 */
	readonly roleId: string;
}

/**
 * @category Constructs
 */
export class Role extends RoleBase {
	constructor(scope: Construct, id: string, props: RoleProps) {
		super(scope, id, { ...props });
	}

	/**
	 * @experimental
	 */
	static fromRoleId(scope: Construct, id: string, props: RoleFromIdProps) {
		return new RoleBase(scope, id, props) as Role;
	}
}

import { Construct } from "constructs";
import { CustomResource } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface ColorProps {
	readonly baseFocusColor?: string;
	readonly baseHoverColor?: string;
	readonly bodyText?: string;
	readonly captchaWidgetTheme?: "auto" | "dark" | "light";
	readonly errorColor?: string;
	readonly header?: string;
	readonly icons?: string;
	readonly inputBackground?: string;
	readonly inputBorder?: string;
	readonly inputFilledText?: string;
	readonly inputLabelsPlaceholders?: string;
	readonly linksFocusedComponents?: string;
	readonly primaryButton?: string;
	readonly primaryButtonLabel?: string;
	readonly secondaryButtonBorder?: string;
	readonly secondaryButtonLabel?: string;
	readonly successColor?: string;
	readonly widgetBackground?: string;
	readonly widgetBorder?: string;
}

export interface TextProps {
	readonly bold?: boolean;
	readonly size?: number;
}

export interface FontProps {
	readonly bodyText?: TextProps;
	readonly buttonsText?: TextProps;
	readonly fontUrl?: string;
	readonly inputLabels?: TextProps;
	readonly links?: TextProps;
	readonly linksStyle?: "normal" | "underlined";
	readonly referenceTextSize?: number;
	readonly subtitle?: TextProps;
	readonly title?: TextProps;
}

export interface BordersProps {
	readonly buttonBorderRadius?: number;
	readonly buttonBorderWeight?: number;
	readonly buttonsStyle?: "pill" | "rounded" | "sharp";
	readonly inputBorderRadius?: number;
	readonly inputBorderWeight?: number;
	readonly inputsStyle?: "pill" | "rounded" | "sharp";
	readonly showWidgetShadow?: boolean;
	readonly widgetBorderWeight?: number;
	readonly widgetCornerRadius?: number;
}

export interface WidgetProps {
	readonly headerTextAlignment?: "center" | "left" | "right";
	readonly logoHeight?: number;
	readonly logoPosition?: "center" | "left" | "none" | "right";
	readonly logoUrl?: string;
	readonly socialButtonsLayout?: "bottom" | "top";
}

export interface PageBackgroundProps {
	readonly backgroundColor?: string;
	readonly backgroundImageUrl?: string;
	readonly pageLayout?: "center" | "left" | "right";
}

export interface BrandingThemenProps extends Auth0Props {
	readonly displayName: string;
	readonly colors?: ColorProps;
	readonly fonts?: FontProps;
	readonly borders?: BordersProps;
	readonly widget?: WidgetProps;
	readonly pageBackground?: PageBackgroundProps;
}

/**
 * @category Constructs
 */
export class BrandingTheme extends CustomResource {
	public readonly brandingThemeId = this.getAttString("brandingThemeId");

	constructor(scope: Construct, id: string, props: BrandingThemenProps) {
		super(scope, id, {
			resourceType: "Custom::Auth0Action",
			serviceToken: Provider.getOrCreate(scope, props.apiSecret),
			properties: {
				secretName: props.apiSecret.secretName,
				displayName: props.displayName,
				colors: {
					baseFocusColor: props.colors?.baseFocusColor || "#635dff",
					baseHoverColor: props.colors?.baseHoverColor || "#000000",
					bodyText: props.colors?.bodyText || "#1e212a",
					captchaWidgetTheme: props.colors?.captchaWidgetTheme || "light",
					error: props.colors?.errorColor || "#d03c38",
					header: props.colors?.header || "#1e212a",
					icons: props.colors?.icons || "#65676e",
					inputBackground: props.colors?.inputBackground || "#ffffff",
					inputBorder: props.colors?.inputBorder || "#c9cace",
					inputFilledText: props.colors?.inputFilledText || "#000000",
					inputLabelsPlaceholders:
						props.colors?.inputLabelsPlaceholders || "#65676e",
					linksFocusedComponents:
						props.colors?.linksFocusedComponents || "#635dff",
					primaryButton: props.colors?.primaryButton || "#635dff",
					primaryButtonLabel: props.colors?.primaryButtonLabel || "#ffffff",
					secondaryButtonBorder:
						props.colors?.secondaryButtonBorder || "#c9cace",
					secondaryButtonLabel: props.colors?.secondaryButtonLabel || "#1e212a",
					success: props.colors?.successColor || "#13a688",
					widgetBackground: props.colors?.widgetBackground || "#ffffff",
					widgetBorder: props.colors?.widgetBorder || "#c9cace",
				},
				fonts: {
					bodyText: {
						bold: props.fonts?.bodyText?.bold || false,
						size: props.fonts?.bodyText?.size || 87.5,
					},
					buttonsText: {
						bold: props.fonts?.buttonsText?.bold || false,
						size: props.fonts?.buttonsText?.size || 100,
					},
					fontUrl: props.fonts?.fontUrl || "",
					inputLabels: {
						bold: props.fonts?.inputLabels?.bold || false,
						size: props.fonts?.inputLabels?.size || 100,
					},
					links: {
						bold: props.fonts?.links?.bold || true,
						size: props.fonts?.links?.size || 87.5,
					},
					linksStyle: props.fonts?.linksStyle || "normal",
					referenceTextSize: props.fonts?.referenceTextSize || 16,
					subtitle: {
						bold: props.fonts?.subtitle?.bold || false,
						size: props.fonts?.subtitle?.size || 87.5,
					},
					title: {
						bold: props.fonts?.title?.bold || false,
						size: props.fonts?.title?.size || 150,
					},
				},
				borders: {
					buttonBorderRadius: props.borders?.buttonBorderRadius || 3,
					buttonBorderWeight: props.borders?.buttonBorderWeight || 1,
					buttonsStyle: props.borders?.buttonsStyle || "rounded",
					inputBorderRadius: props.borders?.inputBorderRadius || 3,
					inputBorderWeight: props.borders?.inputBorderWeight || 1,
					inputsStyle: props.borders?.inputsStyle || "rounded",
					showWidgetShadow: props.borders?.showWidgetShadow || true,
					widgetBorderWeight: props.borders?.widgetBorderWeight || 0,
					widgetCornerRadius: props.borders?.widgetCornerRadius || 5,
				},
				widget: {
					headerTextAlignment: props.widget?.headerTextAlignment || "center",
					logoHeight: props.widget?.logoHeight || 52,
					logoPosition: props.widget?.logoPosition || "center",
					logoUrl: props.widget?.logoUrl || "",
					socialButtonsLayout: props.widget?.socialButtonsLayout || "bottom",
				},
				pageBackground: {
					backgroundColor: props.pageBackground?.backgroundColor || "#000000",
					backgroundImageUrl: props.pageBackground?.backgroundImageUrl || "",
					pageLayout: props.pageBackground?.pageLayout || "center",
				},
			},
		});
	}
}

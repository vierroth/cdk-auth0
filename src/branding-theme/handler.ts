import type { CdkCustomResourceEvent } from "aws-lambda";
import { ManagementClient } from "auth0";

import type { ENV } from "./../lambda-base";
import { getSecretValue } from "./../get-secret-value";

declare global {
	namespace NodeJS {
		interface ProcessEnv extends ENV {}
	}
}

export async function handler(event: CdkCustomResourceEvent) {
	const auth0Api = JSON.parse(
		await getSecretValue(
			event.ResourceProperties.secretName,
			process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT,
			process.env.AWS_SESSION_TOKEN,
		),
	);

	const auth0 = new ManagementClient({
		domain: auth0Api.domain,
		clientId: auth0Api.clientId,
		clientSecret: auth0Api.clientSecret,
	});

	switch (event.RequestType) {
		case "Create": {
			const id = (
				await auth0.branding.createTheme({
					displayName: event.ResourceProperties.displayName,
					colors: {
						base_focus_color: event.ResourceProperties.colors.baseFocusColor,
						base_hover_color: event.ResourceProperties.colors.baseHoverColor,
						body_text: event.ResourceProperties.colors.bodyText,
						error: event.ResourceProperties.colors.error,
						header: event.ResourceProperties.colors.header,
						icons: event.ResourceProperties.colors.icons,
						input_background: event.ResourceProperties.colors.inputBackground,
						input_border: event.ResourceProperties.colors.inputBorder,
						input_filled_text: event.ResourceProperties.colors.inputFilledText,
						input_labels_placeholders:
							event.ResourceProperties.colors.inputLabelsPlaceholders,
						links_focused_components:
							event.ResourceProperties.colors.linksFocusedComponents,
						primary_button: event.ResourceProperties.colors.primaryButton,
						primary_button_label:
							event.ResourceProperties.colors.primaryButtonLabel,
						secondary_button_border:
							event.ResourceProperties.colors.secondaryButtonBorder,
						secondary_button_label:
							event.ResourceProperties.colors.secondaryButtonLabel,
						success: event.ResourceProperties.colors.success,
						widget_background: event.ResourceProperties.colors.widgetBackground,
						widget_border: event.ResourceProperties.colors.widgetBorder,
					},
					fonts: {
						body_text: {
							bold: event.ResourceProperties.fonts.bodyText.bold === "true",
							size: Number(event.ResourceProperties.fonts.bodyText.size),
						},
						buttons_text: {
							bold: event.ResourceProperties.fonts.buttonsText.bold === "true",
							size: Number(event.ResourceProperties.fonts.buttonsText.size),
						},
						font_url: event.ResourceProperties.fonts.fontUrl,
						input_labels: {
							bold: event.ResourceProperties.fonts.inputLabels.bold === "true",
							size: Number(event.ResourceProperties.fonts.inputLabels.size),
						},
						links: {
							bold: event.ResourceProperties.fonts.links.bold === "true",
							size: Number(event.ResourceProperties.fonts.links.size),
						},
						links_style: event.ResourceProperties.fonts.linksStyle,
						reference_text_size: Number(
							event.ResourceProperties.fonts.referenceTextSize,
						),
						subtitle: {
							bold: event.ResourceProperties.fonts.subtitle.bold === "true",
							size: Number(event.ResourceProperties.fonts.subtitle.size),
						},
						title: {
							bold: event.ResourceProperties.fonts.title.bold === "true",
							size: Number(event.ResourceProperties.fonts.title.size),
						},
					},
					borders: {
						button_border_radius: Number(
							event.ResourceProperties.borders.buttonBorderRadius,
						),
						button_border_weight: Number(
							event.ResourceProperties.borders.buttonBorderWeight,
						),
						buttons_style: event.ResourceProperties.borders.buttonsStyle,
						input_border_radius: Number(
							event.ResourceProperties.borders.inputBorderRadius,
						),
						input_border_weight: Number(
							event.ResourceProperties.borders.inputBorderWeight,
						),
						inputs_style: event.ResourceProperties.borders.inputsStyle,
						show_widget_shadow:
							event.ResourceProperties.borders.showWidgetShadow === "true",
						widget_border_weight: Number(
							event.ResourceProperties.borders.widgetBorderWeight,
						),
						widget_corner_radius: Number(
							event.ResourceProperties.borders.widgetCornerRadius,
						),
					},
					widget: {
						header_text_alignment:
							event.ResourceProperties.widget.headerTextAlignment,
						logo_height: Number(event.ResourceProperties.widget.logoHeight),
						logo_position: event.ResourceProperties.widget.logoPosition,
						logo_url: event.ResourceProperties.widget.logoUrl,
						social_buttons_layout:
							event.ResourceProperties.widget.socialButtonsLayout,
					},
					page_background: {
						background_color:
							event.ResourceProperties.pageBackground.backgroundColor,
						background_image_url:
							event.ResourceProperties.pageBackground.backgroundImageUrl,
						page_layout: event.ResourceProperties.pageBackground.pageLayout,
					},
				})
			).data.themeId;

			return {
				PhysicalResourceId: id,
				Data: {
					brandingThemeId: id,
				},
			};
		}
		case "Update": {
			await auth0.branding.updateTheme(
				{ themeId: event.PhysicalResourceId },
				{
					displayName: event.ResourceProperties.displayName,
					colors: {
						base_focus_color: event.ResourceProperties.colors.baseFocusColor,
						base_hover_color: event.ResourceProperties.colors.baseHoverColor,
						body_text: event.ResourceProperties.colors.bodyText,
						error: event.ResourceProperties.colors.error,
						header: event.ResourceProperties.colors.header,
						icons: event.ResourceProperties.colors.icons,
						input_background: event.ResourceProperties.colors.inputBackground,
						input_border: event.ResourceProperties.colors.inputBorder,
						input_filled_text: event.ResourceProperties.colors.inputFilledText,
						input_labels_placeholders:
							event.ResourceProperties.colors.inputLabelsPlaceholders,
						links_focused_components:
							event.ResourceProperties.colors.linksFocusedComponents,
						primary_button: event.ResourceProperties.colors.primaryButton,
						primary_button_label:
							event.ResourceProperties.colors.primaryButtonLabel,
						secondary_button_border:
							event.ResourceProperties.colors.secondaryButtonBorder,
						secondary_button_label:
							event.ResourceProperties.colors.secondaryButtonLabel,
						success: event.ResourceProperties.colors.success,
						widget_background: event.ResourceProperties.colors.widgetBackground,
						widget_border: event.ResourceProperties.colors.widgetBorder,
					},
					fonts: {
						body_text: {
							bold: event.ResourceProperties.fonts.bodyText.bold === "true",
							size: Number(event.ResourceProperties.fonts.bodyText.size),
						},
						buttons_text: {
							bold: event.ResourceProperties.fonts.buttonsText.bold === "true",
							size: Number(event.ResourceProperties.fonts.buttonsText.size),
						},
						font_url: event.ResourceProperties.fonts.fontUrl,
						input_labels: {
							bold: event.ResourceProperties.fonts.inputLabels.bold === "true",
							size: Number(event.ResourceProperties.fonts.inputLabels.size),
						},
						links: {
							bold: event.ResourceProperties.fonts.links.bold === "true",
							size: Number(event.ResourceProperties.fonts.links.size),
						},
						links_style: event.ResourceProperties.fonts.linksStyle,
						reference_text_size: Number(
							event.ResourceProperties.fonts.referenceTextSize,
						),
						subtitle: {
							bold: event.ResourceProperties.fonts.subtitle.bold === "true",
							size: Number(event.ResourceProperties.fonts.subtitle.size),
						},
						title: {
							bold: event.ResourceProperties.fonts.title.bold === "true",
							size: Number(event.ResourceProperties.fonts.title.size),
						},
					},
					borders: {
						button_border_radius: Number(
							event.ResourceProperties.borders.buttonBorderRadius,
						),
						button_border_weight: Number(
							event.ResourceProperties.borders.buttonBorderWeight,
						),
						buttons_style: event.ResourceProperties.borders.buttonsStyle,
						input_border_radius: Number(
							event.ResourceProperties.borders.inputBorderRadius,
						),
						input_border_weight: Number(
							event.ResourceProperties.borders.inputBorderWeight,
						),
						inputs_style: event.ResourceProperties.borders.inputsStyle,
						show_widget_shadow:
							event.ResourceProperties.borders.showWidgetShadow === "true",
						widget_border_weight: Number(
							event.ResourceProperties.borders.widgetBorderWeight,
						),
						widget_corner_radius: Number(
							event.ResourceProperties.borders.widgetCornerRadius,
						),
					},
					widget: {
						header_text_alignment:
							event.ResourceProperties.widget.headerTextAlignment,
						logo_height: Number(event.ResourceProperties.widget.logoHeight),
						logo_position: event.ResourceProperties.widget.logoPosition,
						logo_url: event.ResourceProperties.widget.logoUrl,
						social_buttons_layout:
							event.ResourceProperties.widget.socialButtonsLayout,
					},
					page_background: {
						background_color:
							event.ResourceProperties.pageBackground.backgroundColor,
						background_image_url:
							event.ResourceProperties.pageBackground.backgroundImageUrl,
						page_layout: event.ResourceProperties.pageBackground.pageLayout,
					},
				},
			);

			return {
				PhysicalResourceId: event.PhysicalResourceId,
				Data: {
					brandingThemeId: event.PhysicalResourceId,
				},
			};
		}
		case "Delete": {
			await auth0.branding.deleteTheme({ themeId: event.PhysicalResourceId });

			return {
				PhysicalResourceId: event.PhysicalResourceId,
			};
		}
		default: {
			throw new Error("Invalid request type");
		}
	}
}

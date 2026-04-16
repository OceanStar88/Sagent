declare module "*.css";

interface Window {
	google?: {
		accounts?: {
			id: {
				initialize: (options: {
					client_id: string;
					callback: (response: { credential: string }) => void;
					context?: string;
					ux_mode?: string;
					auto_select?: boolean;
				}) => void;
				renderButton: (
					parent: HTMLElement,
					options: {
						theme?: string;
						size?: string;
						shape?: string;
						width?: number;
						text?: string;
						logo_alignment?: string;
					},
				) => void;
			};
		};
	};
}
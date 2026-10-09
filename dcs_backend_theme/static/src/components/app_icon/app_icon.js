import { Component } from "@odoo/owl";

/**
 * Renders an application icon from the menu payload:
 * - `webIconData`: image (data URI or URL)
 * - `webIcon` "fa-class,color,background": font icon on a colored tile
 */
export class AppIcon extends Component {
    static template = "dcs_backend_theme.AppIcon";
    static props = {
        app: Object,
        size: { type: String, optional: true }, // "sm" | "md" | "lg"
    };
    static defaultProps = { size: "md" };

    get fontIcon() {
        const { webIcon, webIconData } = this.props.app;
        if (webIconData || !webIcon) {
            return null;
        }
        const [iconClass, color, background] = webIcon.split(",");
        if (!iconClass || !iconClass.startsWith("fa")) {
            return null;
        }
        return { iconClass, color: color || "#fff", background: background || "var(--cbt-primary)" };
    }

    get imageSrc() {
        return this.props.app.webIconData || "/web/static/img/default_icon_app.png";
    }

    get initials() {
        return (this.props.app.name || "?").trim().slice(0, 1).toUpperCase();
    }
}

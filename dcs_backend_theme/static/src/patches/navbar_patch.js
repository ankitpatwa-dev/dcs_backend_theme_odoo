import { useEffect, useState } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";
import { patch } from "@web/core/utils/patch";
import { NavBar } from "@web/webclient/navbar/navbar";

/**
 * Isolated NavBar patch: replaces the desktop apps dropdown with the app
 * drawer launcher and adds a sidebar toggle. Mobile (ui.isSmall) keeps
 * Odoo's own burger menu untouched.
 */
patch(NavBar.prototype, {
    setup() {
        super.setup(...arguments);
        this.cbtTheme = useService("cbt_theme");
        this.cbtPrefs = useState(this.cbtTheme.prefs);
        this.cbtUi = useState(this.cbtTheme.ui);
        // Section visibility depends on the navigation mode: re-run Odoo's
        // overflow computation ("more" menu) whenever it changes.
        useEffect(
            () => {
                this.adapt();
            },
            () => [this.cbtPrefs.cbt_nav_mode, this.cbtPrefs.cbt_sidebar_mode]
        );
        this.cbtLabels = {
            apps: _t("Apps"),
            home: _t("Home Menu"),
            sidebar: _t("Toggle sidebar"),
        };
    },

    get cbtShowSidebarToggle() {
        return this.cbtPrefs.cbt_nav_mode === "vertical" && !this.ui.isSmall;
    },

    cbtOpenDrawer() {
        this.cbtTheme.togglePanel("drawer");
    },

    cbtToggleSidebar() {
        if (this.cbtPrefs.cbt_sidebar_mode === "collapsed") {
            this.cbtUi.sidebarPeek = !this.cbtUi.sidebarPeek;
            return;
        }
        const next = this.cbtPrefs.cbt_sidebar_mode === "expanded" ? "mini" : "expanded";
        this.cbtUi.sidebarPeek = false;
        this.cbtTheme.setPref("cbt_sidebar_mode", next);
    },
});
